import pool from '../db.js';
import {io} from '../index.js';

const safetyCheck = async (parameter_name, value) => {
  try {
    const config = await pool.query(`
      SELECT * FROM parameters_config
      WHERE parameter_name = $1;
    `, [parameter_name]);

    if (config.rows.length === 0) return;

    const param = config.rows[0];
    const numValue = parseFloat(value);

    // 1. THRESHOLD CHECK
    let status = null;
    let message = null;

    if (numValue < param.min_safe || numValue > param.max_safe) {
      status = 'critical';
      message = `${param.display_name} is at ${numValue} ${param.unit} — outside safe range (${param.min_safe}-${param.max_safe})`;
    } else if (numValue < param.min_warning || numValue > param.max_warning) {
      status = 'warning';
      message = `${param.display_name} is at ${numValue} ${param.unit} — approaching limits`;
    }

    if (status) {
      await createAlert(parameter_name, numValue, status, 'threshold', message);
    }

    // 2. SPIKE CHECK
    const lastReading = await pool.query(`
      SELECT value FROM sensor_readings
      WHERE parameter_name = $1
      ORDER BY recorded_at DESC
      LIMIT 1 OFFSET 1;
    `, [parameter_name]);

    if (lastReading.rows.length > 0) {
      const lastValue = parseFloat(lastReading.rows[0].value);
      const changePercent = Math.abs((numValue - lastValue) / lastValue) * 100;

      if (changePercent > 5) {
        await createAlert(
          parameter_name, numValue, 'critical', 'spike',
          `${param.display_name} spiked by ${changePercent.toFixed(1)}% suddenly!`
        );
      }
    }

  } catch (err) {
    console.error('Safety check error:', err.message);
  }
};

const createAlert = async (parameter_name, value, status, type, message) => {
  // ✅ CHECK — skip if same alert already exists in last 5 minutes
  const recent = await pool.query(`
    SELECT id FROM alerts
    WHERE parameter_name = $1
    AND type = $2
    AND status = $3
    AND created_at >= NOW() - INTERVAL '5 minutes'
    LIMIT 1;
  `, [parameter_name, type, status]);

  // If recent alert exists, skip creating new one
  if (recent.rows.length > 0) return;

  // Otherwise create new alert
  const result = await pool.query(`
    INSERT INTO alerts (parameter_name, value, status, type, message)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `, [parameter_name, value, status, type, message]);

  console.log(`🚨 Alert: ${message}`);
  io.emit('new-alert', result.rows[0]);
  return result.rows[0];
};

export {safetyCheck, createAlert};