import express from 'express';
import pool from '../db.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// Helper to determine shift name based on time
const getShiftName = () => {
  // Get current IST hour
  const now = new Date();
  const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit' });
  const hour = parseInt(istString);

  if (hour >= 6 && hour < 14) return 'morning';
  if (hour >= 14 && hour < 22) return 'afternoon';
  return 'night';
};
// GET /shifts/current — get currently active shift for logged-in user
router.get('/current', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, u.name as operator_name
      FROM shifts s
      JOIN users u ON s.operator_id = u.id
      WHERE s.operator_id = $1 AND s.end_time IS NULL
      ORDER BY s.start_time DESC
      LIMIT 1;
    `, [req.user.id]);

    res.json({ success: true, data: result.rows[0] || null });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /shifts/active-all — get all currently active shifts (any operator)
router.get('/active-all', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, u.name as operator_name, u.role as operator_role
      FROM shifts s
      JOIN users u ON s.operator_id = u.id
      WHERE s.end_time IS NULL
      ORDER BY s.start_time DESC;
    `);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /shifts/start — start a new shift
router.post('/start', authenticate, async (req, res) => {
  try {
    // Check if user already has an active shift
    const existing = await pool.query(`
      SELECT id FROM shifts
      WHERE operator_id = $1 AND end_time IS NULL;
    `, [req.user.id]);

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'You already have an active shift. End it first.'
      });
    }

    const shiftName = getShiftName();

    const result = await pool.query(`
      INSERT INTO shifts (shift_name, start_time, operator_id)
      VALUES ($1, NOW(), $2)
      RETURNING *;
    `, [shiftName, req.user.id]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /shifts/:id/end — end current shift
router.patch('/:id/end', authenticate, async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  try {
    const result = await pool.query(`
      UPDATE shifts
      SET end_time = NOW(), notes = $1
      WHERE id = $2 AND operator_id = $3
      RETURNING *;
    `, [notes || null, id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Shift not found or not yours'
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /shifts/history — past shifts
router.get('/history', authenticate, async (req, res) => {
  const { limit = 20 } = req.query;

  try {
    const result = await pool.query(`
      SELECT s.*, u.name as operator_name, u.role as operator_role
      FROM shifts s
      JOIN users u ON s.operator_id = u.id
      WHERE s.end_time IS NOT NULL
      ORDER BY s.start_time DESC
      LIMIT $1;
    `, [limit]);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;