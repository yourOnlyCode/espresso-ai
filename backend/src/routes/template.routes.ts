import { Router } from 'express';
import { TemplateController } from '../controllers/template.controller';
import { authenticate, authorize } from '../middleware/auth';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);

router.post('/', authorize('admin', 'manager'), auditLog('CREATE', 'template'), TemplateController.create);
router.get('/', TemplateController.getAll);
router.get('/:id', TemplateController.getById);
router.put('/:id', authorize('admin', 'manager'), auditLog('UPDATE', 'template'), TemplateController.update);
router.delete('/:id', authorize('admin', 'manager'), auditLog('DELETE', 'template'), TemplateController.delete);
router.post('/:id/use', TemplateController.incrementUsage);

export default router;
