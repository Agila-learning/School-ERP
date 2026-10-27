import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IRubricCriterion {
  _id?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  weightage: number; // e.g. 20 (for 20%)
  maxScore: number;
}

export interface IRubric extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  criteria: IRubricCriterion[];
  
  // Can be global (available to all teachers) or owned by a specific teacher
  isGlobal: boolean;
  teacherId?: mongoose.Types.ObjectId;
  
  status: 'ACTIVE' | 'INACTIVE';
}

const RubricSchema = new Schema<IRubric>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  
  criteria: [{
    name: { type: String, required: true },
    description: { type: String },
    weightage: { type: Number, required: true },
    maxScore: { type: Number, required: true, default: 10 }
  }],
  
  isGlobal: { type: Boolean, default: false },
  teacherId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, {
  timestamps: true
});

RubricSchema.plugin(softDeletePlugin);

export default mongoose.model<IRubric>('Rubric', RubricSchema);
