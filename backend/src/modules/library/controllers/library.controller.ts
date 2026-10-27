import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { LibraryCatalogueService } from '../services/libraryCatalogue.service';
import { CirculationService } from '../services/circulation.service';
import { LibraryFineService } from '../services/libraryFine.service';
import { AcquisitionService } from '../services/acquisition.service';
import { LibraryInventoryService } from '../services/inventory.service';
import { DigitalLibraryService } from '../services/digitalLibrary.service';
import { LibraryMembershipService } from '../services/libraryMembership.service';
import { LibraryAdminService } from '../services/libraryAdmin.service';
import { sendResponse } from '../../../core/utils/response.util';
import { LibraryService } from '../services/library.service';

export class LibraryController {
  // Dashboard
  static async getDashboard(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryService(req.tenantId!).getDashboardStats();
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  // Books & Copies
  static async getBooks(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryCatalogueService(req.tenantId!).getBooks({
        categoryId: req.query.categoryId ? String(req.query.categoryId) : undefined,
        search: req.query.search ? String(req.query.search) : undefined,
        sectionId: req.query.sectionId ? String(req.query.sectionId) : undefined
      });
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }
  static async getBookCopies(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryCatalogueService(req.tenantId!).getBookCopies(req.query.bookId ? String(req.query.bookId) : undefined);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  // Circulation
  static async getActiveIssues(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new CirculationService(req.tenantId!).getActiveIssues(
        req.query.userId ? String(req.query.userId) : undefined,
        req.query.copyBarcode ? String(req.query.copyBarcode) : undefined
      );
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }
  static async issueBook(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new CirculationService(req.tenantId!).issueBook({ ...req.body, issuedByUserId: req.user!.id });
      sendResponse({ res, status: 201, message: 'Book Issued Successfully', data });
    } catch (e) { next(e); }
  }
  static async returnBook(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new CirculationService(req.tenantId!).returnBook(req.params.issueId as string, { ...req.body, receivedByUserId: req.user!.id });
      sendResponse({ res, status: 200, message: 'Book Returned Successfully', data });
    } catch (e) { next(e); }
  }
  static async renewBook(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new CirculationService(req.tenantId!).renewBook(req.params.issueId as string, { ...req.body, renewedByUserId: req.user!.id });
      sendResponse({ res, status: 200, message: 'Book Renewed Successfully', data });
    } catch (e) { next(e); }
  }
  static async reserveBook(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.body.userId || req.user?.id || req.user?._id;
      const data = await new CirculationService(req.tenantId!).reserveBook({ ...req.body, userId });
      sendResponse({ res, status: 201, message: 'Book Reserved Successfully', data });
    } catch (e) { next(e); }
  }

  // Overdue
  static async getOverdueIssues(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).getOverdueIssues();
      sendResponse({ res, status: 200, message: 'Overdue issues fetched', data });
    } catch (e) { next(e); }
  }

  // Fines
  static async getFines(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryFineService(req.tenantId!).getFines(req.query.userId ? String(req.query.userId) : undefined);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }
  static async waiveFine(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryFineService(req.tenantId!).waiveFine(req.params.fineId as string, req.body.waivedAmount, req.user!.id as string, req.body.reason);
      sendResponse({ res, status: 200, message: 'Fine Waived Successfully', data });
    } catch (e) { next(e); }
  }
  static async initiateFinePayment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryFineService(req.tenantId!).initiateFinePayment(req.params.fineId as string, req.body.studentId, req.body.branchId, req.body.academicYearId);
      sendResponse({ res, status: 200, message: 'Payment Initiated', data });
    } catch (e) { next(e); }
  }

  // Acquisitions & Inventory
  static async processAcquisition(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new AcquisitionService(req.tenantId!).processAcquisition(req.params.acquisitionId as string, req.body.copies);
      sendResponse({ res, status: 200, message: 'Acquisition Processed', data });
    } catch (e) { next(e); }
  }
  static async requestTransfer(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryInventoryService(req.tenantId!).requestTransfer({ ...req.body, requestedByUserId: req.user!.id });
      sendResponse({ res, status: 201, message: 'Transfer Requested', data });
    } catch (e) { next(e); }
  }
  static async processTransfer(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryInventoryService(req.tenantId!).processTransfer(req.params.transferId as string, req.body.action, req.user!.id);
      sendResponse({ res, status: 200, message: 'Transfer Processed', data });
    } catch (e) { next(e); }
  }
  static async processDisposal(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryInventoryService(req.tenantId!).processDisposal({ ...req.body, requestedByUserId: req.user!.id });
      sendResponse({ res, status: 200, message: 'Disposal Processed', data });
    } catch (e) { next(e); }
  }
  static async startStockVerification(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryInventoryService(req.tenantId!).startStockVerification(req.body.libraryId, req.user!.id as string);
      sendResponse({ res, status: 201, message: 'Stock Verification Started', data });
    } catch (e) { next(e); }
  }
  static async finalizeStockVerification(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryInventoryService(req.tenantId!).finalizeStockVerification(req.params.auditId as string, req.body);
      sendResponse({ res, status: 200, message: 'Stock Verification Finalized', data });
    } catch (e) { next(e); }
  }

  // Vendors
  static async getVendors(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).getVendors(req.query.status as string | undefined);
      sendResponse({ res, status: 200, message: 'Vendors fetched', data });
    } catch (e) { next(e); }
  }
  static async createVendor(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).createVendor(req.body, req.user!.id);
      sendResponse({ res, status: 201, message: 'Vendor created', data });
    } catch (e) { next(e); }
  }
  static async updateVendor(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).updateVendor(req.params.vendorId as string, req.body);
      sendResponse({ res, status: 200, message: 'Vendor updated', data });
    } catch (e) { next(e); }
  }

  // Purchase Requests
  static async getPurchaseRequests(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).getPurchaseRequests(req.query.status as string | undefined);
      sendResponse({ res, status: 200, message: 'Purchase requests fetched', data });
    } catch (e) { next(e); }
  }
  static async createPurchaseRequest(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).createPurchaseRequest(req.body, req.user!.id);
      sendResponse({ res, status: 201, message: 'Purchase request created', data });
    } catch (e) { next(e); }
  }
  static async approvePurchaseRequest(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { approved, reason } = req.body;
      const data = await new LibraryAdminService(req.tenantId!).approvePurchaseRequest(req.params.requestId as string, req.user!.id, approved, reason);
      sendResponse({ res, status: 200, message: approved ? 'Request approved' : 'Request rejected', data });
    } catch (e) { next(e); }
  }

  // Members
  static async getMembers(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryMembershipService(req.tenantId!).getMembers({ status: req.query.status as string, memberType: req.query.memberType as string });
      sendResponse({ res, status: 200, message: 'Members fetched', data });
    } catch (e) { next(e); }
  }
  static async registerMember(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryMembershipService(req.tenantId!).registerMember(req.body);
      sendResponse({ res, status: 201, message: 'Member registered', data });
    } catch (e) { next(e); }
  }
  static async updateMemberStatus(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryMembershipService(req.tenantId!).updateMemberStatus(req.params.membershipId as string, req.body.status, req.body.reason);
      sendResponse({ res, status: 200, message: 'Member status updated', data });
    } catch (e) { next(e); }
  }
  static async getMembershipStats(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryMembershipService(req.tenantId!).getMembershipStats();
      sendResponse({ res, status: 200, message: 'Membership stats fetched', data });
    } catch (e) { next(e); }
  }

  // Book Copy Status Management
  static async markCopyLost(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).markCopyLost(req.params.copyId as string, req.body.notes);
      sendResponse({ res, status: 200, message: 'Copy marked as LOST', data });
    } catch (e) { next(e); }
  }
  static async markCopyDamaged(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).markCopyDamaged(req.params.copyId as string, req.body.notes);
      sendResponse({ res, status: 200, message: 'Copy marked as DAMAGED', data });
    } catch (e) { next(e); }
  }
  static async markCopyUnderRepair(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).markCopyUnderRepair(req.params.copyId as string);
      sendResponse({ res, status: 200, message: 'Copy sent for repair', data });
    } catch (e) { next(e); }
  }
  static async markCopyRepaired(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).markCopyRepaired(req.params.copyId as string);
      sendResponse({ res, status: 200, message: 'Copy marked as repaired', data });
    } catch (e) { next(e); }
  }
  static async markCopyFound(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).markCopyFound(req.params.copyId as string, req.body.condition);
      sendResponse({ res, status: 200, message: 'Copy marked as found', data });
    } catch (e) { next(e); }
  }

  // Digital Resources
  static async getDigitalResources(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new DigitalLibraryService(req.tenantId!).getResources({
        categoryId: req.query.categoryId as string,
        resourceType: req.query.resourceType as string,
        search: req.query.search as string,
        status: req.query.status as string,
      });
      sendResponse({ res, status: 200, message: 'Digital resources fetched', data });
    } catch (e) { next(e); }
  }
  static async createDigitalResource(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new DigitalLibraryService(req.tenantId!).createResource(req.body, req.user!.id);
      sendResponse({ res, status: 201, message: 'Digital resource created', data });
    } catch (e) { next(e); }
  }
  static async updateDigitalResource(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new DigitalLibraryService(req.tenantId!).updateResource(req.params.resourceId as string, req.body);
      sendResponse({ res, status: 200, message: 'Digital resource updated', data });
    } catch (e) { next(e); }
  }
  static async deleteDigitalResource(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      await new DigitalLibraryService(req.tenantId!).deleteResource(req.params.resourceId as string);
      sendResponse({ res, status: 200, message: 'Digital resource deleted' });
    } catch (e) { next(e); }
  }
  static async accessDigitalResource(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { accessType = 'VIEW' } = req.body;
      const data = await new DigitalLibraryService(req.tenantId!).accessResource(
        req.params.resourceId as string,
        req.user!.id,
        req.user!.role,
        accessType,
        { ipAddress: req.ip, userAgent: req.headers['user-agent'] as string }
      );
      sendResponse({ res, status: 200, message: 'Access granted', data });
    } catch (e) { next(e); }
  }
  static async getDigitalResourceStats(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new DigitalLibraryService(req.tenantId!).getAccessStats(req.params.resourceId as string);
      sendResponse({ res, status: 200, message: 'Stats fetched', data });
    } catch (e) { next(e); }
  }

  // ─── CATALOGUE CRUD ─────────────────────────────────────────
  static async createBook(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryCatalogueService(req.tenantId!).createBook(req.body);
      sendResponse({ res, status: 201, message: 'Book created', data });
    } catch (e) { next(e); }
  }
  static async getBookById(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryCatalogueService(req.tenantId!).getBookById(req.params.bookId as string);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }
  static async updateBook(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryCatalogueService(req.tenantId!).updateBook(req.params.bookId as string, req.body);
      sendResponse({ res, status: 200, message: 'Book updated', data });
    } catch (e) { next(e); }
  }

  // ─── AUTHORS ────────────────────────────────────────────────
  static async getAuthors(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryCatalogueService(req.tenantId!).getAuthors(req.query);
      sendResponse({ res, status: 200, message: 'Authors fetched', data });
    } catch (e) { next(e); }
  }
  static async createAuthor(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryCatalogueService(req.tenantId!).createAuthor(req.body);
      sendResponse({ res, status: 201, message: 'Author created', data });
    } catch (e) { next(e); }
  }
  static async updateAuthor(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryCatalogueService(req.tenantId!).updateAuthor(req.params.authorId as string, req.body);
      sendResponse({ res, status: 200, message: 'Author updated', data });
    } catch (e) { next(e); }
  }

  // ─── PUBLISHERS ─────────────────────────────────────────────
  static async getPublishers(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryCatalogueService(req.tenantId!).getPublishers(req.query);
      sendResponse({ res, status: 200, message: 'Publishers fetched', data });
    } catch (e) { next(e); }
  }
  static async createPublisher(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryCatalogueService(req.tenantId!).createPublisher(req.body);
      sendResponse({ res, status: 201, message: 'Publisher created', data });
    } catch (e) { next(e); }
  }
  static async updatePublisher(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryCatalogueService(req.tenantId!).updatePublisher(req.params.publisherId as string, req.body);
      sendResponse({ res, status: 200, message: 'Publisher updated', data });
    } catch (e) { next(e); }
  }

  // ─── CATEGORIES / SUBJECTS ───────────────────────────────────
  static async getCategories(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryCatalogueService(req.tenantId!).getCategories(req.query);
      sendResponse({ res, status: 200, message: 'Categories fetched', data });
    } catch (e) { next(e); }
  }
  static async createCategory(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryCatalogueService(req.tenantId!).createCategory(req.body);
      sendResponse({ res, status: 201, message: 'Category created', data });
    } catch (e) { next(e); }
  }
  static async updateCategory(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryCatalogueService(req.tenantId!).updateCategory(req.params.categoryId as string, req.body);
      sendResponse({ res, status: 200, message: 'Category updated', data });
    } catch (e) { next(e); }
  }
  static async getSubjects(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryCatalogueService(req.tenantId!).getSubjects(req.query);
      sendResponse({ res, status: 200, message: 'Subjects fetched', data });
    } catch (e) { next(e); }
  }
  static async createSubject(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryCatalogueService(req.tenantId!).createSubject(req.body);
      sendResponse({ res, status: 201, message: 'Subject created', data });
    } catch (e) { next(e); }
  }
  static async updateSubject(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryCatalogueService(req.tenantId!).updateSubject(req.params.subjectId as string, req.body);
      sendResponse({ res, status: 200, message: 'Subject updated', data });
    } catch (e) { next(e); }
  }

  // ─── BOOK COPIES CRUD ────────────────────────────────────────
  static async createBookCopy(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryCatalogueService(req.tenantId!).createBookCopy(req.body);
      sendResponse({ res, status: 201, message: 'Book copy created', data });
    } catch (e) { next(e); }
  }
  static async getBookCopyById(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryCatalogueService(req.tenantId!).getBookCopyById(req.params.copyId as string);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }
  static async updateBookCopy(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryCatalogueService(req.tenantId!).updateBookCopy(req.params.copyId as string, req.body);
      sendResponse({ res, status: 200, message: 'Copy updated', data });
    } catch (e) { next(e); }
  }

  // ─── LOCATION ────────────────────────────────────────────────
  static async getSections(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).getSections(req.query.libraryId as string);
      sendResponse({ res, status: 200, message: 'Sections fetched', data });
    } catch (e) { next(e); }
  }
  static async createSection(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).createSection(req.body);
      sendResponse({ res, status: 201, message: 'Section created', data });
    } catch (e) { next(e); }
  }
  static async getRacks(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).getRacks(req.query.sectionId as string);
      sendResponse({ res, status: 200, message: 'Racks fetched', data });
    } catch (e) { next(e); }
  }
  static async createRack(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).createRack(req.body);
      sendResponse({ res, status: 201, message: 'Rack created', data });
    } catch (e) { next(e); }
  }
  static async getShelves(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).getShelves(req.query.rackId as string);
      sendResponse({ res, status: 200, message: 'Shelves fetched', data });
    } catch (e) { next(e); }
  }
  static async createShelf(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).createShelf(req.body);
      sendResponse({ res, status: 201, message: 'Shelf created', data });
    } catch (e) { next(e); }
  }

  // ─── LIBRARY CARDS ───────────────────────────────────────────
  static async getLibraryCards(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryMembershipService(req.tenantId!).getLibraryCards(req.query);
      sendResponse({ res, status: 200, message: 'Library cards fetched', data });
    } catch (e) { next(e); }
  }
  static async issueLibraryCard(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryMembershipService(req.tenantId!).issueLibraryCard({ ...req.body, issuedBy: req.user!.id });
      sendResponse({ res, status: 201, message: 'Library card issued', data });
    } catch (e) { next(e); }
  }
  static async blockLibraryCard(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryMembershipService(req.tenantId!).blockLibraryCard(req.params.cardId as string, req.body.reason, req.user!.id);
      sendResponse({ res, status: 200, message: 'Card blocked', data });
    } catch (e) { next(e); }
  }
  static async replaceLibraryCard(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryMembershipService(req.tenantId!).replaceLibraryCard(req.params.cardId as string, req.body, req.user!.id);
      sendResponse({ res, status: 201, message: 'Library card replaced', data });
    } catch (e) { next(e); }
  }

  // ─── RESERVATIONS ─────────────────────────────────────────────
  static async getReservations(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new CirculationService(req.tenantId!).getReservations(req.query);
      sendResponse({ res, status: 200, message: 'Reservations fetched', data });
    } catch (e) { next(e); }
  }
  static async cancelReservation(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new CirculationService(req.tenantId!).cancelReservation(req.params.reservationId as string, req.user!.id);
      sendResponse({ res, status: 200, message: 'Reservation cancelled', data });
    } catch (e) { next(e); }
  }
  static async getMemberHistory(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryMembershipService(req.tenantId!).getMemberHistory(req.params.membershipId as string);
      sendResponse({ res, status: 200, message: 'Member history fetched', data });
    } catch (e) { next(e); }
  }

  // ─── FINE WAIVERS ────────────────────────────────────────────
  static async createFine(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryFineService(req.tenantId!).createFine(req.body);
      sendResponse({ res, status: 201, message: 'Fine created', data });
    } catch (e) { next(e); }
  }
  static async recordFinePayment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryFineService(req.tenantId!).recordFinePayment(req.params.fineId as string, req.body, req.user!.id);
      sendResponse({ res, status: 200, message: 'Payment recorded', data });
    } catch (e) { next(e); }
  }
  static async requestFineWaiver(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryFineService(req.tenantId!).requestFineWaiver(req.params.fineId as string, req.body, req.user!.id);
      sendResponse({ res, status: 201, message: 'Waiver request submitted', data });
    } catch (e) { next(e); }
  }
  static async getFineWaivers(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryFineService(req.tenantId!).getFineWaivers(req.query);
      sendResponse({ res, status: 200, message: 'Fine waivers fetched', data });
    } catch (e) { next(e); }
  }
  static async reviewFineWaiver(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryFineService(req.tenantId!).reviewFineWaiver(req.params.waiverId as string, req.body, req.user!.id);
      sendResponse({ res, status: 200, message: 'Waiver reviewed', data });
    } catch (e) { next(e); }
  }

  // ─── STOCK VERIFICATIONS / DONATIONS ─────────────────────────
  static async getStockVerifications(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryInventoryService(req.tenantId!).getStockVerifications(req.query);
      sendResponse({ res, status: 200, message: 'Stock verifications fetched', data });
    } catch (e) { next(e); }
  }
  static async getDonations(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new AcquisitionService(req.tenantId!).getDonations(req.query);
      sendResponse({ res, status: 200, message: 'Donations fetched', data });
    } catch (e) { next(e); }
  }
  static async recordDonation(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new AcquisitionService(req.tenantId!).recordDonation(req.body, req.user!.id);
      sendResponse({ res, status: 201, message: 'Donation recorded', data });
    } catch (e) { next(e); }
  }

  // ─── LIBRARY ATTENDANCE ──────────────────────────────────────
  static async getLibraryAttendance(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).getLibraryAttendance(req.query);
      sendResponse({ res, status: 200, message: 'Attendance fetched', data });
    } catch (e) { next(e); }
  }
  static async recordLibraryEntry(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).recordLibraryEntry({ ...req.body, recordedBy: req.user!.id });
      sendResponse({ res, status: 201, message: 'Entry recorded', data });
    } catch (e) { next(e); }
  }
  static async recordLibraryExit(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).recordLibraryExit(req.params.visitId as string);
      sendResponse({ res, status: 200, message: 'Exit recorded', data });
    } catch (e) { next(e); }
  }
  static async getLibraryOccupancy(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).getLibraryOccupancy(req.query.libraryId as string);
      sendResponse({ res, status: 200, message: 'Occupancy fetched', data });
    } catch (e) { next(e); }
  }

  // ─── READING PROGRAMS ────────────────────────────────────────
  static async getReadingPrograms(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).getReadingPrograms(req.query);
      sendResponse({ res, status: 200, message: 'Reading programs fetched', data });
    } catch (e) { next(e); }
  }
  static async createReadingProgram(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).createReadingProgram({ ...req.body, createdBy: req.user!.id });
      sendResponse({ res, status: 201, message: 'Reading program created', data });
    } catch (e) { next(e); }
  }
  static async updateReadingProgram(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).updateReadingProgram(req.params.programId as string, req.body);
      sendResponse({ res, status: 200, message: 'Reading program updated', data });
    } catch (e) { next(e); }
  }
  static async enrollInReadingProgram(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).enrollInReadingProgram(req.params.programId as string, req.user!.id);
      sendResponse({ res, status: 201, message: 'Enrolled in reading program', data });
    } catch (e) { next(e); }
  }

  // ─── READING LOG ─────────────────────────────────────────────
  static async getReadingLog(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).getReadingLog(req.user!.id, req.query);
      sendResponse({ res, status: 200, message: 'Reading log fetched', data });
    } catch (e) { next(e); }
  }
  static async addReadingLogEntry(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).addReadingLogEntry({ ...req.body, userId: req.user!.id });
      sendResponse({ res, status: 201, message: 'Reading log entry added', data });
    } catch (e) { next(e); }
  }
  static async updateReadingLogEntry(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).updateReadingLogEntry(req.params.logId as string, req.body, req.user!.id);
      sendResponse({ res, status: 200, message: 'Reading log updated', data });
    } catch (e) { next(e); }
  }

  // ─── ANALYTICS & REPORTS ─────────────────────────────────────
  static async getAnalytics(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryService(req.tenantId!).getAnalytics(req.query);
      sendResponse({ res, status: 200, message: 'Analytics fetched', data });
    } catch (e) { next(e); }
  }
  static async getReportsOverview(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).getReportsOverview(req.query);
      sendResponse({ res, status: 200, message: 'Report overview fetched', data });
    } catch (e) { next(e); }
  }
  static async getIssuedBooksReport(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).getIssuedBooksReport(req.query);
      sendResponse({ res, status: 200, message: 'Issued books report fetched', data });
    } catch (e) { next(e); }
  }
  static async getOverdueReport(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).getOverdueReport(req.query);
      sendResponse({ res, status: 200, message: 'Overdue report fetched', data });
    } catch (e) { next(e); }
  }
  static async getFinesReport(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).getFinesReport(req.query);
      sendResponse({ res, status: 200, message: 'Fines report fetched', data });
    } catch (e) { next(e); }
  }
  static async getAcquisitionReport(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).getAcquisitionReport(req.query);
      sendResponse({ res, status: 200, message: 'Acquisition report fetched', data });
    } catch (e) { next(e); }
  }

  // ─── SETTINGS ────────────────────────────────────────────────
  static async getLibrarySettings(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).getLibrarySettings();
      sendResponse({ res, status: 200, message: 'Settings fetched', data });
    } catch (e) { next(e); }
  }
  static async updateLibrarySettings(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LibraryAdminService(req.tenantId!).updateLibrarySettings(req.body);
      sendResponse({ res, status: 200, message: 'Settings updated', data });
    } catch (e) { next(e); }
  }
}
