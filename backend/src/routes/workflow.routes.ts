import { Router } from 'express';
import { WorkflowController } from '../controllers/workflow.controller';
import { authenticate, authorize } from '../middleware/auth';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);

router.post('/', authorize('admin', 'manager'), auditLog('CREATE', 'workflow'), WorkflowController.create);
router.get('/', WorkflowController.getAll);
router.post('/:id/start', auditLog('START', 'workflow'), WorkflowController.startWorkflow);
router.get('/instances', WorkflowController.getWorkflowInstances);
router.post('/approvals/:approvalId/approve', auditLog('APPROVE', 'approval'), WorkflowController.approveStep);
router.post('/approvals/:approvalId/reject', auditLog('REJECT', 'approval'), WorkflowController.rejectStep);

export default router;
