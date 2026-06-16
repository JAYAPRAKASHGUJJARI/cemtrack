import express from 'express';
import pool from '../db.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// GET /alerts — get all alerts
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.name as acknowledged_by_name
      FROM alerts a
      LEFT JOIN users u ON a.acknowledged_by = u.id
      ORDER BY a.created_at DESC
      LIMIT 100;
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /alerts/active — get unacknowledged alerts
router.get('/active', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM alerts
      WHERE acknowledged = false
      ORDER BY created_at DESC;
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /alerts/stats — alert statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'critical') as critical,
        COUNT(*) FILTER (WHERE status = 'warning') as warning,
        COUNT(*) FILTER (WHERE acknowledged = false) as unacknowledged
      FROM alerts
      WHERE created_at >= NOW() - INTERVAL '24 hours';
    `);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /alerts/:id/acknowledge — acknowledge alert
router.patch('/:id/acknowledge', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      UPDATE alerts
      SET acknowledged = true,
          acknowledged_by = $1
      WHERE id = $2
      RETURNING *;
    `, [req.user.id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /alerts/:id — delete alert (manager/admin only)
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM alerts WHERE id = $1', [id]);
    res.json({ success: true, message: 'Alert deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;