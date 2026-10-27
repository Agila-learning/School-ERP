import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  tenantId: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId: mongoose.Types.ObjectId;
  performedBy: mongoose.Types.ObjectId;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}

const AuditLogSchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true, // e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
    },
    entityType: {
      type: String,
      required: true, // e.g., 'User', 'Student', 'Fee'
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changes: {
      type: Schema.Types.Mixed,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast querying by tenant and entity
AuditLogSchema.index({ tenantId: 1, entityType: 1, entityId: 1 });

export default (mongoose.models['AuditLog'] || (mongoose.models['AuditLog'] || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema)) as any) as any;
