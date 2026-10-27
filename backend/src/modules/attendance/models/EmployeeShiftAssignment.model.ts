import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IEmployeeShiftAssignment extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  shiftId: mongoose.Types.ObjectId;
  effectiveFrom: Date;
  effectiveTo?: Date;
  assignedBy: mongoose.Types.ObjectId;
}

const EmployeeShiftAssignmentSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    shiftId: { type: Schema.Types.ObjectId, ref: 'Shift', required: true },
    effectiveFrom: { type: Date, required: true },
    effectiveTo: Date,
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

EmployeeShiftAssignmentSchema.index({ tenantId: 1, employeeId: 1, effectiveFrom: 1 });
EmployeeShiftAssignmentSchema.plugin(softDeletePlugin);
export default (mongoose.models['EmployeeShiftAssignment'] || (mongoose.models['EmployeeShiftAssignment'] || mongoose.model<IEmployeeShiftAssignment>('EmployeeShiftAssignment', EmployeeShiftAssignmentSchema)) as any) as any;
