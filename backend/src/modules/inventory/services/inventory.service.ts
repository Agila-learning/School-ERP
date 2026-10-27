import mongoose from 'mongoose';
import StockBalance from '../models/StockBalance.model';
import StockTransaction from '../models/StockTransaction.model';
import Item from '../models/Item.model';
import StockIssue from '../models/StockIssue.model';
import StockReturn from '../models/StockReturn.model';
import StockTransfer from '../models/StockTransfer.model';
import StockAdjustment from '../models/StockAdjustment.model';
import { ValidationError } from '../../../core/errors/AppError';

export class InventoryService {
  
  /**
   * Core atomic method to update stock balance and append transaction
   */
  static async updateStock(params: {
    tenantId: mongoose.Types.ObjectId;
    itemId: mongoose.Types.ObjectId;
    warehouseId: mongoose.Types.ObjectId;
    locationId?: mongoose.Types.ObjectId;
    quantity: number; // positive for in, negative for out
    transactionType: 'OPENING' | 'RECEIPT' | 'ISSUE' | 'RETURN' | 'TRANSFER' | 'ADJUSTMENT' | 'CONSUMPTION' | 'DISPOSAL';
    referenceDocumentType?: string;
    referenceDocumentId?: mongoose.Types.ObjectId;
    performedBy: mongoose.Types.ObjectId;
    reason?: string;
    batchNumber?: string;
    serialNumber?: string;
  }) {
    const { tenantId, itemId, warehouseId, locationId, quantity, transactionType, ...rest } = params;

    const item = await Item.findOne({ _id: itemId, tenantId });
    if (!item) throw new ValidationError('Item not found');
    
    if (!item.trackStock) {
      // If we don't track stock for this item, we might just log the transaction or do nothing.
      // We'll just log it for audit purposes.
      await StockTransaction.create({
        tenantId, itemId, warehouseId, locationId, quantity, transactionType, ...rest
      });
      return;
    }

    // 1. Find or create balance record
    const filter = {
      tenantId,
      itemId,
      warehouseId,
      locationId: locationId || undefined, // undefined if not specific location
      ...(rest.batchNumber && { batchNumber: rest.batchNumber }),
      ...(rest.serialNumber && { serialNumber: rest.serialNumber }),
    };

    let balance = await StockBalance.findOne(filter);
    if (!balance) {
      if (quantity < 0) {
        throw new ValidationError(`Cannot issue stock: No stock available for item ${item.sku}`);
      }
      balance = new StockBalance({
        ...filter,
        availableQuantity: 0,
        reservedQuantity: 0,
        damagedQuantity: 0,
      });
    }

    // 2. Validate sufficient stock for outbound
    if (quantity < 0 && balance.availableQuantity < Math.abs(quantity)) {
      throw new ValidationError(`Cannot issue ${Math.abs(quantity)} units. Only ${balance.availableQuantity} available for item ${item.sku}`);
    }

    // 3. Atomically update balance
    const updatedBalance = await StockBalance.findOneAndUpdate(
      { _id: balance._id, availableQuantity: { $gte: quantity < 0 ? Math.abs(quantity) : 0 } },
      { $inc: { availableQuantity: quantity }, $set: { lastUpdated: new Date() } },
      { new: true, upsert: quantity > 0 } // upsert only safe if positive
    );

    if (!updatedBalance) {
      throw new ValidationError('Stock update failed due to concurrent modification or insufficient stock');
    }

    // 4. Create Immutable Transaction
    const transaction = await StockTransaction.create({
      tenantId, itemId, warehouseId, locationId, quantity, transactionType, ...rest
    });

    return { balance: updatedBalance, transaction };
  }

  static async reserveStock(params: {
    tenantId: mongoose.Types.ObjectId;
    itemId: mongoose.Types.ObjectId;
    warehouseId: mongoose.Types.ObjectId;
    quantity: number;
  }) {
    const { tenantId, itemId, warehouseId, quantity } = params;

    const balance = await StockBalance.findOne({ tenantId, itemId, warehouseId });
    if (!balance || balance.availableQuantity < quantity) {
      throw new ValidationError('Insufficient stock to reserve');
    }

    await StockBalance.updateOne(
      { _id: balance._id, availableQuantity: { $gte: quantity } },
      { $inc: { availableQuantity: -quantity, reservedQuantity: quantity } }
    );
  }

  static async issueStock(tenantId: mongoose.Types.ObjectId, issueData: any, issuedBy: mongoose.Types.ObjectId) {
    const issue = await StockIssue.create({
      ...issueData,
      tenantId,
      issuedBy,
      status: 'ISSUED'
    });

    for (const item of issueData.items) {
      await this.updateStock({
        tenantId,
        itemId: item.itemId,
        warehouseId: issueData.warehouseId,
        quantity: -item.quantity,
        transactionType: 'ISSUE',
        referenceDocumentType: 'STOCK_ISSUE',
        referenceDocumentId: issue._id as mongoose.Types.ObjectId,
        performedBy: issuedBy,
        batchNumber: item.batchNumber,
        serialNumber: item.serialNumber,
      });
    }
    return issue;
  }

  static async returnStock(tenantId: mongoose.Types.ObjectId, returnData: any, receivedBy: mongoose.Types.ObjectId) {
    const returnRecord = await StockReturn.create({
      ...returnData,
      tenantId,
      receivedBy,
      status: 'ACCEPTED'
    });

    for (const item of returnData.items) {
      // If damaged, we might want to update damagedQuantity instead, but for simplicity we'll just log it in transaction and add to available.
      // A more complex system would put DAMAGED stock into a different status or sub-location.
      await this.updateStock({
        tenantId,
        itemId: item.itemId,
        warehouseId: returnData.warehouseId,
        quantity: item.quantity,
        transactionType: 'RETURN',
        referenceDocumentType: 'STOCK_RETURN',
        referenceDocumentId: returnRecord._id as mongoose.Types.ObjectId,
        performedBy: receivedBy,
        batchNumber: item.batchNumber,
        serialNumber: item.serialNumber,
      });
    }
    return returnRecord;
  }

  static async transferStock(tenantId: mongoose.Types.ObjectId, transferData: any, requestedBy: mongoose.Types.ObjectId) {
    const transfer = await StockTransfer.create({
      ...transferData,
      tenantId,
      requestedBy,
      status: 'DISPATCHED', // Assuming auto-dispatch for simple flow
      dispatchDate: new Date(),
      dispatchedBy: requestedBy,
    });

    for (const item of transferData.items) {
      // Out of source
      await this.updateStock({
        tenantId,
        itemId: item.itemId,
        warehouseId: transferData.sourceWarehouseId,
        quantity: -item.requestedQuantity,
        transactionType: 'TRANSFER',
        referenceDocumentType: 'STOCK_TRANSFER',
        referenceDocumentId: transfer._id as mongoose.Types.ObjectId,
        performedBy: requestedBy,
        batchNumber: item.batchNumber,
        serialNumber: item.serialNumber,
      });

      // Into destination
      await this.updateStock({
        tenantId,
        itemId: item.itemId,
        warehouseId: transferData.destinationWarehouseId,
        quantity: item.requestedQuantity,
        transactionType: 'TRANSFER',
        referenceDocumentType: 'STOCK_TRANSFER',
        referenceDocumentId: transfer._id as mongoose.Types.ObjectId,
        performedBy: requestedBy,
        batchNumber: item.batchNumber,
        serialNumber: item.serialNumber,
      });
    }

    // Auto receive for simplicity in this flow, or can be two step
    transfer.status = 'RECEIVED';
    transfer.receiveDate = new Date();
    transfer.receivedBy = requestedBy;
    await transfer.save();

    return transfer;
  }

  static async adjustStock(tenantId: mongoose.Types.ObjectId, adjustmentData: any, requestedBy: mongoose.Types.ObjectId) {
    const adjustment = await StockAdjustment.create({
      ...adjustmentData,
      tenantId,
      requestedBy,
      status: 'APPROVED', // Assuming auto-approve if they have permission
      approvedBy: requestedBy
    });

    for (const item of adjustmentData.items) {
      await this.updateStock({
        tenantId,
        itemId: item.itemId,
        warehouseId: adjustmentData.warehouseId,
        quantity: item.difference, // difference can be positive or negative
        transactionType: 'ADJUSTMENT',
        referenceDocumentType: 'STOCK_ADJUSTMENT',
        referenceDocumentId: adjustment._id as mongoose.Types.ObjectId,
        performedBy: requestedBy,
        batchNumber: item.batchNumber,
        serialNumber: item.serialNumber,
        reason: item.reason
      });
    }

    return adjustment;
  }
}
