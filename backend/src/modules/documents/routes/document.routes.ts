import { Router } from 'express';
import { getDocuments, getDocumentById, uploadDocument, approveDocument, rejectDocument, getDocumentCategories, getDocumentTypes } from '../controllers/document.controller';
import { protect, requirePermission } from '../../../core/middlewares/auth.middleware';

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

const router = Router();

router.use(protect);

router.get('/categories', requirePermission('document.view'), getDocumentCategories);
router.get('/types', requirePermission('document.view'), getDocumentTypes);

router.get('/', requirePermission('document.view'), getDocuments);
router.get('/:id', requirePermission('document.view'), getDocumentById);

router.post('/upload', requirePermission('document.upload'), upload.single('file'), uploadDocument);

router.patch('/:id/approve', requirePermission('document.approve'), approveDocument);
router.patch('/:id/reject', requirePermission('document.approve'), rejectDocument);

export default router;
