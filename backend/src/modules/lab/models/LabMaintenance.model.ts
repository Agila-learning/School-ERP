import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILabMaintenance extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  laboratoryId: mongoose.Types.ObjectId;
  equipmentId: mongoose.Types.ObjectId;
  reportedById: mongoose.Types.ObjectId; // Ref: Employee
  issueDescription: string;
  reportedDate: Date;
  scheduledDate?: Date;
  completedDate?: Date;
  cost?: number;
  status: 'REPORTED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'UNREPAIRABLE';
  remarks?: string;
}

const LabMaintenanceSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  branchId: { type: Schema.Types.Mixed },
  laboratoryId: { type: Schema.Types.Mixed, ref: 'Laboratory' },
  laboratoryName: String,
  equipmentId: { type: Schema.Types.Mixed, ref: 'LabEquipment' },
  equipmentName: String,
  reportedById: { type: Schema.Types.Mixed, ref: 'Employee' },
  reportedByName: String,
  issueDescription: { type: String, required: true },
  reportedDate: { type: Date, required: true, default: Date.now },
  scheduledDate: Date,
  completedDate: Date,
  cost: { type: Number, default: 0 },
  status: { type: String, enum: ['REPORTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'UNREPAIRABLE'], default: 'REPORTED' },
  remarks: String,
}, { timestamps: true });

LabMaintenanceSchema.index({ tenantId: 1, status: 1 });
LabMaintenanceSchema.plugin(softDeletePlugin);
export default (mongoose.models['LabMaintenance'] || mongoose.model<ILabMaintenance>('LabMaintenance', LabMaintenanceSchema)) as any;
