import mongoose from 'mongoose';
import Asset from '../models/Asset.model';
import AssetTransfer from '../models/AssetTransfer.model';
import AssetMaintenance from '../models/AssetMaintenance.model';
import AssetDisposal from '../models/AssetDisposal.model';
import { ValidationError } from '../../../core/errors/AppError';

export class AssetService {
  
  static async allocateAsset(assetId: mongoose.Types.ObjectId, tenantId: mongoose.Types.ObjectId, allocateToType: 'EMPLOYEE' | 'DEPARTMENT', allocateToId: mongoose.Types.ObjectId, allocatedBy: mongoose.Types.ObjectId) {
    const asset = await Asset.findOne({ _id: assetId, tenantId, status: 'AVAILABLE' });
    if (!asset) throw new ValidationError('Asset is not available for allocation');

    asset.status = 'ASSIGNED';
    if (allocateToType === 'EMPLOYEE') {
      asset.assignedToEmployeeId = allocateToId;
      asset.assignedToDepartmentId = undefined;
    } else {
      asset.assignedToDepartmentId = allocateToId;
      asset.assignedToEmployeeId = undefined;
    }

    await asset.save();
    return asset;
  }

  static async returnAsset(assetId: mongoose.Types.ObjectId, tenantId: mongoose.Types.ObjectId, condition: 'GOOD' | 'DAMAGED' = 'GOOD') {
    const asset = await Asset.findOne({ _id: assetId, tenantId, status: { $in: ['ASSIGNED', 'IN_USE'] } });
    if (!asset) throw new ValidationError('Asset is not currently assigned');

    asset.status = condition === 'DAMAGED' ? 'DAMAGED' : 'AVAILABLE';
    asset.assignedToEmployeeId = undefined;
    asset.assignedToDepartmentId = undefined;

    await asset.save();
    return asset;
  }

  static async transferAsset(tenantId: mongoose.Types.ObjectId, transferData: any, requestedBy: mongoose.Types.ObjectId) {
    const asset = await Asset.findOne({ _id: transferData.assetId, tenantId });
    if (!asset) throw new ValidationError('Asset not found');

    const transfer = await AssetTransfer.create({
      ...transferData,
      tenantId,
      requestedBy,
      status: 'COMPLETED' // Simplified auto-approval/completion
    });

    // Update asset location/assignment
    if (transferData.toLocationId) asset.currentLocationId = transferData.toLocationId;
    if (transferData.toEmployeeId) {
      asset.assignedToEmployeeId = transferData.toEmployeeId;
      asset.assignedToDepartmentId = undefined;
    }
    if (transferData.toDepartmentId) {
      asset.assignedToDepartmentId = transferData.toDepartmentId;
      asset.assignedToEmployeeId = undefined;
    }

    await asset.save();
    return transfer;
  }

  static async createMaintenanceRecord(tenantId: mongoose.Types.ObjectId, maintenanceData: any, reportedBy: mongoose.Types.ObjectId) {
    const asset = await Asset.findOne({ _id: maintenanceData.assetId, tenantId });
    if (!asset) throw new ValidationError('Asset not found');

    const maintenance = await AssetMaintenance.create({
      ...maintenanceData,
      tenantId,
      reportedBy,
      status: 'REPORTED'
    });

    asset.status = 'UNDER_MAINTENANCE';
    await asset.save();

    return maintenance;
  }

  static async completeMaintenance(maintenanceId: mongoose.Types.ObjectId, tenantId: mongoose.Types.ObjectId, completionData: any) {
    const maintenance = await AssetMaintenance.findOneAndUpdate(
      { _id: maintenanceId, tenantId },
      { ...completionData, status: 'COMPLETED', endDate: new Date() },
      { new: true }
    );
    if (!maintenance) throw new ValidationError('Maintenance record not found');

    const asset = await Asset.findOne({ _id: maintenance.assetId, tenantId });
    if (asset) {
      // Logic could depend on condition, assuming available once repaired
      asset.status = 'AVAILABLE';
      await asset.save();
    }

    return maintenance;
  }

  static async disposeAsset(tenantId: mongoose.Types.ObjectId, disposalData: any, requestedBy: mongoose.Types.ObjectId) {
    const asset = await Asset.findOne({ _id: disposalData.assetId, tenantId });
    if (!asset) throw new ValidationError('Asset not found');

    const disposal = await AssetDisposal.create({
      ...disposalData,
      tenantId,
      requestedBy,
      status: 'APPROVED', // Assuming auto-approve for simplicity
      approvedBy: requestedBy
    });

    asset.status = 'DISPOSED';
    await asset.save();

    return disposal;
  }
}
