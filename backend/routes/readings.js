import express from "express";
import pool from '../db.js';
import { safetyCheck } from '../utils/safetyCheck.js';
import authenticate from '../middleware/auth.js';
const router = express.Router();

// POST /readings — save new reading
router.post('/', authenticate, async (req, res) => {
  const { parameter_name, value, unit, source, operator_id } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO sensor_readings
      (parameter_name, value, unit, source, operator_id)
      VALUES($1,$2,$3,$4,$5)
      RETURNING *;
    `, [parameter_name, value, unit, source || 'manual', operator_id || null]);

    const reading = result.rows[0];

    // Safety check
    await safetyCheck(parameter_name, value);

    res.status(201).json({
      success: true,
      data: reading
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /readings/latest — get latest value for each parameter
router.get('/latest', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (parameter_name)
        parameter_name, value, unit, source, recorded_at
      FROM sensor_readings
      ORDER BY parameter_name, recorded_at DESC;
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /readings/history?parameter=x&limit=50&source=manual&operator_id=1
router.get('/history', authenticate, async (req, res) => {
  const { parameter, limit = 50, source, operator_id } = req.query;

  try {
    let query = `
      SELECT sr.id, sr.parameter_name, sr.value, sr.unit, sr.source, 
             sr.operator_id, sr.recorded_at,
             u.name as operator_name, u.role as operator_role
      FROM sensor_readings sr
      LEFT JOIN users u ON sr.operator_id = u.id
      WHERE 1=1
    `;
    let params = [];

    if (parameter) {
      params.push(parameter);
      query += ` AND sr.parameter_name = $${params.length}`;
    }
    if (source) {
      params.push(source);
      query += ` AND sr.source = $${params.length}`;
    }
    if (operator_id) {
      params.push(operator_id);
      query += ` AND sr.operator_id = $${params.length}`;
    }

    params.push(limit);
    query += ` ORDER BY sr.recorded_at DESC LIMIT $${params.length}`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// GET /readings/trend?parameter=kiln_temp&hours=24
router.get('/trend', authenticate, async (req, res) => {
  const { parameter, hours = 24 } = req.query;
  const safeHours = parseInt(hours) || 24;

  try {
    const result = await pool.query(`
      SELECT parameter_name, value, recorded_at
      FROM sensor_readings
      WHERE parameter_name = $1
        AND recorded_at >= NOW() - INTERVAL '${safeHours} hours'
      ORDER BY recorded_at ASC;
    `, [parameter]);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /readings/:id — delete a reading (own entry only for operator)
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    // Check if reading exists
    const result = await pool.query(
      'SELECT * FROM sensor_readings WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reading not found'
      });
    }

    const reading = result.rows[0];

    // Operator can only delete own readings
    // Manager and admin can delete any reading
    if (req.user.role === 'operator' && reading.operator_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not allowed to delete this reading'
      });
    }

    await pool.query('DELETE FROM sensor_readings WHERE id = $1', [id]);
    res.json({ success: true, message: 'Reading deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;