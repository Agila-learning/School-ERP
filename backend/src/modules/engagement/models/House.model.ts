import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISchoolHouse extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  houseName: string;
  houseCode: string;
  houseColor: string;
  description?: string;
  houseCaptain?: mongoose.Types.ObjectId; // Student ID
  viceCaptain?: mongoose.Types.ObjectId;
  teacherCoordinator: mongoose.Types.ObjectId; // User/Employee ID
  status: 'Active' | 'Inactive';
}

export interface IHouseMembership extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  houseId: mongoose.Types.ObjectId;
  assignedDate: Date;
  assignedBy: mongoose.Types.ObjectId; // User ID
  reason?: string;
  status: 'Active' | 'Transferred' | 'Inactive';
}

export interface IHousePointTransaction extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  houseId: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId;
  eventId?: mongoose.Types.ObjectId; // Refers to Phase 53 Event
  category: string; // Sports, Academic, Discipline
  points: number;
  reason: string;
  awardedBy: mongoose.Types.ObjectId;
  date: Date;
  status: 'Submitted' | 'Reviewed' | 'Approved' | 'Rejected' | 'Posted';
}

export interface IHousePointRule extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  activityName: string;
  category: string;
  defaultPoints: number;
  maxPoints: number;
  approvalRequired: boolean;
}

export interface IHouseChampionship extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  championshipName: string;
  startDate: Date;
  endDate: Date;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
}

const SchoolHouseSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  branchId: { type: Schema.Types.ObjectId },
  houseName: { type: String, required: true },
  houseCode: { type: String, required: true, unique: true },
  houseColor: { type: String, required: true },
  description: String,
  houseCaptain: { type: Schema.Types.ObjectId },
  viceCaptain: { type: Schema.Types.ObjectId },
  teacherCoordinator: { type: Schema.Types.ObjectId, required: true },
  status: { type: String, default: 'Active' },
}, { timestamps: true });

const HouseMembershipSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  academicYearId: { type: Schema.Types.ObjectId, required: true },
  studentId: { type: Schema.Types.ObjectId, required: true },
  houseId: { type: Schema.Types.ObjectId, ref: 'SchoolHouse', required: true },
  assignedDate: { type: Date, default: Date.now },
  assignedBy: { type: Schema.Types.ObjectId, required: true },
  reason: String,
  status: { type: String, default: 'Active' },
}, { timestamps: true });

const HousePointTransactionSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  academicYearId: { type: Schema.Types.ObjectId, required: true },
  houseId: { type: Schema.Types.ObjectId, ref: 'SchoolHouse', required: true },
  studentId: { type: Schema.Types.ObjectId },
  eventId: { type: Schema.Types.ObjectId },
  category: { type: String, required: true },
  points: { type: Number, required: true },
  reason: { type: String, required: true },
  awardedBy: { type: Schema.Types.ObjectId, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'Posted' },
}, { timestamps: true });

const HousePointRuleSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  activityName: { type: String, required: true },
  category: { type: String, required: true },
  defaultPoints: { type: Number, required: true },
  maxPoints: { type: Number, required: true },
  approvalRequired: { type: Boolean, default: false },
}, { timestamps: true });

const HouseChampionshipSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  academicYearId: { type: Schema.Types.ObjectId, required: true },
  championshipName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, default: 'Ongoing' },
}, { timestamps: true });

[SchoolHouseSchema, HouseMembershipSchema, HousePointTransactionSchema, HousePointRuleSchema, HouseChampionshipSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const SchoolHouse = (mongoose.models['SchoolHouse'] || mongoose.model<ISchoolHouse>('SchoolHouse', SchoolHouseSchema)) as any;
export const HouseMembership = (mongoose.models['HouseMembership'] || mongoose.model<IHouseMembership>('HouseMembership', HouseMembershipSchema)) as any;
export const HousePointTransaction = (mongoose.models['HousePointTransaction'] || mongoose.model<IHousePointTransaction>('HousePointTransaction', HousePointTransactionSchema)) as any;
export const HousePointRule = (mongoose.models['HousePointRule'] || mongoose.model<IHousePointRule>('HousePointRule', HousePointRuleSchema)) as any;
export const HouseChampionship = (mongoose.models['HouseChampionship'] || mongoose.model<IHouseChampionship>('HouseChampionship', HouseChampionshipSchema)) as any;
