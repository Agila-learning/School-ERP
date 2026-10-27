import mongoose from 'mongoose';
import { MedicalMedication, MedicalPrescription, MedicationAdministration } from '../models/Medication.model';
import { InventoryService } from '../../inventory/services/inventory.service';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class MedicationService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  private get tid() {
    return mongoose.isValidObjectId(this.tenantId) ? new mongoose.Types.ObjectId(this.tenantId) : this.tenantId;
  }

  // --- MEDICATION MASTER ---
  async getMedications() {
    return await MedicalMedication.find({ tenantId: this.tid, isDeleted: { $ne: true } }).populate('inventoryItemId');
  }

  async addMedication(data: any) {
    return await MedicalMedication.create({ ...data, tenantId: this.tid });
  }

  // --- PRESCRIPTIONS ---
  async getPrescriptions(studentId?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (studentId) q.studentId = new mongoose.Types.ObjectId(studentId);
    return await MedicalPrescription.find(q).populate('medicationId');
  }

  async addPrescription(studentId: string, data: any) {
    return await MedicalPrescription.create({ 
      ...data, 
      studentId: new mongoose.Types.ObjectId(studentId),
      tenantId: this.tid 
    });
  }

  // --- ADMINISTRATION ---
  async getAdministrations(studentId?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (studentId) q.studentId = new mongoose.Types.ObjectId(studentId);
    return await MedicationAdministration.find(q).populate('medicationId').populate('administeredByUserId', 'firstName lastName');
  }

  async recordAdministration(data: any, administeredByUserId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const medication = await MedicalMedication.findOne({ _id: data.medicationId, tenantId: this.tid }).session(session);
      if (!medication) throw new NotFoundError('Medication not found');
      
      const adminRecord = await MedicationAdministration.create([{
        ...data,
        administeredByUserId: new mongoose.Types.ObjectId(administeredByUserId),
        tenantId: this.tid,
        actualTime: data.status === 'ADMINISTERED' ? new Date() : undefined
      }], { session });

      // Deduct from inventory if linked and administered
      if (data.status === 'ADMINISTERED' && medication.inventoryItemId && data.warehouseId) {
        // Calculate standard deduction unit (assuming 1 administration = 1 base unit for simplicity)
        const quantityToDeduct = data.quantityDeducted || 1; 

        await InventoryService.updateStock({
          tenantId: this.tid as any,
          itemId: medication.inventoryItemId as mongoose.Types.ObjectId,
          warehouseId: new mongoose.Types.ObjectId(data.warehouseId),
          quantity: -quantityToDeduct,
          transactionType: 'CONSUMPTION',
          referenceDocumentType: 'MEDICATION_ADMIN',
          referenceDocumentId: adminRecord[0]._id as mongoose.Types.ObjectId,
          performedBy: new mongoose.Types.ObjectId(administeredByUserId),
          reason: `Administered to student ${data.studentId}`
        });
      }

      await session.commitTransaction();
      return adminRecord[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
