import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IEmployeeAdvance extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  requestDate: Date;
  amount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'RECOVERED';
  approvedAmount?: number;
  approvedBy?: mongoose.Types.ObjectId;
  monthlyRecoveryEMI?: number;
  outstandingBalance: number;
  disbursedDate?: Date;
}

const EmployeeAdvanceSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  requestDate: { type: Date, required: true, default: Date.now },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'DISBURSED', 'RECOVERED'],
    default: 'PENDING',
  },
  approvedAmount: Number,
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  monthlyRecoveryEMI: Number,
  outstandingBalance: { type: Number, required: true, default: 0 },
  disbursedDate: Date,
}, { timestamps: true });

EmployeeAdvanceSchema.plugin(softDeletePlugin);

export default (mongoose.models['EmployeeAdvance'] || (mongoose.models['EmployeeAdvance'] || mongoose.model<IEmployeeAdvance>('EmployeeAdvance', EmployeeAdvanceSchema)) as any) as any;
