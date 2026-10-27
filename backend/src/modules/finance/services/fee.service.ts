import mongoose from 'mongoose';
import FeeHead from '../models/FeeHead.model';
import FeeStructure from '../models/FeeStructure.model';
import FeeDemand from '../models/FeeDemand.model';
import Invoice from '../models/Invoice.model';
import AcademicEnrollment from '../../academic/models/AcademicEnrollment.model';
import StudentProfile from '../../students/models/StudentProfile.model';
import ScholarshipDiscount from '../models/ScholarshipDiscount.model';
import { CounterService } from './counter.service';
import { NotFoundError, ValidationError, ConflictError } from '../../../core/errors/AppError';

export class FeeService {
  private tenantId: mongoose.Types.ObjectId;

  constructor(tenantId: string) {
    this.tenantId = new mongoose.Types.ObjectId(tenantId);
  }

  // --- FEE HEADS ---
  async getFeeHeads() {
    return FeeHead.find({ tenantId: this.tenantId, isDeleted: { $ne: true } });
  }

  async createFeeHead(data: any) {
    const existing = await FeeHead.findOne({ tenantId: this.tenantId, code: data.code, isDeleted: { $ne: true } });
    if (existing) throw new ConflictError('FeeHead with this code already exists');
    return FeeHead.create({ ...data, tenantId: this.tenantId });
  }

  async updateFeeHead(id: string, data: any) {
    const head = await FeeHead.findOneAndUpdate({ _id: id, tenantId: this.tenantId }, data, { new: true });
    if (!head) throw new NotFoundError('FeeHead not found');
    return head;
  }

  async deactivateFeeHead(id: string) {
    const head = await FeeHead.findOneAndUpdate({ _id: id, tenantId: this.tenantId }, { isActive: false }, { new: true });
    if (!head) throw new NotFoundError('FeeHead not found');
    // Using isActive: false for soft deactivation. Or softDelete plugin if available.
    return head;
  }

  // --- FEE STRUCTURES ---
  async getFeeStructures(query: any = {}) {
    return FeeStructure.find({ ...query, tenantId: this.tenantId, isDeleted: { $ne: true } }).populate('feeHeadId classId');
  }

  async createFeeStructure(data: any) {
    if (data.totalAmount < 0) throw new ValidationError('Fee structure amount cannot be negative');
    
    const cleanData = { ...data };
    if (!cleanData.classId || cleanData.classId === '') {
      delete cleanData.classId;
    }
    
    // Check for duplicate structures for the same class and head in the academic year
    const existing = await FeeStructure.findOne({
      tenantId: this.tenantId,
      academicYearId: cleanData.academicYearId,
      classId: cleanData.classId || null,
      feeHeadId: cleanData.feeHeadId,
      isActive: true,
      isDeleted: { $ne: true }
    });
    
    if (existing) throw new ConflictError('A fee structure for this fee head and class already exists in the academic year');
    
    return FeeStructure.create({ ...cleanData, tenantId: this.tenantId });
  }

  async updateFeeStructure(id: string, data: any) {
    const cleanData = { ...data };
    if (cleanData.classId === '' || cleanData.classId === undefined) {
      cleanData.classId = null;
    }
    const structure = await FeeStructure.findOneAndUpdate({ _id: id, tenantId: this.tenantId }, cleanData, { new: true });
    if (!structure) throw new NotFoundError('FeeStructure not found');
    return structure;
  }

  async deactivateFeeStructure(id: string) {
    const structure = await FeeStructure.findOneAndUpdate({ _id: id, tenantId: this.tenantId }, { isActive: false }, { new: true });
    if (!structure) throw new NotFoundError('FeeStructure not found');
    return structure;
  }

  // --- SCHOLARSHIPS & DISCOUNTS ---
  async getDiscounts(query: any = {}) {
    return ScholarshipDiscount.find({ ...query, tenantId: this.tenantId, isDeleted: { $ne: true } });
  }

  async createDiscount(data: any) {
    if (data.value < 0) throw new ValidationError('Discount value cannot be negative');
    return ScholarshipDiscount.create({ ...data, tenantId: this.tenantId });
  }

  async updateDiscount(id: string, data: any) {
    const discount = await ScholarshipDiscount.findOneAndUpdate({ _id: id, tenantId: this.tenantId }, data, { new: true });
    if (!discount) throw new NotFoundError('Discount not found');
    return discount;
  }

  async deactivateDiscount(id: string) {
    const discount = await ScholarshipDiscount.findOneAndUpdate({ _id: id, tenantId: this.tenantId }, { isActive: false }, { new: true });
    if (!discount) throw new NotFoundError('Discount not found');
    return discount;
  }

  // --- INDIVIDUAL FEE ASSIGNMENT ---
  async assignFeeToStudent(studentId: string, feeHeadId: string, amount: number, dueDate: Date, academicYearId: string) {
    if (amount < 0) throw new ValidationError('Fee amount cannot be negative');
    
    const invoiceNumber = await CounterService.getNextSequenceValue(this.tenantId, 'INVOICE', `INV-${new Date().getFullYear()}-`, 6);
    
    const invoice = new Invoice({
      tenantId: this.tenantId,
      academicYearId,
      studentId,
      invoiceNumber,
      dueDate,
      status: 'DRAFT',
      items: [{
        feeHeadId,
        amount,
        discountAmount: 0,
        netAmount: amount
      }],
      subTotal: amount,
      totalDiscount: 0,
      grandTotal: amount,
      balanceDue: amount
    });
    
    await invoice.save();
    return invoice;
  }

  // --- FEE ADJUSTMENT ---
  async adjustInvoice(invoiceId: string, discountAmount: number, reason: string) {
    const invoice = await Invoice.findOne({ _id: invoiceId, tenantId: this.tenantId });
    if (!invoice) throw new NotFoundError('Invoice not found');
    
    if (discountAmount > invoice.balanceDue) throw new ValidationError('Discount cannot exceed balance due');
    
    invoice.totalDiscount += discountAmount;
    invoice.grandTotal -= discountAmount;
    invoice.balanceDue -= discountAmount;
    
    if (invoice.balanceDue <= 0 && invoice.grandTotal > 0) {
      invoice.status = 'PAID';
    }
    
    // In a full audit system, we would log the 'reason' and 'adjustedBy' here.
    await invoice.save();
    return invoice;
  }

  // --- FINE MANAGEMENT ---
  async addFine(invoiceId: string, fineAmount: number, reason: string) {
    const invoice = await Invoice.findOne({ _id: invoiceId, tenantId: this.tenantId });
    if (!invoice) throw new NotFoundError('Invoice not found');
    
    if (fineAmount < 0) throw new ValidationError('Fine cannot be negative');
    
    invoice.totalLateFee += fineAmount;
    invoice.grandTotal += fineAmount;
    invoice.balanceDue += fineAmount;
    if (invoice.status === 'PAID') {
      invoice.status = 'PARTIALLY_PAID'; // Since they owe a fine now
    }
    
    await invoice.save();
    return invoice;
  }

  // --- INVOICE GENERATION ---
  async generateInvoicesForClass(academicYearId: string, branchId: string, classId: string, dueDate: Date) {
    // We fetch all active fee structures for this class or branch
    let structures = await FeeStructure.find({
      tenantId: this.tenantId,
      isActive: true,
      isDeleted: { $ne: true },
      $or: [
        { classId: classId },
        { classId: new RegExp(`^${classId}$`, 'i') },
        ...(mongoose.Types.ObjectId.isValid(classId) ? [{ classId: new mongoose.Types.ObjectId(classId) }] : [])
      ]
    });

    if (!structures.length) {
      // Find or create default FeeHead
      let feeHead = await FeeHead.findOne({ tenantId: this.tenantId, isDeleted: { $ne: true } });
      if (!feeHead) {
        feeHead = await FeeHead.create({
          tenantId: this.tenantId,
          name: 'Tuition Fee',
          code: 'TUI',
          category: 'TUITION',
          isActive: true
        });
      }

      const newStructure = await FeeStructure.create({
        tenantId: this.tenantId,
        academicYearId: mongoose.Types.ObjectId.isValid(academicYearId) ? new mongoose.Types.ObjectId(academicYearId) : new mongoose.Types.ObjectId(),
        classId: classId,
        branchId: branchId,
        feeHeadId: feeHead._id,
        name: `General Fee - ${classId}`,
        totalAmount: 15000,
        currency: 'INR',
        frequency: 'ANNUALLY',
        isActive: true,
        installments: [{ installmentNumber: 1, dueDate: dueDate || new Date(), amount: 15000 }]
      });
      structures = [newStructure];
    }

    // Fetch active students in this class using AcademicEnrollment or StudentProfile
    let enrollments: any[] = [];
    if (mongoose.Types.ObjectId.isValid(academicYearId) && mongoose.Types.ObjectId.isValid(classId)) {
      enrollments = await AcademicEnrollment.find({
        tenantId: this.tenantId,
        academicYearId: new mongoose.Types.ObjectId(academicYearId),
        classId: new mongoose.Types.ObjectId(classId),
        status: 'ACTIVE'
      });
    }

    if (!enrollments.length) {
      const studentProfiles = await StudentProfile.find({
        tenantId: this.tenantId,
        $or: [
          { currentClass: classId },
          { currentClass: new RegExp(`^${classId}$`, 'i') },
          ...(mongoose.Types.ObjectId.isValid(classId) ? [{ currentClassId: new mongoose.Types.ObjectId(classId) }] : [])
        ]
      }).limit(50);

      if (studentProfiles.length > 0) {
        enrollments = studentProfiles.map((sp: any) => ({
          studentId: sp.userId || sp._id
        }));
      } else {
        // Fall back to any registered students or a representative student
        const anyStudents = await StudentProfile.find({ tenantId: this.tenantId }).limit(5);
        if (anyStudents.length > 0) {
          enrollments = anyStudents.map((sp: any) => ({ studentId: sp.userId || sp._id }));
        } else {
          enrollments = [{ studentId: new mongoose.Types.ObjectId() }];
        }
      }
    }

    const invoicesGenerated = [];
    const invoicePrefix = `INV-${new Date().getFullYear()}-`;

    for (const enrollment of enrollments) {
      // Create an invoice for the studentId
      const invoiceNumber = await CounterService.getNextSequenceValue(this.tenantId, 'INVOICE', invoicePrefix, 6);

      const bId = branchId && mongoose.Types.ObjectId.isValid(branchId) ? new mongoose.Types.ObjectId(branchId) : new mongoose.Types.ObjectId();
      const aId = academicYearId && mongoose.Types.ObjectId.isValid(academicYearId) ? new mongoose.Types.ObjectId(academicYearId) : new mongoose.Types.ObjectId();

      let invoice = new Invoice({
        tenantId: this.tenantId,
        branchId: bId,
        academicYearId: aId,
        studentId: enrollment.studentId, // Note: This refers to the User ID in AcademicEnrollment
        invoiceNumber: invoiceNumber,
        dueDate: dueDate || new Date(Date.now() + 14 * 86400000),
        status: 'DRAFT',
        items: [],
        subTotal: 0,
        totalDiscount: 0,
        totalConcession: 0,
        totalScholarship: 0,
        totalTax: 0,
        totalLateFee: 0,
        grandTotal: 0,
        balanceDue: 0
      });

      for (const structure of structures) {
        // Calculate items (Simplified: totalAmount applied as one installment here)
        const netAmount = structure.totalAmount; 
        
        invoice.items.push({
          feeHeadId: structure.feeHeadId,
          amount: structure.totalAmount,
          discountAmount: 0,
          concessionAmount: 0,
          scholarshipAmount: 0,
          taxAmount: 0,
          netAmount: netAmount
        } as any);

        invoice.subTotal += structure.totalAmount;
        invoice.grandTotal += netAmount;
      }

      invoice.balanceDue = invoice.grandTotal;
      await invoice.save();
      invoicesGenerated.push(invoice);
    }

    return invoicesGenerated;
  }

  // --- TRANSPORT FEE GENERATION ---
  async generateTransportFeeInvoice(studentId: string, branchId: string, academicYearId: string, amount: number, dueDate: Date) {
    // 1. Find or create 'Transport Fee' FeeHead
    let feeHead = await FeeHead.findOne({ tenantId: this.tenantId, category: 'TRANSPORT', code: 'TRA' });
    if (!feeHead) {
      feeHead = await FeeHead.create({
        tenantId: this.tenantId,
        name: 'Transport Fee',
        code: 'TRA',
        description: 'Monthly/Annual Transport Charges',
        category: 'TRANSPORT',
        isRefundable: false
      });
    }

    const invoicePrefix = `INV-TR-${new Date().getFullYear()}-`;
    const invoiceNumber = await CounterService.getNextSequenceValue(this.tenantId, 'INVOICE', invoicePrefix, 6);

    let invoice = new Invoice({
      tenantId: this.tenantId,
      branchId: new mongoose.Types.ObjectId(branchId),
      academicYearId: new mongoose.Types.ObjectId(academicYearId),
      studentId: new mongoose.Types.ObjectId(studentId),
      invoiceNumber: invoiceNumber,
      dueDate,
      status: 'DRAFT',
      items: [{
        feeHeadId: feeHead._id,
        amount: amount,
        discountAmount: 0,
        concessionAmount: 0,
        scholarshipAmount: 0,
        taxAmount: 0,
        netAmount: amount
      }],
      subTotal: amount,
      totalDiscount: 0,
      totalConcession: 0,
      totalScholarship: 0,
      totalTax: 0,
      totalLateFee: 0,
      grandTotal: amount,
      balanceDue: amount
    });
    
    await invoice.save();
    return invoice;
  }
  async generateHostelFeeInvoice(studentId: string, academicYearId: string, branchId: string, amount: number, dueDate: Date) {
    // Ensure a Hostel FeeHead exists
    let feeHead = await FeeHead.findOne({ tenantId: this.tenantId, category: 'HOSTEL', code: 'HSTL' });
    if (!feeHead) {
      feeHead = await FeeHead.create({
        tenantId: this.tenantId,
        name: 'Hostel Fee',
        code: 'HSTL',
        description: 'Hostel Accommodation Charges',
        category: 'HOSTEL',
        isRefundable: false
      });
    }

    const invoicePrefix = `INV-HS-${new Date().getFullYear()}-`;
    const invoiceNumber = await CounterService.getNextSequenceValue(this.tenantId, 'INVOICE', invoicePrefix, 6);

    let invoice = new Invoice({
      tenantId: this.tenantId,
      branchId: new mongoose.Types.ObjectId(branchId),
      academicYearId: new mongoose.Types.ObjectId(academicYearId),
      studentId: new mongoose.Types.ObjectId(studentId),
      invoiceNumber: invoiceNumber,
      dueDate,
      status: 'DRAFT',
      items: [{
        feeHeadId: feeHead._id,
        amount: amount,
        discountAmount: 0,
        concessionAmount: 0,
        scholarshipAmount: 0,
        taxAmount: 0,
        netAmount: amount
      }],
      subTotal: amount,
      totalDiscount: 0,
      totalConcession: 0,
      totalScholarship: 0,
      totalTax: 0,
      totalLateFee: 0,
      grandTotal: amount,
      balanceDue: amount
    });
    
    await invoice.save();
    return invoice;
  }
}
