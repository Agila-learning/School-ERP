import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IFinancialYear extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string; // e.g. FY 2026-27
  startDate: Date;
  endDate: Date;
  status: 'OPEN' | 'CLOSING' | 'CLOSED' | 'LOCKED';
  closedBy?: mongoose.Types.ObjectId;
  closedDate?: Date;
}

export interface IFinancialPeriod extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  financialYearId: mongoose.Types.ObjectId;
  name: string; // e.g. April 2026
  startDate: Date;
  endDate: Date;
  status: 'OPEN' | 'CLOSED' | 'LOCKED';
  closedBy?: mongoose.Types.ObjectId;
  closedDate?: Date;
}

const FinancialYearSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['OPEN', 'CLOSING', 'CLOSED', 'LOCKED'], default: 'OPEN' },
  closedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  closedDate: { type: Date },
}, { timestamps: true });

const FinancialPeriodSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  financialYearId: { type: Schema.Types.ObjectId, ref: 'FinancialYear', required: true },
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['OPEN', 'CLOSED', 'LOCKED'], default: 'OPEN' },
  closedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  closedDate: { type: Date },
}, { timestamps: true });

[FinancialYearSchema, FinancialPeriodSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const FinancialYear = (mongoose.models['FinancialYear'] || mongoose.model<IFinancialYear>('FinancialYear', FinancialYearSchema)) as any;
export const FinancialPeriod = (mongoose.models['FinancialPeriod'] || mongoose.model<IFinancialPeriod>('FinancialPeriod', FinancialPeriodSchema)) as any;
