import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IStudentTransportAssignment extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId; // Ref: User
  academicYearId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  routeId: mongoose.Types.ObjectId;
  pickupStopId: mongoose.Types.ObjectId;
  dropoffStopId: mongoose.Types.ObjectId;
  isMorningTrip: boolean;
  isAfternoonTrip: boolean;
  effectiveFrom: Date;
  effectiveUntil?: Date;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
  feeDemandId?: mongoose.Types.ObjectId; // Link to Finance FeeDemand
}

const StudentTransportAssignmentSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    routeId: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
    pickupStopId: { type: Schema.Types.ObjectId, ref: 'RouteStop', required: true },
    dropoffStopId: { type: Schema.Types.ObjectId, ref: 'RouteStop', required: true },
    isMorningTrip: { type: Boolean, default: true },
    isAfternoonTrip: { type: Boolean, default: true },
    effectiveFrom: { type: Date, required: true },
    effectiveUntil: Date,
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING', 'SUSPENDED', 'CANCELLED', 'EXPIRED'],
      default: 'ACTIVE',
    },
    feeDemandId: { type: Schema.Types.ObjectId, ref: 'FeeDemand' },
  },
  { timestamps: true }
);

// Optimize querying active assignments for a route/student
StudentTransportAssignmentSchema.index({ tenantId: 1, routeId: 1, status: 1 });
StudentTransportAssignmentSchema.index({ tenantId: 1, studentId: 1, status: 1 });

StudentTransportAssignmentSchema.plugin(softDeletePlugin);

export default (mongoose.models['StudentTransportAssignment'] || (mongoose.models['StudentTransportAssignment'] || mongoose.model<IStudentTransportAssignment>('StudentTransportAssignment', StudentTransportAssignmentSchema)) as any) as any;
