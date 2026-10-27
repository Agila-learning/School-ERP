import mongoose from 'mongoose';
import SupplierInvoice from '../models/SupplierInvoice.model';
import PurchaseOrder from '../models/PurchaseOrder.model';
import GoodsReceipt from '../models/GoodsReceipt.model';
import { ValidationError, NotFoundError } from '../../../core/errors/AppError';

export class InvoiceMatchingService {
  /**
   * Performs a 3-Way Match:
   * 1. Invoice vs PO (Price match)
   * 2. Invoice vs GRN (Quantity match)
   */
  static async matchInvoice(tenantId: string, invoiceId: string) {
    const invoice = await SupplierInvoice.findOne({ _id: invoiceId, tenantId });
    if (!invoice) throw new NotFoundError('Invoice not found');
    if (!invoice.purchaseOrderId || !invoice.goodsReceiptId) {
      throw new ValidationError('Invoice must be linked to a PO and a GRN for 3-way matching.');
    }

    const po = await PurchaseOrder.findOne({ _id: invoice.purchaseOrderId, tenantId });
    const grn = await GoodsReceipt.findOne({ _id: invoice.goodsReceiptId, tenantId });

    if (!po) throw new NotFoundError('Purchase Order not found');
    if (!grn) throw new NotFoundError('Goods Receipt not found');

    let hasPriceMismatch = false;
    let hasQuantityMismatch = false;
    let hasTaxMismatch = false;
    const discrepancies: string[] = [];

    // Check quantities (Invoice vs GRN) and Prices (Invoice vs PO)
    for (const invoiceItem of invoice.items) {
      // Find matching GRN item
      const grnItem = grn.items.find((item: any) => item.itemId.toString() === invoiceItem.itemId.toString());
      if (!grnItem) {
        hasQuantityMismatch = true;
        discrepancies.push(`Item ${invoiceItem.itemId} not found on GRN.`);
        continue;
      }
      if (invoiceItem.quantityBilled > grnItem.receivedQuantity) {
        hasQuantityMismatch = true;
        discrepancies.push(`Item ${invoiceItem.itemId} billed quantity (${invoiceItem.quantityBilled}) exceeds received quantity (${grnItem.receivedQuantity}).`);
      }

      // Find matching PO item
      const poItem = po.items.find((item: any) => item.itemId.toString() === invoiceItem.itemId.toString());
      if (!poItem) {
        hasPriceMismatch = true;
        discrepancies.push(`Item ${invoiceItem.itemId} not found on PO.`);
        continue;
      }
      
      // Strict 0% tolerance for Phase 1
      if (invoiceItem.unitPrice !== poItem.unitPrice) {
        hasPriceMismatch = true;
        discrepancies.push(`Item ${invoiceItem.itemId} price (${invoiceItem.unitPrice}) mismatches PO price (${poItem.unitPrice}).`);
      }
    }

    // Tax comparison
    if (invoice.totalTax !== po.totalTax) {
      hasTaxMismatch = true;
      discrepancies.push(`Total tax billed (${invoice.totalTax}) mismatches PO tax (${po.totalTax}).`);
    }

    const isMatched = !hasPriceMismatch && !hasQuantityMismatch && !hasTaxMismatch;
    
    invoice.status = isMatched ? 'MATCHED' : 'DISCREPANCY';
    invoice.matchingDetails = {
      priceMismatch: hasPriceMismatch,
      quantityMismatch: hasQuantityMismatch,
      taxMismatch: hasTaxMismatch,
      discrepancyNotes: discrepancies.join(' | ')
    };

    await invoice.save();
    return invoice;
  }
}
