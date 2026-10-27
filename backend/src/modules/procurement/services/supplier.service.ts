import mongoose from 'mongoose';
import Vendor from '../../vendors/models/Vendor.model';
import SupplierDocument from '../models/SupplierDocument.model';
import { ValidationError } from '../../../core/errors/AppError';

export class SupplierService {
  
  static async addDocument(tenantId: mongoose.Types.ObjectId, vendorId: mongoose.Types.ObjectId, docData: any) {
    const vendor = await Vendor.findOne({ _id: vendorId, tenantId });
    if (!vendor) throw new ValidationError('Vendor not found');
    
    return await SupplierDocument.create({
      ...docData,
      tenantId,
      vendorId
    });
  }

  static async updateSupplierStatus(tenantId: mongoose.Types.ObjectId, vendorId: mongoose.Types.ObjectId, status: string) {
    const vendor = await Vendor.findOneAndUpdate(
      { _id: vendorId, tenantId },
      { status },
      { new: true }
    );
    if (!vendor) throw new ValidationError('Vendor not found');
    return vendor;
  }

  static async getSupplierPerformance(tenantId: mongoose.Types.ObjectId, vendorId: mongoose.Types.ObjectId) {
    // In a real system, this would aggregate data from POs and GRNs
    // to calculate on-time delivery %, rejection rates, etc.
    return {
      vendorId,
      totalOrders: 0,
      onTimeDeliveryRate: 100,
      rejectionRate: 0,
      averageDeliveryTimeDays: 0,
      totalSpend: 0
    };
  }
}
