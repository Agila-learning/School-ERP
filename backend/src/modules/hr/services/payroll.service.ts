import mongoose from 'mongoose';
import Employee from '../models/Employee.model';
import SalaryStructure from '../models/SalaryStructure.model';
import SalaryComponent from '../models/SalaryComponent.model';
import PayrollPeriod from '../models/PayrollPeriod.model';
import Payslip from '../models/Payslip.model';
import EmployeeAdvance from '../models/EmployeeAdvance.model';
import { AppError, ValidationError, NotFoundError } from '../../../core/errors/AppError';

export class PayrollService {
  
  // --- SALARY COMPONENT CRUD ---
  static async getSalaryComponents(tenantId: mongoose.Types.ObjectId) {
    return SalaryComponent.find({ tenantId, isDeleted: { $ne: true } });
  }

  static async createSalaryComponent(tenantId: mongoose.Types.ObjectId, data: any) {
    return SalaryComponent.create({ ...data, tenantId });
  }

  static async updateSalaryComponent(tenantId: mongoose.Types.ObjectId, id: string, data: any) {
    const comp = await SalaryComponent.findOneAndUpdate(
      { _id: id, tenantId }, data, { new: true, runValidators: true }
    );
    if (!comp) throw new NotFoundError('Salary Component not found');
    return comp;
  }

  static async deactivateSalaryComponent(tenantId: mongoose.Types.ObjectId, id: string) {
    const comp = await SalaryComponent.findOneAndUpdate(
      { _id: id, tenantId }, { status: 'INACTIVE', isDeleted: true }, { new: true }
    );
    if (!comp) throw new NotFoundError('Salary Component not found');
    return comp;
  }

  // --- SALARY STRUCTURE CRUD ---
  static async getSalaryStructures(tenantId: mongoose.Types.ObjectId, employeeId?: string) {
    const filter: any = { tenantId, isDeleted: { $ne: true } };
    if (employeeId) filter.employeeId = new mongoose.Types.ObjectId(employeeId);
    return SalaryStructure.find(filter)
      .populate('employeeId', 'firstName lastName employeeIdNumber')
      .populate('components.componentId', 'name type code calculationMethod')
      .sort({ effectiveFrom: -1 });
  }

  static async createSalaryStructure(tenantId: mongoose.Types.ObjectId, approvedById: mongoose.Types.ObjectId, data: any) {
    // If setting a new active structure, we might want to expire the old one.
    // For simplicity, we just insert. The query in calculatePayrollRun picks the latest effective.
    return SalaryStructure.create({ ...data, tenantId, approvedById });
  }

  static async deactivateSalaryStructure(tenantId: mongoose.Types.ObjectId, id: string) {
    const str = await SalaryStructure.findOneAndUpdate(
      { _id: id, tenantId }, { isDeleted: true }, { new: true }
    );
    if (!str) throw new NotFoundError('Salary Structure not found');
    return str;
  }
  
  /**
   * Idempotently calculates payroll for a given period.
   * If payslips exist, it recalculates only if DRAFT.
   */
  static async calculatePayrollRun(payrollPeriodId: string, tenantId: mongoose.Types.ObjectId, processedById: mongoose.Types.ObjectId) {
    const period = await PayrollPeriod.findOne({ _id: payrollPeriodId, tenantId });
    if (!period) throw new ValidationError('Payroll period not found');
    if (period.status !== 'DRAFT') throw new ValidationError('Only DRAFT periods can be calculated');

    // 1. Fetch eligible employees (ACTIVE/ON_PROBATION/CONFIRMED)
    const employees = await Employee.find({
      tenantId,
      status: { $in: ['ACTIVE', 'ON_PROBATION', 'CONFIRMED'] },
      ...(period.branchId ? { branchId: period.branchId } : {})
    });

    const payslips = [];

    // 2. Pre-fetch component definitions
    const componentsMap = new Map();
    const components = await SalaryComponent.find({ tenantId });
    components.forEach((c: any) => componentsMap.set(c._id.toString(), c));

    for (const emp of employees) {
      // 3. Find active Salary Structure
      const structure = await SalaryStructure.findOne({
        tenantId,
        employeeId: emp._id,
        effectiveFrom: { $lte: new Date() },
        $or: [{ effectiveTo: null }, { effectiveTo: { $gte: new Date() } }]
      }).sort({ effectiveFrom: -1 });

      if (!structure) continue; // Skip employees without structure

      // Mock attendance: 
      // In a real system, query Attendance/Leave module based on period.month/year
      const workingDays = period.totalWorkingDays;
      const presentDays = workingDays; // Defaulting to full attendance
      const paidLeaveDays = 0;
      const unpaidLeaveDays = 0; // LOP

      // Calculate base amounts
      let totalEarnings = 0;
      let totalDeductions = 0;
      const payslipComponents: any[] = [];

      for (const compAssignment of structure.components) {
        const compDef = componentsMap.get(compAssignment.componentId.toString());
        if (!compDef) continue;

        let amount = compAssignment.amount;

        // Apply LOP adjustment if it's an earning (e.g. Basic, HRA)
        if (compDef.type === 'EARNING' && unpaidLeaveDays > 0) {
          const dailyRate = amount / workingDays;
          amount = amount - (dailyRate * unpaidLeaveDays);
        }

        if (compDef.type === 'EARNING') totalEarnings += amount;
        if (compDef.type === 'DEDUCTION' || compDef.type === 'STATUTORY') totalDeductions += amount;

        payslipComponents.push({
          componentId: compDef._id,
          type: compDef.type,
          name: compDef.name,
          amount: Math.round(amount)
        });
      }

      // 4. Fetch Active Advances for deduction
      const advances = await EmployeeAdvance.find({
        tenantId,
        employeeId: emp._id,
        status: 'DISBURSED',
        outstandingBalance: { $gt: 0 }
      });

      for (const advance of advances) {
        let emi = advance.monthlyRecoveryEMI || 0;
        if (emi > advance.outstandingBalance) emi = advance.outstandingBalance;

        if (emi > 0) {
          totalDeductions += emi;
          payslipComponents.push({
            componentId: advance._id, // Using advance ID as a virtual component here
            type: 'DEDUCTION',
            name: 'Advance Recovery',
            amount: emi
          });
        }
      }

      const netSalary = Math.round(totalEarnings - totalDeductions);

      // 5. Update or Create Payslip (Idempotent)
      const payslipData = {
        workingDays,
        presentDays,
        paidLeaveDays,
        unpaidLeaveDays,
        totalEarnings: Math.round(totalEarnings),
        totalDeductions: Math.round(totalDeductions),
        netSalary: netSalary > 0 ? netSalary : 0,
        components: payslipComponents,
        status: 'DRAFT',
        payslipNumber: `PS-${period.year}${String(period.month).padStart(2, '0')}-${emp.employeeIdNumber}`
      };

      const payslip = await Payslip.findOneAndUpdate(
        { tenantId, payrollPeriodId: period._id, employeeId: emp._id },
        payslipData,
        { upsert: true, new: true }
      );
      payslips.push(payslip);
    }

    period.status = 'REVIEW';
    period.processedAt = new Date();
    period.processedById = processedById;
    await period.save();

    return {
      period,
      payslipsCount: payslips.length
    };
  }

  /**
   * Approves a payroll period and locks the payslips.
   * Also deducts advance EMI balances.
   */
  static async approvePayroll(payrollPeriodId: string, tenantId: mongoose.Types.ObjectId, approvedById: mongoose.Types.ObjectId) {
    const period = await PayrollPeriod.findOne({ _id: payrollPeriodId, tenantId });
    if (!period) throw new ValidationError('Payroll period not found');
    if (period.status !== 'REVIEW') throw new ValidationError('Only REVIEW periods can be approved');

    const payslips = await Payslip.find({ tenantId, payrollPeriodId: period._id });
    
    // Deduct EMI from Advances
    for (const ps of payslips) {
      const advanceDeductions = ps.components.filter((c: any) => c.name === 'Advance Recovery');
      for (const ad of advanceDeductions) {
        const advance = await EmployeeAdvance.findById(ad.componentId);
        if (advance) {
          advance.outstandingBalance -= ad.amount;
          if (advance.outstandingBalance <= 0) {
            advance.status = 'RECOVERED';
            advance.outstandingBalance = 0;
          }
          await advance.save();
        }
      }
    }

    // Lock payslips
    await Payslip.updateMany(
      { tenantId, payrollPeriodId: period._id },
      { $set: { status: 'PUBLISHED' } }
    );

    period.status = 'APPROVED';
    period.approvedAt = new Date();
    period.approvedById = approvedById;
    await period.save();

    return period;
  }
}
