import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IUser extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  roleIds: mongoose.Types.ObjectId[];
  accountStatus: 'invited' | 'pending' | 'active' | 'suspended' | 'inactive' | 'archived';
  forcePasswordReset?: boolean;
  lastLogin?: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: false,
    },
    roleIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Role',
    }],
    accountStatus: {
      type: String,
      enum: ['invited', 'pending', 'active', 'suspended', 'inactive', 'archived'],
      default: 'active',
    },
    forcePasswordReset: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure email is unique per tenant
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

UserSchema.plugin(softDeletePlugin);

export default (mongoose.models['User'] || (mongoose.models['User'] || mongoose.model<IUser>('User', UserSchema)) as any) as any;
