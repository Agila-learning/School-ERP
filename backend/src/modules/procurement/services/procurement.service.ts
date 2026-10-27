import mongoose from 'mongoose';
import PurchaseRequest from '../models/PurchaseRequest.model';
import PurchaseOrder from '../models/PurchaseOrder.model';
import GoodsReceipt from '../models/GoodsReceipt.model';
import { InventoryService } from '../../inventory/services/inventory.service';
import Item from '../../inventory/models/Item.model';
import Asset from '../../assets/models/Asset.model';
import { ValidationError } from '../../../core/errors/AppError';

export class ProcurementService {
  
  static async approvePurchaseRequest(requestId: string, tenantId: mongoose.Types.ObjectId, approvedBy: mongoose.Types.ObjectId) {
    const pr = await PurchaseRequest.findOneAndUpdate(
      { _id: requestId, tenantId, status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] } },
      { status: 'APPROVED', approvedBy, approvalDate: new Date() },
      { new: true }
    );
    if (!pr) throw new ValidationError('PR not found or not in valid status to approve');
    return pr;
  }

  static async convertPRtoPO(requestId: string, vendorId: mongoose.Types.ObjectId, branchId: mongoose.Types.ObjectId, tenantId: mongoose.Types.ObjectId, createdBy: mongoose.Types.ObjectId) {
    const pr = await PurchaseRequest.findOne({ _id: requestId, tenantId, status: 'APPROVED' });
    if (!pr) throw new ValidationError('PR must be APPROVED before conversion');

    const items = pr.items.map((item: any) => ({
      itemId: item.itemId,
      purchaseRequestId: pr._id,
      quantity: item.quantity,
      unitPrice: item.estimatedUnitCost || 0, // Should ideally be updated by vendor quote
      totalAmount: (item.estimatedUnitCost || 0) * item.quantity
    }));

    const subTotal = items.reduce((sum: any, item: any) => sum + item.totalAmount, 0);

    const po = await PurchaseOrder.create({
      tenantId,
      poNumber: `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`, // Basic gen
      vendorId,
      branchId,
      items,
      deliveryDate: pr.requiredDate,
      subTotal,
      grandTotal: subTotal,
      status: 'DRAFT',
      approvedBy: createdBy
    });

    pr.status = 'ORDERED';
    await pr.save();

    return po;
  }

  static async createGoodsReceipt(poId: string, warehouseId: mongoose.Types.ObjectId, receivedItems: any[], tenantId: mongoose.Types.ObjectId, receivedBy: mongoose.Types.ObjectId) {
    const po = await PurchaseOrder.findOne({ _id: poId, tenantId, status: { $in: ['APPROVED', 'SENT', 'PARTIALLY_RECEIVED'] } });
    if (!po) throw new ValidationError('Invalid PO for GRN');

    const grnItems = [];

    // Validations and tracking quantities
    for (const poItem of po.items) {
      const receivedInput = receivedItems.find((i: any) => i.itemId.toString() === poItem.itemId.toString());
      if (receivedInput) {
        grnItems.push({
          itemId: poItem.itemId,
          orderedQuantity: poItem.quantity,
          receivedQuantity: receivedInput.quantity,
          acceptedQuantity: receivedInput.quantity, // Simple flow: accept all received
          rejectedQuantity: 0,
          damagedQuantity: 0,
        });

        // Add to Inventory
        await InventoryService.updateStock({
          tenantId,
          itemId: poItem.itemId as mongoose.Types.ObjectId,
          warehouseId,
          quantity: receivedInput.quantity,
          transactionType: 'RECEIPT',
          referenceDocumentType: 'PURCHASE_ORDER',
          referenceDocumentId: po._id as mongoose.Types.ObjectId,
          performedBy: receivedBy
        });

        // If ASSET, create individual asset records
        const itemDef = await Item.findById(poItem.itemId);
        if (itemDef && itemDef.itemType === 'ASSET') {
          for (let i = 0; i < receivedInput.quantity; i++) {
            await Asset.create({
              tenantId,
              assetTag: `AST-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`,
              itemId: itemDef._id,
              purchaseOrderId: po._id,
              vendorId: po.vendorId,
              purchaseDate: new Date(),
              branchId: po.branchId,
              status: 'AVAILABLE'
            });
          }
        }
      }
    }

    const grn = await GoodsReceipt.create({
      tenantId,
      grnNumber: `GRN-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      purchaseOrderId: po._id,
      vendorId: po.vendorId,
      warehouseId,
      items: grnItems,
      receivedBy,
      status: 'VERIFIED'
    });

    // Simple status update
    po.status = 'RECEIVED';
    await po.save();

    return grn;
  }
}
