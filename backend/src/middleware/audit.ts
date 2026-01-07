import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import pool from '../config/database';

export const auditLog = (action: string, resourceType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const resourceId = req.params.id || req.body.id || null;
      
      await pool.query(
        `INSERT INTO audit_logs (organization_id, user_id, action, resource_type, resource_id, details, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          req.user?.organizationId,
          req.user?.id,
          action,
          resourceType,
          resourceId,
          JSON.stringify({ body: req.body, params: req.params }),
          req.ip,
          req.headers['user-agent'],
        ]
      );
    } catch (error) {
      console.error('Audit log error:', error);
    }
    
    next();
  };
};
