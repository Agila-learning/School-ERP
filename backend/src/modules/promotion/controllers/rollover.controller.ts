import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { sendResponse } from '../../../core/utils/response.util';
import AcademicYearRollover from '../models/AcademicYearRollover.model';

export class RolloverController {
  
  static async validateRollover(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      // Mock validation logic
      const validationResults = {
        isValid: true,
        errors: [],
        warnings: ['5 students have pending supplementary results'],
        totalStudents: 1200,
        promoted: 1050,
        detained: 15,
        graduating: 120,
        pending: 15
      };
      sendResponse({ res, status: 200, message: 'Rollover validation completed', data: validationResults });
    } catch (err) { next(err); }
  }

  static async executeRollover(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { fromAcademicYearId, toAcademicYearId } = req.body;
      
      const rollover = new AcademicYearRollover({
        tenantId: req.tenantId,
        fromAcademicYearId,
        toAcademicYearId,
        status: 'IN_PROGRESS',
        initiatedByUserId: req.user!.id
      });
      await rollover.save();

      // Async process simulation
      setTimeout(async () => {
        rollover.status = 'COMPLETED';
        rollover.completedAt = new Date();
        rollover.totalStudentsProcessed = 1200;
        await rollover.save();
      }, 5000);

      sendResponse({ res, status: 202, message: 'Rollover execution started in background', data: rollover });
    } catch (err) { next(err); }
  }
}
