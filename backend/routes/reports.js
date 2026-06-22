import express from 'express';
import pool from '../db.js';
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/roles.js';

const router = express.Router();

// GET /reports/shift — get shift report
router.get('/shift', authenticate, authorize('manager', 'admin'), async (req, res) => {
  const { hours = 8 } = req.query;
  const safeHours = parseInt(hours) || 8;

  try {
    // Parameter statistics
    const statsResult = await pool.query(`
      SELECT 
        parameter_name,
        AVG(value) as avg_value,
        MIN(value) as min_value,
        MAX(value) as max_value,
        COUNT(*) as reading_count,
        STDDEV(value) as std_dev
      FROM sensor_readings
      WHERE recorded_at >= NOW() - INTERVAL '${safeHours} hours'
      GROUP BY parameter_name
      ORDER BY parameter_name;
    `);

    // Alert statistics
    const alertsResult = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM alerts
      WHERE created_at >= NOW() - INTERVAL '${safeHours} hours'
      GROUP BY status;
    `);

    // Most problematic parameters
    const problematicResult = await pool.query(`
      SELECT 
        parameter_name,
        COUNT(*) as alert_count,
        MAX(status) as worst_status
      FROM alerts
      WHERE created_at >= NOW() - INTERVAL '${safeHours} hours'
      GROUP BY parameter_name
      ORDER BY alert_count DESC
      LIMIT 5;
    `);

    // Manual entries in this period
const manualResult = await pool.query(`
  SELECT 
    sr.parameter_name,
    sr.value,
    sr.unit,
    sr.recorded_at,
    u.name as operator_name,
    u.role as operator_role
  FROM sensor_readings sr
  LEFT JOIN users u ON sr.operator_id = u.id
  WHERE sr.source = 'manual'
    AND sr.recorded_at >= NOW() - INTERVAL '${safeHours} hours'
  ORDER BY sr.recorded_at DESC;
`);

    res.json({
      success: true,
      data: {
        period_hours: safeHours,
        parameter_stats: statsResult.rows,
        alert_stats: alertsResult.rows,
        problematic_parameters: problematicResult.rows,
        manual_entries: manualResult.rows,
        generated_at: new Date(),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /reports/daily — daily summary
router.get('/daily', authenticate, authorize('manager', 'admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE(recorded_at) as date,
        parameter_name,
        AVG(value) as avg_value,
        MIN(value) as min_value,
        MAX(value) as max_value,
        COUNT(*) as reading_count
      FROM sensor_readings
      WHERE recorded_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(recorded_at), parameter_name
      ORDER BY date DESC, parameter_name;
    `);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;