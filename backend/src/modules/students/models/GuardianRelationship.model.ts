import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IGuardianRelationship extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  parentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  relationshipType: 'Father' | 'Mother' | 'Guardian' | 'Grandparent' | 'Parent' | 'Other';
  
  isPrimaryGuardian: boolean;
  isLegalGuardian: boolean;
  isEmergencyContact: boolean;
  isPickupAuthorized: boolean;
  
  // Access Permissions
  academicAccess: boolean;
  attendanceAccess: boolean;
  feeAccess: boolean;
  medicalAccess: boolean;
  documentAccess: boolean;
  communicationAccess: boolean;
  
  startDate: Date;
  endDate?: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'REVOKED';
}

const GuardianRelationshipSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Parent', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true, index: true },
    relationshipType: { type: String, enum: ['Father', 'Mother', 'Guardian', 'Grandparent', 'Parent', 'Other'], required: true },
    
    isPrimaryGuardian: { type: Boolean, default: false },
    isLegalGuardian: { type: Boolean, default: false },
    isEmergencyContact: { type: Boolean, default: false },
    isPickupAuthorized: { type: Boolean, default: false },
    
    academicAccess: { type: Boolean, default: true },
    attendanceAccess: { type: Boolean, default: true },
    feeAccess: { type: Boolean, default: true },
    medicalAccess: { type: Boolean, default: true },
    documentAccess: { type: Boolean, default: true },
    communicationAccess: { type: Boolean, default: true },
    
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'REVOKED'], default: 'ACTIVE', index: true },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate relationships for the same parent-student pair
GuardianRelationshipSchema.index({ tenantId: 1, parentId: 1, studentId: 1 }, { unique: true });

GuardianRelationshipSchema.plugin(softDeletePlugin);

export default (mongoose.models['GuardianRelationship'] || mongoose.model<IGuardianRelationship>('GuardianRelationship', GuardianRelationshipSchema)) as any;
