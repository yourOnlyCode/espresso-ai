import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { S3Service } from '../services/s3.service';
import { DocumentGenerationService } from '../services/document-generation.service';
import { AIService } from '../services/ai.service';

export class DocumentController {
  static async create(req: AuthRequest, res: Response) {
    const client = await pool.connect();
    
    try {
      const { title, description, documentType, templateId, content, metadata } = req.body;

      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO documents (organization_id, template_id, created_by, title, description, document_type, content, metadata, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [req.user!.organizationId, templateId, req.user!.id, title, description, documentType, content, metadata, 'draft']
      );

      const document = result.rows[0];

      // Create initial version
      await client.query(
        'INSERT INTO document_versions (document_id, version_number, content, created_by) VALUES ($1, $2, $3, $4)',
        [document.id, 1, content, req.user!.id]
      );

      await client.query('COMMIT');

      res.status(201).json(document);
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: 'Failed to create document' });
    } finally {
      client.release();
    }
  }

  static async getAll(req: AuthRequest, res: Response) {
    try {
      const { status, documentType, page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let query = `
        SELECT d.*, u.first_name || ' ' || u.last_name as created_by_name,
               t.name as template_name
        FROM documents d
        LEFT JOIN users u ON d.created_by = u.id
        LEFT JOIN templates t ON d.template_id = t.id
        WHERE d.organization_id = $1
      `;
      const params: any[] = [req.user!.organizationId];
      let paramIndex = 2;

      if (status) {
        query += ` AND d.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (documentType) {
        query += ` AND d.document_type = $${paramIndex}`;
        params.push(documentType);
        paramIndex++;
      }

      query += ` ORDER BY d.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      const countResult = await pool.query(
        'SELECT COUNT(*) FROM documents WHERE organization_id = $1',
        [req.user!.organizationId]
      );

      res.json({
        documents: result.rows,
        total: parseInt(countResult.rows[0].count),
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const result = await pool.query(
        `SELECT d.*, u.first_name || ' ' || u.last_name as created_by_name,
                t.name as template_name, t.content as template_content
         FROM documents d
         LEFT JOIN users u ON d.created_by = u.id
         LEFT JOIN templates t ON d.template_id = t.id
         WHERE d.id = $1 AND d.organization_id = $2`,
        [req.params.id, req.user!.organizationId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch document' });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    const client = await pool.connect();
    
    try {
      const { title, description, content, status, metadata } = req.body;

      await client.query('BEGIN');

      // Check if document is locked
      const lockCheck = await client.query(
        'SELECT is_locked, locked_by FROM documents WHERE id = $1 AND organization_id = $2',
        [req.params.id, req.user!.organizationId]
      );

      if (lockCheck.rows[0]?.is_locked && lockCheck.rows[0].locked_by !== req.user!.id) {
        return res.status(423).json({ error: 'Document is locked by another user' });
      }

      const result = await client.query(
        `UPDATE documents 
         SET title = COALESCE($1, title), 
             description = COALESCE($2, description),
             content = COALESCE($3, content),
             status = COALESCE($4, status),
             metadata = COALESCE($5, metadata),
             version = version + 1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6 AND organization_id = $7
         RETURNING *`,
        [title, description, content, status, metadata, req.params.id, req.user!.organizationId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Create new version
      await client.query(
        'INSERT INTO document_versions (document_id, version_number, content, created_by) VALUES ($1, $2, $3, $4)',
        [req.params.id, result.rows[0].version, content, req.user!.id]
      );

      await client.query('COMMIT');

      res.json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: 'Failed to update document' });
    } finally {
      client.release();
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const result = await pool.query(
        'DELETE FROM documents WHERE id = $1 AND organization_id = $2 RETURNING file_url',
        [req.params.id, req.user!.organizationId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Delete from S3 if exists
      if (result.rows[0].file_url) {
        await S3Service.deleteDocument(result.rows[0].file_url);
      }

      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete document' });
    }
  }

  static async generatePDF(req: AuthRequest, res: Response) {
    try {
      const { variables } = req.body;

      const docResult = await pool.query(
        `SELECT d.*, t.content as template_content
         FROM documents d
         LEFT JOIN templates t ON d.template_id = t.id
         WHERE d.id = $1 AND d.organization_id = $2`,
        [req.params.id, req.user!.organizationId]
      );

      if (docResult.rows.length === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const document = docResult.rows[0];
      const templateContent = document.template_content || document.content;

      const pdfBuffer = await DocumentGenerationService.generateFromTemplate(
        templateContent,
        variables || document.metadata
      );

      // Upload to S3
      const fileUrl = await S3Service.uploadDocument(
        { buffer: pdfBuffer, originalname: `${document.title}.pdf`, mimetype: 'application/pdf' } as any,
        req.user!.organizationId
      );

      // Update document with file URL
      await pool.query(
        'UPDATE documents SET file_url = $1, file_size = $2 WHERE id = $3',
        [fileUrl, pdfBuffer.length, req.params.id]
      );

      res.json({ fileUrl, message: 'PDF generated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }

  static async analyzeWithAI(req: AuthRequest, res: Response) {
    try {
      const result = await pool.query(
        'SELECT content, metadata FROM documents WHERE id = $1 AND organization_id = $2',
        [req.params.id, req.user!.organizationId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const documentText = JSON.stringify(result.rows[0].content);
      
      const [classification, improvements] = await Promise.all([
        AIService.classifyDocument(documentText),
        AIService.suggestImprovements(documentText),
      ]);

      res.json({ classification, improvements });
    } catch (error) {
      res.status(500).json({ error: 'Failed to analyze document' });
    }
  }

  static async getVersions(req: AuthRequest, res: Response) {
    try {
      const result = await pool.query(
        `SELECT dv.*, u.first_name || ' ' || u.last_name as created_by_name
         FROM document_versions dv
         JOIN documents d ON dv.document_id = d.id
         LEFT JOIN users u ON dv.created_by = u.id
         WHERE dv.document_id = $1 AND d.organization_id = $2
         ORDER BY dv.version_number DESC`,
        [req.params.id, req.user!.organizationId]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch versions' });
    }
  }
}
