import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IHostelSettings extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  weekdayCurfewTime?: string; // HH:mm format
  weekendCurfewTime?: string;
  allowSelfLeaveRequest: boolean;
  parentApprovalRequiredForLeave: boolean;
  visitorPolicyText?: string;
  disciplinaryRulesText?: string;
}

const SettingsSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  weekdayCurfewTime: String,
  weekendCurfewTime: String,
  allowSelfLeaveRequest: { type: Boolean, default: false },
  parentApprovalRequiredForLeave: { type: Boolean, default: true },
  visitorPolicyText: String,
  disciplinaryRulesText: String,
}, { timestamps: true });

SettingsSchema.index({ tenantId: 1, branchId: 1, academicYearId: 1 }, { unique: true });
SettingsSchema.plugin(softDeletePlugin);

export default (mongoose.models['HostelSettings'] || mongoose.model<IHostelSettings>('HostelSettings', SettingsSchema)) as any;
