import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export class TemplateController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const { name, description, category, industry, templateType, content, variables, isPublic } = req.body;

      const result = await pool.query(
        `INSERT INTO templates (organization_id, created_by, name, description, category, industry, template_type, content, variables, is_public)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [req.user!.organizationId, req.user!.id, name, description, category, industry, templateType, content, variables, isPublic || false]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create template' });
    }
  }

  static async getAll(req: AuthRequest, res: Response) {
    try {
      const { category, industry, isPublic } = req.query;

      let query = `
        SELECT t.*, u.first_name || ' ' || u.last_name as created_by_name
        FROM templates t
        LEFT JOIN users u ON t.created_by = u.id
        WHERE (t.organization_id = $1 OR t.is_public = true)
      `;
      const params: any[] = [req.user!.organizationId];
      let paramIndex = 2;

      if (category) {
        query += ` AND t.category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      if (industry) {
        query += ` AND t.industry = $${paramIndex}`;
        params.push(industry);
        paramIndex++;
      }

      if (isPublic !== undefined) {
        query += ` AND t.is_public = $${paramIndex}`;
        params.push(isPublic === 'true');
        paramIndex++;
      }

      query += ' ORDER BY t.usage_count DESC, t.created_at DESC';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const result = await pool.query(
        `SELECT t.*, u.first_name || ' ' || u.last_name as created_by_name
         FROM templates t
         LEFT JOIN users u ON t.created_by = u.id
         WHERE t.id = $1 AND (t.organization_id = $2 OR t.is_public = true)`,
        [req.params.id, req.user!.organizationId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch template' });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const { name, description, content, variables, status } = req.body;

      const result = await pool.query(
        `UPDATE templates 
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             content = COALESCE($3, content),
             variables = COALESCE($4, variables),
             status = COALESCE($5, status),
             version = version + 1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6 AND organization_id = $7
         RETURNING *`,
        [name, description, content, variables, status, req.params.id, req.user!.organizationId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update template' });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const result = await pool.query(
        'DELETE FROM templates WHERE id = $1 AND organization_id = $2 RETURNING id',
        [req.params.id, req.user!.organizationId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete template' });
    }
  }

  static async incrementUsage(req: AuthRequest, res: Response) {
    try {
      await pool.query(
        'UPDATE templates SET usage_count = usage_count + 1 WHERE id = $1',
        [req.params.id]
      );

      res.json({ message: 'Usage count updated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update usage count' });
    }
  }
}
