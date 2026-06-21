import express from 'express';
import pool from '../db.js';
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/roles.js';

const router = express.Router();

//console.log('NVIDIA KEY:', process.env.NVIDIA_API_KEY); // ← debug line

const askNvidia = async (prompt) => {
  const apiKey = process.env.NVIDIA_API_KEY;
  
  if (!apiKey) throw new Error('NVIDIA_API_KEY not found in environment');

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 0.2,
      top_p: 0.7,
      stream: false,
    }),
  });

  const data = await response.json();
  console.log('NVIDIA response status:', response.status);
  if (!response.ok) {
    console.error('NVIDIA error:', JSON.stringify(data));
    throw new Error(data.detail || JSON.stringify(data));
  }
  return data.choices[0].message.content;
};

// POST /ai/analyze — analyze a specific alert
router.post('/analyze', authenticate, authorize('manager', 'admin'), async (req, res) => {
  const { alert_id } = req.body;
  try {
    const alertResult = await pool.query(
      'SELECT * FROM alerts WHERE id = $1', [alert_id]
    );
    if (alertResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    const alert = alertResult.rows[0];

    const readingsResult = await pool.query(`
      SELECT value, recorded_at FROM sensor_readings
      WHERE parameter_name = $1
      ORDER BY recorded_at DESC
      LIMIT 10;
    `, [alert.parameter_name]);

    const recentValues = readingsResult.rows.map(r => r.value).join(', ');

    const prompt = `
      You are an expert cement plant operations engineer.
      just give in 10 words strictly no sugar coating just direct ans
      Alert Details:
      - Parameter: ${alert.parameter_name}
      - Current Value: ${alert.value}
      - Status: ${alert.status}
      - Type: ${alert.type}
      - Message: ${alert.message}
      - Recent values: ${recentValues}
      
      Please provide:
      1. Root cause analysis (1 sentence)
      2. Immediate action required (1-2 bullet points)
      3. Long term recommendation (1-2 sentences)
      
      Keep response concise and practical for a plant operator.
    `;

    const recommendation = await askNvidia(prompt);

    await pool.query(
      'UPDATE alerts SET ai_recommendation = $1 WHERE id = $2',
      [recommendation, alert_id]
    );

    res.json({ success: true, data: { recommendation, alert } });
  } catch (err) {
    console.error('AI analyze error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /ai/query — natural language query about plant
router.post('/query', authenticate, authorize('manager', 'admin'), async (req, res) => {
  const { question } = req.body;
  try {
    const readingsResult = await pool.query(`
      SELECT DISTINCT ON (parameter_name)
        parameter_name, value, unit, recorded_at
      FROM sensor_readings
      ORDER BY parameter_name, recorded_at DESC;
    `);

    const alertsResult = await pool.query(`
      SELECT parameter_name, value, status, message
      FROM alerts
      WHERE acknowledged = false
      ORDER BY created_at DESC
      LIMIT 10;
    `);

    const readingsSummary = readingsResult.rows
      .map(r => `${r.parameter_name}: ${r.value} ${r.unit}`)
      .join('\n');

    const alertsSummary = alertsResult.rows.length > 0
      ? alertsResult.rows.map(a => `${a.parameter_name}: ${a.status} — ${a.message}`).join('\n')
      : 'No active alerts';

    const prompt = `
      You are an expert cement plant operations engineer AI assistant.
       
      Current Plant Status:
      ${readingsSummary}
      
      Active Alerts:
      ${alertsSummary}
      
      Operator Question: ${question}
      
      Please answer the question based on the current plant data.
      Keep response practical, concise and actionable.
    `;

    const answer = await askNvidia(prompt);
    res.json({ success: true, data: { answer, question } });
  } catch (err) {
    console.error('AI query error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /ai/report — generate shift summary
router.post('/report', authenticate, authorize('manager', 'admin'), async (req, res) => {
  try {
    const readingsResult = await pool.query(`
      SELECT 
        parameter_name,
        AVG(value) as avg_value,
        MIN(value) as min_value,
        MAX(value) as max_value,
        COUNT(*) as reading_count
      FROM sensor_readings
      WHERE recorded_at >= NOW() - INTERVAL '8 hours'
      GROUP BY parameter_name;
    `);

    const alertsResult = await pool.query(`
      SELECT parameter_name, status, COUNT(*) as count
      FROM alerts
      WHERE created_at >= NOW() - INTERVAL '8 hours'
      GROUP BY parameter_name, status;
    `);

    const readingsSummary = readingsResult.rows
      .map(r => `${r.parameter_name}: avg=${parseFloat(r.avg_value).toFixed(2)}, min=${parseFloat(r.min_value).toFixed(2)}, max=${parseFloat(r.max_value).toFixed(2)}`)
      .join('\n');

    const alertsSummary = alertsResult.rows.length > 0
      ? alertsResult.rows.map(a => `${a.parameter_name}: ${a.count} ${a.status} alerts`).join('\n')
      : 'No alerts in last 8 hours';

    const prompt = `
      You are an expert cement plant operations engineer.
      
      Generate a professional shift report for the last 8 hours:
      
      Parameter Summary:
      ${readingsSummary}
      
      Alert Summary:
      ${alertsSummary}
      
      Please provide:
      1. Overall plant health assessment
      2. Key observations for each section (Kiln, Raw Mill, Cement Mill, Production)
      3. Issues detected and recommendations
      4. Handover notes for next shift
      
      Keep it professional and concise.
    `;

    const report = await askNvidia(prompt);
    res.json({ success: true, data: { report } });
  } catch (err) {
    console.error('AI report error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;