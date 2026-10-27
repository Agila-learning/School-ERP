import { BaseRepository } from '../../../core/repositories/base.repository';
import AdmissionEnquiry, { IAdmissionEnquiry } from '../models/AdmissionEnquiry.model';
import AdmissionFollowUp, { IAdmissionFollowUp } from '../models/AdmissionFollowUp.model';
import AdmissionApplication, { IAdmissionApplication } from '../models/AdmissionApplication.model';
import AdmissionDocument, { IAdmissionDocument } from '../models/AdmissionDocument.model';
import AdmissionInterview, { IAdmissionInterview } from '../models/AdmissionInterview.model';
import AdmissionAssessment, { IAdmissionAssessment } from '../models/AdmissionAssessment.model';

export class AdmissionEnquiryRepository extends BaseRepository<IAdmissionEnquiry> {
  constructor(tenantId: string) { super(AdmissionEnquiry, tenantId); }
}

export class AdmissionFollowUpRepository extends BaseRepository<IAdmissionFollowUp> {
  constructor(tenantId: string) { super(AdmissionFollowUp, tenantId); }
}

export class AdmissionApplicationRepository extends BaseRepository<IAdmissionApplication> {
  constructor(tenantId: string) { super(AdmissionApplication, tenantId); }
}

export class AdmissionDocumentRepository extends BaseRepository<IAdmissionDocument> {
  constructor(tenantId: string) { super(AdmissionDocument, tenantId); }
}

export class AdmissionInterviewRepository extends BaseRepository<IAdmissionInterview> {
  constructor(tenantId: string) { super(AdmissionInterview, tenantId); }
}

export class AdmissionAssessmentRepository extends BaseRepository<IAdmissionAssessment> {
  constructor(tenantId: string) { super(AdmissionAssessment, tenantId); }
}
