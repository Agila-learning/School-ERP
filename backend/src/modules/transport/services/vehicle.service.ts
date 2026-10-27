import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.model';
import VehicleDocument from '../models/VehicleDocument.model';
import VehicleMaintenance from '../models/VehicleMaintenance.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class VehicleService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  private get tid() {
    return new mongoose.Types.ObjectId(this.tenantId);
  }

  async getVehicles(branchId?: string) {
    const query: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (branchId) query.branchId = new mongoose.Types.ObjectId(branchId);
    return Vehicle.find(query);
  }

  async createVehicle(data: any) {
    return Vehicle.create({
      ...data,
      tenantId: this.tid,
    });
  }

  async addVehicleDocument(vehicleId: string, data: any) {
    const vehicle = await Vehicle.findOne({ _id: new mongoose.Types.ObjectId(vehicleId), tenantId: this.tid });
    if (!vehicle) throw new NotFoundError('Vehicle not found');

    return VehicleDocument.create({
      ...data,
      tenantId: this.tid,
      vehicleId: vehicle._id,
    });
  }

  /**
   * Background job method to check for document expirations
   * Sends notifications to transport managers.
   */
  async checkDocumentExpirations() {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const expiringDocs = await VehicleDocument.find({
      tenantId: this.tid,
      isDeleted: { $ne: true },
      alertSent: false,
      expiryDate: { $lte: thirtyDaysFromNow }
    }).populate('vehicleId');

    for (const doc of expiringDocs) {
      // In a real system, send email/sms to transport manager
      console.log(`[ALERT] Vehicle Document Expiring: ${(doc.vehicleId as any).registrationNumber} - ${doc.documentType}`);
      
      doc.alertSent = true;
      await doc.save();
    }
  }

  async logMaintenance(vehicleId: string, data: any) {
    const vehicle = await Vehicle.findOne({ _id: new mongoose.Types.ObjectId(vehicleId), tenantId: this.tid });
    if (!vehicle) throw new NotFoundError('Vehicle not found');

    const maintenance = await VehicleMaintenance.create({
      ...data,
      tenantId: this.tid,
      vehicleId: vehicle._id,
    });
    
    // Optionally trigger Finance expense creation here if integrated
    return maintenance;
  }
}
