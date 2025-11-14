import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import pool from '../db';

const router = express.Router();

// GET /users/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [rows]: any = await pool.query('SELECT user_id, email, first_name, last_name, status, created_at FROM Users WHERE user_id = ?', [req.user?.userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /users/me/password
router.put('/me/password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new passwords are required.' });
    }

    try {
        const [rows]: any = await pool.query('SELECT password_hash FROM Users WHERE user_id = ?', [req.user?.userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password.' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(newPassword, salt);

        await pool.query('UPDATE Users SET password_hash = ? WHERE user_id = ?', [password_hash, req.user?.userId]);

        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

export default router;
