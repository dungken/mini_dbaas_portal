import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, first_name, last_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const [rows]: any = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = {
      email,
      password_hash,
      first_name,
      last_name,
      status: 'pending', // or 'active' if you don't have email verification
    };

    const [result]: any = await pool.query('INSERT INTO Users SET ?', newUser);
    const userId = result.insertId;

    // Create a default tenant for the user
    const tenantName = `${email.split('@')[0]}-tenant`;
    const newTenant = {
      tenant_name: tenantName,
      display_name: `${first_name}'s Tenant`,
    };
    const [tenantResult]: any = await pool.query('INSERT INTO Tenants SET ?', newTenant);
    const tenantId = tenantResult.insertId;

    // Assign a default role to the user in their tenant (assuming a default role exists)
    // For now, let's assume a role with ID 1 (e.g., 'Tenant Admin')
    const newUserTenantRole = {
      user_id: userId,
      tenant_id: tenantId,
      role_id: 1, // Make sure a role with this ID exists in your Roles table
      is_primary: true,
    };
    await pool.query('INSERT INTO UserTenantRoles SET ?', newUserTenantRole);

    // Seed the default roles if they don't exist
    const defaultRoles = [
        { role_name: 'Tenant Admin', description: 'Manages the tenant.', is_system_role: true },
        { role_name: 'Developer', description: 'Manages databases within the tenant.', is_system_role: true },
        { role_name: 'Viewer', description: 'Read-only access to the tenant.', is_system_role: true },
    ];

    for (const role of defaultRoles) {
        await pool.query('INSERT IGNORE INTO Roles SET ?', role);
    }

    const token = jwt.sign({ userId, tenantId, roleId: 1 }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const [rows]: any = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        if (user.status !== 'active' && user.status !== 'pending') { // Allow pending users to log in
            return res.status(403).json({ message: 'User account is not active.' });
        }

        // Get the user's primary tenant and role
        const [userTenantRoles]: any = await pool.query(
            'SELECT tenant_id, role_id FROM UserTenantRoles WHERE user_id = ? AND is_primary = true',
            [user.user_id]
        );

        if (userTenantRoles.length === 0) {
            return res.status(403).json({ message: 'User has no primary tenant or role assigned.' });
        }

        const { tenant_id: tenantId, role_id: roleId } = userTenantRoles[0];

        const token = jwt.sign({ userId: user.user_id, tenantId, roleId }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

export default router;
