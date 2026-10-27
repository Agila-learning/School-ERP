import mongoose, { Document, Schema } from 'mongoose';

export interface IAssetAllocation extends Document {
  tenantId: mongoose.Types.ObjectId;
  assetId: mongoose.Types.ObjectId;
  
  allocatedToType: 'EMPLOYEE' | 'DEPARTMENT';
  allocatedToEmployeeId?: mongoose.Types.ObjectId;
  allocatedToDepartmentId?: mongoose.Types.ObjectId;
  
  allocationDate: Date;
  expectedReturnDate?: Date;
  
  conditionAtAllocation: 'NEW' | 'GOOD' | 'FAIR' | 'POOR';
  issuedBy: mongoose.Types.ObjectId;
  
  returnDate?: Date;
  conditionAtReturn?: 'NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED' | 'LOST';
  receivedBy?: mongoose.Types.ObjectId;
  
  status: 'ACTIVE' | 'RETURNED' | 'TRANSFERRED';
  notes?: string;
}

const AssetAllocationSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true, index: true },
  
  allocatedToType: { type: String, enum: ['EMPLOYEE', 'DEPARTMENT'], required: true },
  allocatedToEmployeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  allocatedToDepartmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  
  allocationDate: { type: Date, required: true, default: Date.now },
  expectedReturnDate: Date,
  
  conditionAtAllocation: { type: String, enum: ['NEW', 'GOOD', 'FAIR', 'POOR'], required: true },
  issuedBy: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  
  returnDate: Date,
  conditionAtReturn: { type: String, enum: ['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED', 'LOST'] },
  receivedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  
  status: { type: String, enum: ['ACTIVE', 'RETURNED', 'TRANSFERRED'], default: 'ACTIVE' },
  notes: String,
}, { timestamps: true });

// Note: Immutable history. Don't overwrite existing allocations, mark them RETURNED instead.

export default (mongoose.models['AssetAllocation'] || (mongoose.models['AssetAllocation'] || mongoose.model<IAssetAllocation>('AssetAllocation', AssetAllocationSchema)) as any) as any;
