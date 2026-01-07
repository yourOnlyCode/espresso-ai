import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticate, authorize } from '../middleware/auth';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);

router.post('/', auditLog('CREATE', 'document'), DocumentController.create);
router.get('/', DocumentController.getAll);
router.get('/:id', DocumentController.getById);
router.put('/:id', auditLog('UPDATE', 'document'), DocumentController.update);
router.delete('/:id', authorize('admin', 'manager'), auditLog('DELETE', 'document'), DocumentController.delete);
router.post('/:id/generate-pdf', DocumentController.generatePDF);
router.post('/:id/analyze', DocumentController.analyzeWithAI);
router.get('/:id/versions', DocumentController.getVersions);

export default router;
