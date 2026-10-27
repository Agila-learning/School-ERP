import mongoose, { Document, Schema } from 'mongoose';

export interface IPlatformAuditLog extends Document {
  actor: mongoose.Types.ObjectId;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  tenantId?: mongoose.Types.ObjectId;
  description: string;
  previousValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

const PlatformAuditLogSchema: Schema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actorEmail: String,
    actorRole: String,
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: String,
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
    description: { type: String, required: true },
    previousValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    ipAddress: String,
    userAgent: String,
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    // Audit logs are immutable — no update/delete hooks should fire
  }
);

// Prevent updates
PlatformAuditLogSchema.pre('save', function (this: any) {
  if (!this.isNew) throw new Error('Audit logs are immutable.');
});

PlatformAuditLogSchema.index({ createdAt: -1 });

export default (mongoose.models['PlatformAuditLog'] || mongoose.model<IPlatformAuditLog>('PlatformAuditLog', PlatformAuditLogSchema)) as any;
