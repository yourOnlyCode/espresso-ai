import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export class AnalyticsController {
  static async getDashboard(req: AuthRequest, res: Response) {
    try {
      const [
        documentStats,
        templateStats,
        workflowStats,
        recentActivity,
      ] = await Promise.all([
        pool.query(
          `SELECT 
             COUNT(*) as total_documents,
             COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
             COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count,
             SUM(file_size) as total_storage
           FROM documents WHERE organization_id = $1`,
          [req.user!.organizationId]
        ),
        pool.query(
          'SELECT COUNT(*) as total_templates FROM templates WHERE organization_id = $1',
          [req.user!.organizationId]
        ),
        pool.query(
          `SELECT 
             COUNT(*) as total_workflows,
             COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_workflows,
             COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as active_workflows
           FROM workflow_instances wi
           JOIN workflows w ON wi.workflow_id = w.id
           WHERE w.organization_id = $1`,
          [req.user!.organizationId]
        ),
        pool.query(
          `SELECT action, resource_type, created_at, 
                  u.first_name || ' ' || u.last_name as user_name
           FROM audit_logs al
           LEFT JOIN users u ON al.user_id = u.id
           WHERE al.organization_id = $1
           ORDER BY al.created_at DESC
           LIMIT 10`,
          [req.user!.organizationId]
        ),
      ]);

      res.json({
        documents: documentStats.rows[0],
        templates: templateStats.rows[0],
        workflows: workflowStats.rows[0],
        recentActivity: recentActivity.rows,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  }

  static async getDocumentAnalytics(req: AuthRequest, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      const result = await pool.query(
        `SELECT 
           DATE(created_at) as date,
           COUNT(*) as count,
           document_type
         FROM documents
         WHERE organization_id = $1
           AND created_at >= $2
           AND created_at <= $3
         GROUP BY DATE(created_at), document_type
         ORDER BY date DESC`,
        [req.user!.organizationId, startDate || '2024-01-01', endDate || new Date()]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch document analytics' });
    }
  }

  static async getUserActivity(req: AuthRequest, res: Response) {
    try {
      const result = await pool.query(
        `SELECT 
           u.id,
           u.first_name || ' ' || u.last_name as name,
           COUNT(DISTINCT d.id) as documents_created,
           COUNT(DISTINCT al.id) as total_actions,
           MAX(al.created_at) as last_activity
         FROM users u
         LEFT JOIN documents d ON u.id = d.created_by
         LEFT JOIN audit_logs al ON u.id = al.user_id
         WHERE u.organization_id = $1
         GROUP BY u.id, u.first_name, u.last_name
         ORDER BY total_actions DESC`,
        [req.user!.organizationId]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user activity' });
    }
  }

  static async getComplianceReport(req: AuthRequest, res: Response) {
    try {
      const result = await pool.query(
        `SELECT 
           d.document_type,
           d.status,
           COUNT(*) as count,
           AVG(EXTRACT(EPOCH FROM (d.updated_at - d.created_at))/3600) as avg_completion_hours
         FROM documents d
         WHERE d.organization_id = $1
         GROUP BY d.document_type, d.status`,
        [req.user!.organizationId]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch compliance report' });
    }
  }
}
