import { Router } from 'express';
import { LibraryController } from '../controllers/library.controller';
import { protect, requirePermission } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';

const router = Router();
router.use(tenantMiddleware, protect);

// ─── DASHBOARD & ANALYTICS ──────────────────────────────────
router.get('/dashboard', requirePermission('library.view'), LibraryController.getDashboard);
router.get('/analytics', requirePermission('library.reports.view'), LibraryController.getAnalytics);

// ─── CATALOGUE — BOOKS ──────────────────────────────────────
router.get('/books', LibraryController.getBooks);
router.post('/books', requirePermission('library.catalogue.manage'), LibraryController.createBook);
router.get('/books/:bookId', LibraryController.getBookById);
router.patch('/books/:bookId', requirePermission('library.catalogue.manage'), LibraryController.updateBook);

// ─── CATALOGUE — AUTHORS ────────────────────────────────────
router.get('/authors', LibraryController.getAuthors);
router.post('/authors', requirePermission('library.catalogue.manage'), LibraryController.createAuthor);
router.patch('/authors/:authorId', requirePermission('library.catalogue.manage'), LibraryController.updateAuthor);

// ─── CATALOGUE — PUBLISHERS ─────────────────────────────────
router.get('/publishers', LibraryController.getPublishers);
router.post('/publishers', requirePermission('library.catalogue.manage'), LibraryController.createPublisher);
router.patch('/publishers/:publisherId', requirePermission('library.catalogue.manage'), LibraryController.updatePublisher);

// ─── CATALOGUE — CATEGORIES ─────────────────────────────────
router.get('/categories', LibraryController.getCategories);
router.post('/categories', requirePermission('library.catalogue.manage'), LibraryController.createCategory);
router.patch('/categories/:categoryId', requirePermission('library.catalogue.manage'), LibraryController.updateCategory);

// ─── CATALOGUE — SUBJECTS ────────────────────────────────────
router.get('/subjects', LibraryController.getSubjects);
router.post('/subjects', requirePermission('library.catalogue.manage'), LibraryController.createSubject);
router.patch('/subjects/:subjectId', requirePermission('library.catalogue.manage'), LibraryController.updateSubject);

// ─── BOOK COPIES ─────────────────────────────────────────────
router.get('/copies', LibraryController.getBookCopies);
router.post('/copies', requirePermission('library.copy.manage'), LibraryController.createBookCopy);
router.get('/copies/:copyId', LibraryController.getBookCopyById);
router.patch('/copies/:copyId', requirePermission('library.copy.manage'), LibraryController.updateBookCopy);
router.patch('/copies/:copyId/mark-lost', requirePermission('library.lost.manage'), LibraryController.markCopyLost);
router.patch('/copies/:copyId/mark-damaged', requirePermission('library.damage.manage'), LibraryController.markCopyDamaged);
router.patch('/copies/:copyId/under-repair', requirePermission('library.damage.manage'), LibraryController.markCopyUnderRepair);
router.patch('/copies/:copyId/repaired', requirePermission('library.damage.manage'), LibraryController.markCopyRepaired);
router.patch('/copies/:copyId/found', requirePermission('library.lost.manage'), LibraryController.markCopyFound);

// ─── LOCATION — SECTIONS / RACKS / SHELVES ──────────────────
router.get('/sections', requirePermission('library.view'), LibraryController.getSections);
router.post('/sections', requirePermission('library.policy.manage'), LibraryController.createSection);
router.get('/racks', requirePermission('library.view'), LibraryController.getRacks);
router.post('/racks', requirePermission('library.policy.manage'), LibraryController.createRack);
router.get('/shelves', requirePermission('library.view'), LibraryController.getShelves);
router.post('/shelves', requirePermission('library.policy.manage'), LibraryController.createShelf);

// ─── LIBRARY CARDS ───────────────────────────────────────────
router.get('/cards', requirePermission('library.members.manage'), LibraryController.getLibraryCards);
router.post('/cards', requirePermission('library.members.manage'), LibraryController.issueLibraryCard);
router.patch('/cards/:cardId/block', requirePermission('library.members.manage'), LibraryController.blockLibraryCard);
router.patch('/cards/:cardId/replace', requirePermission('library.members.manage'), LibraryController.replaceLibraryCard);

// ─── CIRCULATION ─────────────────────────────────────────────
router.get('/circulation/issues', requirePermission('library.issue.manage'), LibraryController.getActiveIssues);
router.post('/circulation/issue', requirePermission('library.issue.manage'), LibraryController.issueBook);
router.post('/circulation/return/:issueId', requirePermission('library.return.manage'), LibraryController.returnBook);
router.post('/circulation/renew/:issueId', requirePermission('library.renew.manage'), LibraryController.renewBook);
router.post('/circulation/reserve', LibraryController.reserveBook);
router.get('/circulation/reservations', LibraryController.getReservations);
router.delete('/circulation/reservations/:reservationId', LibraryController.cancelReservation);

// ─── OVERDUE ─────────────────────────────────────────────────
router.get('/overdue', requirePermission('library.view'), LibraryController.getOverdueIssues);

// ─── FINES ───────────────────────────────────────────────────
router.get('/fines', requirePermission('library.fine.view'), LibraryController.getFines);
router.post('/fines', requirePermission('library.fine.manage'), LibraryController.createFine);
router.patch('/fines/:fineId/pay', requirePermission('library.fine.manage'), LibraryController.recordFinePayment);
router.post('/fines/:fineId/waive', requirePermission('library.fine.waive'), LibraryController.waiveFine);
router.post('/fines/:fineId/waiver-request', LibraryController.requestFineWaiver);
router.get('/fine-waivers', requirePermission('library.fine.waive'), LibraryController.getFineWaivers);
router.patch('/fine-waivers/:waiverId/review', requirePermission('library.fine.waive'), LibraryController.reviewFineWaiver);
router.post('/fines/:fineId/pay-online', LibraryController.initiateFinePayment);

// ─── MEMBERS ─────────────────────────────────────────────────
router.get('/members', requirePermission('library.members.manage'), LibraryController.getMembers);
router.post('/members', requirePermission('library.members.manage'), LibraryController.registerMember);
router.patch('/members/:membershipId/status', requirePermission('library.members.manage'), LibraryController.updateMemberStatus);
router.get('/members/stats', requirePermission('library.view'), LibraryController.getMembershipStats);
router.get('/members/:membershipId/history', requirePermission('library.members.manage'), LibraryController.getMemberHistory);

// ─── ACQUISITIONS ────────────────────────────────────────────
router.post('/acquisitions/:acquisitionId/process', requirePermission('library.acquisition.manage'), LibraryController.processAcquisition);

// ─── TRANSFERS ───────────────────────────────────────────────
router.post('/transfers/request', requirePermission('library.copy.manage'), LibraryController.requestTransfer);
router.post('/transfers/:transferId/process', requirePermission('library.copy.manage'), LibraryController.processTransfer);

// ─── DISPOSALS ───────────────────────────────────────────────
router.post('/disposals', requirePermission('library.copy.manage'), LibraryController.processDisposal);

// ─── STOCK VERIFICATION ──────────────────────────────────────
router.post('/stock-verification/start', requirePermission('library.stocktake.manage'), LibraryController.startStockVerification);
router.post('/stock-verification/:auditId/finalize', requirePermission('library.stocktake.manage'), LibraryController.finalizeStockVerification);
router.get('/stock-verifications', requirePermission('library.stocktake.manage'), LibraryController.getStockVerifications);

// ─── VENDORS ─────────────────────────────────────────────────
router.get('/vendors', requirePermission('library.vendor.view'), LibraryController.getVendors);
router.post('/vendors', requirePermission('library.acquisition.manage'), LibraryController.createVendor);
router.patch('/vendors/:vendorId', requirePermission('library.acquisition.manage'), LibraryController.updateVendor);

// ─── PURCHASE REQUESTS ───────────────────────────────────────
router.get('/purchase-requests', requirePermission('library.view'), LibraryController.getPurchaseRequests);
router.post('/purchase-requests', LibraryController.createPurchaseRequest);
router.patch('/purchase-requests/:requestId/approve', requirePermission('library.acquisition.manage'), LibraryController.approvePurchaseRequest);

// ─── DONATIONS ───────────────────────────────────────────────
router.get('/donations', requirePermission('library.acquisition.manage'), LibraryController.getDonations);
router.post('/donations', requirePermission('library.acquisition.manage'), LibraryController.recordDonation);

// ─── DIGITAL RESOURCES ───────────────────────────────────────
router.get('/digital-resources', LibraryController.getDigitalResources);
router.post('/digital-resources', requirePermission('library.digital.manage'), LibraryController.createDigitalResource);
router.patch('/digital-resources/:resourceId', requirePermission('library.digital.manage'), LibraryController.updateDigitalResource);
router.delete('/digital-resources/:resourceId', requirePermission('library.digital.manage'), LibraryController.deleteDigitalResource);
router.post('/digital-resources/:resourceId/access', LibraryController.accessDigitalResource);
router.get('/digital-resources/:resourceId/stats', requirePermission('library.view'), LibraryController.getDigitalResourceStats);

// ─── LIBRARY ATTENDANCE ──────────────────────────────────────
router.get('/attendance', requirePermission('library.attendance.view'), LibraryController.getLibraryAttendance);
router.post('/attendance/entry', requirePermission('library.attendance.view'), LibraryController.recordLibraryEntry);
router.patch('/attendance/:visitId/exit', requirePermission('library.attendance.view'), LibraryController.recordLibraryExit);
router.get('/attendance/occupancy', requirePermission('library.view'), LibraryController.getLibraryOccupancy);

// ─── READING PROGRAMS ────────────────────────────────────────
router.get('/reading-programs', LibraryController.getReadingPrograms);
router.post('/reading-programs', requirePermission('library.catalogue.manage'), LibraryController.createReadingProgram);
router.patch('/reading-programs/:programId', requirePermission('library.catalogue.manage'), LibraryController.updateReadingProgram);
router.post('/reading-programs/:programId/enroll', LibraryController.enrollInReadingProgram);

// ─── READING LOG ─────────────────────────────────────────────
router.get('/reading-log', LibraryController.getReadingLog);
router.post('/reading-log', LibraryController.addReadingLogEntry);
router.patch('/reading-log/:logId', LibraryController.updateReadingLogEntry);

// ─── REPORTS ─────────────────────────────────────────────────
router.get('/reports/overview', requirePermission('library.reports.view'), LibraryController.getReportsOverview);
router.get('/reports/issued', requirePermission('library.reports.view'), LibraryController.getIssuedBooksReport);
router.get('/reports/overdue', requirePermission('library.reports.view'), LibraryController.getOverdueReport);
router.get('/reports/fines', requirePermission('library.reports.view'), LibraryController.getFinesReport);
router.get('/reports/acquisition', requirePermission('library.reports.view'), LibraryController.getAcquisitionReport);

// ─── LIBRARY SETTINGS ────────────────────────────────────────
router.get('/settings', requirePermission('library.policy.manage'), LibraryController.getLibrarySettings);
router.patch('/settings', requirePermission('library.policy.manage'), LibraryController.updateLibrarySettings);

export default router;
