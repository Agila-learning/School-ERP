import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IEmployee extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // Optional user account mapping
  
  employeeIdNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth: Date;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  nationality: string;
  photoUrl?: string;
  
  mobile: string;
  alternateMobile?: string;
  email: string; // Official email
  personalEmail?: string;
  
  address: {
    current: string;
    permanent?: string;
  };
  
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  
  departmentId: mongoose.Types.ObjectId;
  designationId: mongoose.Types.ObjectId;
  employmentType: 'Permanent' | 'Probation' | 'Contract' | 'Temporary' | 'Part-time' | 'Consultant' | 'Intern' | 'Volunteer' | 'Outsourced';
  joiningDate: Date;
  confirmationDate?: Date;
  reportingManagerId?: mongoose.Types.ObjectId; // Self reference to Employee
  branchId: mongoose.Types.ObjectId;
  campusId?: mongoose.Types.ObjectId;
  
  status: 'INVITED' | 'ACTIVE' | 'ON_PROBATION' | 'CONFIRMED' | 'ON_LEAVE' | 'SUSPENDED' | 'NOTICE_PERIOD' | 'RESIGNED' | 'TERMINATED' | 'RETIRED' | 'INACTIVE';
}

const EmployeeSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    
    employeeIdNumber: { type: String, required: true },
    firstName: { type: String, required: true },
    middleName: String,
    lastName: { type: String, required: true },
    preferredName: String,
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    bloodGroup: String,
    nationality: { type: String, required: true },
    photoUrl: String,
    
    mobile: { type: String, required: true },
    alternateMobile: String,
    email: { type: String, required: true },
    personalEmail: String,
    
    address: {
      current: { type: String, required: true },
      permanent: String,
    },
    
    emergencyContact: {
      name: { type: String, required: true },
      relationship: { type: String, required: true },
      phone: { type: String, required: true },
    },
    
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    designationId: { type: Schema.Types.ObjectId, ref: 'Designation', required: true },
    employmentType: { 
      type: String, 
      enum: ['Permanent', 'Probation', 'Contract', 'Temporary', 'Part-time', 'Consultant', 'Intern', 'Volunteer', 'Outsourced'], 
      required: true 
    },
    joiningDate: { type: Date, required: true },
    confirmationDate: Date,
    reportingManagerId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    campusId: { type: Schema.Types.ObjectId, ref: 'Campus' },
    
    status: { 
      type: String, 
      enum: ['INVITED', 'ACTIVE', 'ON_PROBATION', 'CONFIRMED', 'ON_LEAVE', 'SUSPENDED', 'NOTICE_PERIOD', 'RESIGNED', 'TERMINATED', 'RETIRED', 'INACTIVE'], 
      default: 'ACTIVE' 
    },
  },
  {
    timestamps: true,
  }
);

EmployeeSchema.index({ tenantId: 1, employeeIdNumber: 1 }, { unique: true });
EmployeeSchema.index({ tenantId: 1, email: 1 });
EmployeeSchema.plugin(softDeletePlugin);

export default (mongoose.models['Employee'] || (mongoose.models['Employee'] || mongoose.model<IEmployee>('Employee', EmployeeSchema)) as any) as any;
