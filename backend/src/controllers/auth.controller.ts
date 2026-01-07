import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  static async register(req: Request, res: Response) {
    const client = await pool.connect();
    
    try {
      const { email, password, firstName, lastName, organizationName, industry } = req.body;

      await client.query('BEGIN');

      // Create organization
      const orgResult = await client.query(
        'INSERT INTO organizations (name, industry) VALUES ($1, $2) RETURNING id',
        [organizationName, industry]
      );
      const organizationId = orgResult.rows[0].id;

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const userResult = await client.query(
        `INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, last_name, role`,
        [organizationId, email, passwordHash, firstName, lastName, 'admin']
      );

      await client.query('COMMIT');

      const user = userResult.rows[0];
      const token = jwt.sign(
        { userId: user.id, organizationId },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({ user, token });
    } catch (error: any) {
      await client.query('ROLLBACK');
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: 'Registration failed' });
    } finally {
      client.release();
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await pool.query(
        'SELECT id, organization_id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];

      if (!user.is_active) {
        return res.status(401).json({ error: 'Account is inactive' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

      const token = jwt.sign(
        { userId: user.id, organizationId: user.organization_id },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  }

  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const result = await pool.query(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.created_at,
                o.name as organization_name, o.subscription_tier
         FROM users u
         JOIN organizations o ON u.organization_id = o.id
         WHERE u.id = $1`,
        [req.user!.id]
      );

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }
}
