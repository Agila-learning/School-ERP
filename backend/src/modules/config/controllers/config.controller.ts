import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { SettingRepository } from '../repositories/setting.repository';
import { MasterDataRepository } from '../repositories/masterData.repository';
import { FeatureFlagRepository } from '../repositories/featureFlag.repository';
import { NumberSequenceRepository } from '../repositories/numberSequence.repository';
import { sendResponse } from '../../../core/utils/response.util';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';
import { AuditService } from '../../audit/services/audit.service';

// ------------------------------------------------------------------
// SETTINGS
// ------------------------------------------------------------------

export const getSettings = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const repo = new SettingRepository(req.tenantId!);
    const { group } = req.query;
    
    let settings;
    if (group) {
      settings = await repo.findByGroup(group as string);
    } else {
        settings = await repo.find({});
    }

    sendResponse({ res, data: settings });
  } catch (error) {
    next(error);
  }
};

export const createSetting = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const repo = new SettingRepository(req.tenantId!);
    
    // Check if key already exists for tenant
    const existing = await repo.findByKey(req.body.key);
    if (existing) {
      throw new ValidationError(`Setting with key ${req.body.key} already exists`);
    }

    const setting = await repo.create(req.body);
    
    await AuditService.log({
      tenantId: req.tenantId!,
      performedBy: req.user!.id,
      action: 'CREATE',
      entityType: 'SETTING',
      entityId: setting.id,
      changes: { new: setting },
    });
    
    sendResponse({ res, status: 201, data: setting });
  } catch (error) {
    next(error);
  }
};

export const updateSetting = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const repo = new SettingRepository(req.tenantId!);
    const id = req.params.id as string;
    const existingSetting = await repo.findById(id);
    const setting = await repo.update(id, req.body);
    if (!setting) throw new NotFoundError('Setting not found');
    
    if (existingSetting) {
      await AuditService.log({
        tenantId: req.tenantId!,
        performedBy: req.user!.id,
        action: 'UPDATE',
        entityType: 'SETTING',
        entityId: setting.id,
        changes: { old: existingSetting, new: setting },
      });
    }
    
    sendResponse({ res, data: setting });
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateSettings = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const repo = new SettingRepository(req.tenantId!);
    const { settings } = req.body; // Array of { key, group, value }

    if (!Array.isArray(settings)) {
      throw new ValidationError('settings must be an array');
    }

    const results = [];
    for (const s of settings) {
      const existing = await repo.findByKey(s.key);
      const updated = await repo.upsertByKey(s.key, s);
      results.push(updated);

      await AuditService.log({
        tenantId: req.tenantId!,
        performedBy: req.user!.id,
        action: existing ? 'UPDATE' : 'CREATE',
        entityType: 'SETTING',
        entityId: updated.id,
        changes: { old: existing || undefined, new: updated },
      });
    }

    sendResponse({ res, data: results });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------------
// MASTER DATA
// ------------------------------------------------------------------

export const getMasterData = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const repo = new MasterDataRepository(req.tenantId!);
    const { type } = req.query;
    
    let data;
    if (type) {
      data = await repo.findByType(type as string);
    } else {
      data = await repo.find({});
    }

    sendResponse({ res, data });
  } catch (error) {
    next(error);
  }
};

export const createMasterData = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const repo = new MasterDataRepository(req.tenantId!);
    const data = await repo.create(req.body);
    sendResponse({ res, status: 201, data });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------------
// FEATURE FLAGS
// ------------------------------------------------------------------

export const getFeatureFlags = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const repo = new FeatureFlagRepository(req.tenantId!);
    const flags = await repo.find({});
    sendResponse({ res, data: flags });
  } catch (error) {
    next(error);
  }
};

export const toggleFeatureFlag = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const repo = new FeatureFlagRepository(req.tenantId!);
    const { isEnabled } = req.body;
    
    const id = req.params.id as string;
    const flag = await repo.update(id, { isEnabled });
    if (!flag) throw new NotFoundError('Feature Flag not found');
    
    sendResponse({ res, data: flag });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------------
// NUMBER SEQUENCES
// ------------------------------------------------------------------

export const getNumberSequences = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const repo = new NumberSequenceRepository(req.tenantId!);
    const sequences = await repo.find({});
    sendResponse({ res, data: sequences });
  } catch (error) {
    next(error);
  }
};

export const createNumberSequence = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const repo = new NumberSequenceRepository(req.tenantId!);
    
    const existing = await repo.findByType(req.body.type);
    if (existing) {
      throw new ValidationError(`Sequence for ${req.body.type} already exists`);
    }

    const sequence = await repo.create(req.body);
    sendResponse({ res, status: 201, data: sequence });
  } catch (error) {
    next(error);
  }
};

export const generateNextNumber = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const repo = new NumberSequenceRepository(req.tenantId!);
    const type = req.params.type as string;
    
    const nextNumber = await repo.getNextSequence(type);
    sendResponse({ res, data: { number: nextNumber } });
  } catch (error) {
    next(error);
  }
};
