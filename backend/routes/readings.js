import express from "express";
import pool from '../db.js';
import {safetyCheck} from '../utils/safetyCheck.js';
const router=express.Router();
//post/readings -save new reading

router.post('/',async(req,res)=>{
    const {parameter_name,value,unit,source,operator_id}= req.body;

    try{
        const result=await pool.query(`
            INSERT INTO sensor_readings
            (parameter_name,value,unit,source,operator_id)
            VALUES($1,$2,$3,$4,$5)
            RETURNING *;

            `,[parameter_name,value,unit,source||'manual',operator_id||null]);
            const reading=result.rows[0];

            //safety check
            await safetyCheck(parameter_name,value);
            res.status(201).json({
                success:true,
                data:reading
            });
    }
    catch(err)
    {
        res.status(500).json({success:false,error:err.message});
    }
});


// GET/readings/latest-get latest value for each parameter

router.get('/latest', async (req, res) => {
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

//GET/readings/history?parameter=kiln_temp&limit=50

router.get('/history', async (req, res) => {
  const { parameter, limit = 50 } = req.query;

  try {
    let query = `
      SELECT parameter_name, value, unit, source, recorded_at
      FROM sensor_readings
    `;
    let params = [];

    if (parameter) {
      query += ` WHERE parameter_name = $1`;
      params.push(parameter);
    }

    query += ` ORDER BY recorded_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

//GET/readingns/trend?parameter=kiln_temp&hours=24

router.get('/trend', async (req, res) => {
  const { parameter, hours = 24 } = req.query;

  try {
    const result = await pool.query(`
      SELECT parameter_name, value, recorded_at
      FROM sensor_readings
      WHERE parameter_name = $1
        AND recorded_at >= NOW() - INTERVAL '${hours} hours'
      ORDER BY recorded_at ASC;
    `, [parameter]);

    res.json({ success: true, data: result.rows });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// // SAFETY CHECK FUNCTION

// const safetyCheck = async (parameter_name, value) => {
//   try {
//     // Get parameter config
//     const config = await pool.query(`
//       SELECT * FROM parameters_config
//       WHERE parameter_name = $1;
//     `, [parameter_name]);

//     if (config.rows.length === 0) return;

//     const param = config.rows[0];
//     const numValue = parseFloat(value);

//     // 1. THRESHOLD CHECK
//     let status = null;
//     let message = null;

//     if (numValue < param.min_safe || numValue > param.max_safe) {
//       status = 'critical';
//       message = `${param.display_name} is at ${numValue} ${param.unit} — outside safe range (${param.min_safe}-${param.max_safe})`;
//     } else if (numValue < param.min_warning || numValue > param.max_warning) {
//       status = 'warning';
//       message = `${param.display_name} is at ${numValue} ${param.unit} — approaching limits`;
//     }

//     if (status) {
//       await createAlert(parameter_name, numValue, status, 'threshold', message);
//     }

//     // 2. SPIKE CHECK — compare with last reading
//     const lastReading = await pool.query(`
//       SELECT value FROM sensor_readings
//       WHERE parameter_name = $1
//       ORDER BY recorded_at DESC
//       LIMIT 1 OFFSET 1;
//     `, [parameter_name]);

//     if (lastReading.rows.length > 0) {
//       const lastValue = parseFloat(lastReading.rows[0].value);
//       const changePercent = Math.abs((numValue - lastValue) / lastValue) * 100;

//       if (changePercent > 5) {
//         await createAlert(
//           parameter_name, numValue, 'critical', 'spike',
//           `${param.display_name} spiked by ${changePercent.toFixed(1)}% suddenly!`
//         );
//       }
//     }

//   } catch (err) {
//     console.error('Safety check error:', err.message);
//   }
// };

// // CREATE ALERT HELPER

// const createAlert = async (parameter_name, value, status, type, message) => {
//   await pool.query(`
//     INSERT INTO alerts (parameter_name, value, status, type, message)
//     VALUES ($1, $2, $3, $4, $5);
//   `, [parameter_name, value, status, type, message]);

//   console.log(`🚨 Alert created: ${message}`);
// };

export default router;