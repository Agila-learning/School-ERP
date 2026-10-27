import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type PaymentMethod = 'RAZORPAY' | 'CASH' | 'CHEQUE' | 'BANK_TRANSFER' | 'UPI';

export interface IPaymentAllocation {
  invoiceId: mongoose.Types.ObjectId;
  feeHeadId: mongoose.Types.ObjectId;
  allocatedAmount: number;
}

export interface IPayment extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  referenceNumber?: string; // Cheque number, UTR, or Razorpay Order ID
  allocations: IPaymentAllocation[];
  status: 'INITIATED' | 'SUCCESS' | 'FAILED' | 'BOUNCED' | 'REFUNDED';
  paymentDate: Date;
  receivedByUserId?: mongoose.Types.ObjectId; // For offline cash
}

const PaymentSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', default: () => new mongoose.Types.ObjectId() },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['RAZORPAY', 'CASH', 'CHEQUE', 'BANK_TRANSFER', 'UPI'], required: true },
    referenceNumber: String,
    allocations: [
      {
        invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
        feeHeadId: { type: Schema.Types.ObjectId, ref: 'FeeHead', required: true },
        allocatedAmount: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['INITIATED', 'SUCCESS', 'FAILED', 'BOUNCED', 'REFUNDED'],
      default: 'INITIATED',
    },
    paymentDate: { type: Date, default: Date.now },
    receivedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

PaymentSchema.plugin(softDeletePlugin);

export default (mongoose.models['Payment'] || (mongoose.models['Payment'] || mongoose.model<IPayment>('Payment', PaymentSchema)) as any) as any;
