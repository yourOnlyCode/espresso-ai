import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', AnalyticsController.getDashboard);
router.get('/documents', AnalyticsController.getDocumentAnalytics);
router.get('/users', AnalyticsController.getUserActivity);
router.get('/compliance', AnalyticsController.getComplianceReport);

export default router;
