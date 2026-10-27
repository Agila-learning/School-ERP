import mongoose, { Schema, Document } from 'mongoose';

export interface IHomework extends Document {
  tenantId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  classId: mongoose.Types.ObjectId;
  sectionId?: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  dueDate: Date;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const HomeworkSchema = new Schema<IHomework>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  sectionId: { type: Schema.Types.ObjectId, ref: 'Section' },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, {
  timestamps: true
});

HomeworkSchema.index({ tenantId: 1, classId: 1, sectionId: 1 });
HomeworkSchema.index({ tenantId: 1, teacherId: 1 });

export default mongoose.model<IHomework>('Homework', HomeworkSchema);
