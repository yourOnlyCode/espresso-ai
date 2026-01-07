import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export class WorkflowController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const { name, description, triggerType, steps } = req.body;

      const result = await pool.query(
        `INSERT INTO workflows (organization_id, name, description, trigger_type, steps, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [req.user!.organizationId, name, description, triggerType, steps, req.user!.id]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create workflow' });
    }
  }

  static async getAll(req: AuthRequest, res: Response) {
    try {
      const result = await pool.query(
        `SELECT w.*, u.first_name || ' ' || u.last_name as created_by_name
         FROM workflows w
         LEFT JOIN users u ON w.created_by = u.id
         WHERE w.organization_id = $1
         ORDER BY w.created_at DESC`,
        [req.user!.organizationId]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch workflows' });
    }
  }

  static async startWorkflow(req: AuthRequest, res: Response) {
    const client = await pool.connect();
    
    try {
      const { documentId, data } = req.body;

      await client.query('BEGIN');

      const workflowResult = await client.query(
        'SELECT * FROM workflows WHERE id = $1 AND organization_id = $2 AND is_active = true',
        [req.params.id, req.user!.organizationId]
      );

      if (workflowResult.rows.length === 0) {
        return res.status(404).json({ error: 'Workflow not found or inactive' });
      }

      const workflow = workflowResult.rows[0];
      const firstStep = workflow.steps[0];

      const instanceResult = await client.query(
        `INSERT INTO workflow_instances (workflow_id, document_id, status, current_step, assigned_to, data)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [workflow.id, documentId, 'in_progress', 0, firstStep.assignedTo, data]
      );

      // Create approval if first step requires it
      if (firstStep.type === 'approval') {
        await client.query(
          'INSERT INTO approvals (document_id, workflow_instance_id, approver_id, status) VALUES ($1, $2, $3, $4)',
          [documentId, instanceResult.rows[0].id, firstStep.assignedTo, 'pending']
        );
      }

      await client.query('COMMIT');

      res.status(201).json(instanceResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: 'Failed to start workflow' });
    } finally {
      client.release();
    }
  }

  static async getWorkflowInstances(req: AuthRequest, res: Response) {
    try {
      const result = await pool.query(
        `SELECT wi.*, w.name as workflow_name, d.title as document_title,
                u.first_name || ' ' || u.last_name as assigned_to_name
         FROM workflow_instances wi
         JOIN workflows w ON wi.workflow_id = w.id
         LEFT JOIN documents d ON wi.document_id = d.id
         LEFT JOIN users u ON wi.assigned_to = u.id
         WHERE w.organization_id = $1
         ORDER BY wi.created_at DESC`,
        [req.user!.organizationId]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch workflow instances' });
    }
  }

  static async approveStep(req: AuthRequest, res: Response) {
    const client = await pool.connect();
    
    try {
      const { comments } = req.body;

      await client.query('BEGIN');

      // Update approval
      const approvalResult = await client.query(
        `UPDATE approvals 
         SET status = 'approved', comments = $1, approved_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND approver_id = $3
         RETURNING workflow_instance_id`,
        [comments, req.params.approvalId, req.user!.id]
      );

      if (approvalResult.rows.length === 0) {
        return res.status(404).json({ error: 'Approval not found' });
      }

      const workflowInstanceId = approvalResult.rows[0].workflow_instance_id;

      // Get workflow instance and workflow
      const instanceResult = await client.query(
        `SELECT wi.*, w.steps
         FROM workflow_instances wi
         JOIN workflows w ON wi.workflow_id = w.id
         WHERE wi.id = $1`,
        [workflowInstanceId]
      );

      const instance = instanceResult.rows[0];
      const nextStepIndex = instance.current_step + 1;

      if (nextStepIndex >= instance.steps.length) {
        // Workflow complete
        await client.query(
          'UPDATE workflow_instances SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['completed', workflowInstanceId]
        );
      } else {
        // Move to next step
        const nextStep = instance.steps[nextStepIndex];
        await client.query(
          'UPDATE workflow_instances SET current_step = $1, assigned_to = $2 WHERE id = $3',
          [nextStepIndex, nextStep.assignedTo, workflowInstanceId]
        );

        if (nextStep.type === 'approval') {
          await client.query(
            'INSERT INTO approvals (document_id, workflow_instance_id, approver_id, status) VALUES ($1, $2, $3, $4)',
            [instance.document_id, workflowInstanceId, nextStep.assignedTo, 'pending']
          );
        }
      }

      await client.query('COMMIT');

      res.json({ message: 'Approval processed successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: 'Failed to process approval' });
    } finally {
      client.release();
    }
  }

  static async rejectStep(req: AuthRequest, res: Response) {
    try {
      const { comments } = req.body;

      const result = await pool.query(
        `UPDATE approvals 
         SET status = 'rejected', comments = $1, approved_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND approver_id = $3
         RETURNING workflow_instance_id`,
        [comments, req.params.approvalId, req.user!.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Approval not found' });
      }

      await pool.query(
        'UPDATE workflow_instances SET status = $1 WHERE id = $2',
        ['rejected', result.rows[0].workflow_instance_id]
      );

      res.json({ message: 'Approval rejected' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to reject approval' });
    }
  }
}
