import express from 'express';
import pool from '../db.js';
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/roles.js';
import bcrypt from 'bcryptjs';
const router = express.Router();

// GET /users — all users (admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /users/:id/role — change role (admin only)
router.patch('/:id/role', authenticate, authorize('admin'), async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  const validRoles = ['operator', 'manager', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid role. Must be operator, manager or admin'
    });
  }

  try {
    const result = await pool.query(`
      UPDATE users SET role = $1
      WHERE id = $2
      RETURNING id, name, email, role;
    `, [role, id]);

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /users/:id/status — enable/disable (admin only)
router.patch('/:id/status', authenticate, authorize('admin'), async (req, res) => {
  const { is_active } = req.body;
  const { id } = req.params;

  try {
    const result = await pool.query(`
      UPDATE users SET is_active = $1
      WHERE id = $2
      RETURNING id, name, email, role, is_active;
    `, [is_active, id]);

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /users/:id — delete user (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  const { id } = req.params;

  if (parseInt(id) === req.user.id) {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete your own account!'
    });
  }

  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// PATCH /users/:id/reset-password — admin resets any user password
router.patch('/:id/reset-password', authenticate, authorize('admin'), async (req, res) => {
  const { newPassword } = req.body;
  const { id } = req.params;

  try {
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const result = await pool.query(`
      UPDATE users SET password = $1
      WHERE id = $2
      RETURNING id, name, email, role;
    `, [hashedPassword, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `Password reset successfully for ${result.rows[0].name}`,
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;