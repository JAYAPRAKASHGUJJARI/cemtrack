import pool from '../db.js';
import { safetyCheck } from '../utils/safetyCheck.js';
import { io } from '../index.js';

const parameters = {
  // KILN SECTION
  burning_zone_temp:       { value: 1450, unit: '°C',     min: 1400, max: 1500, step: 5 },
  kiln_inlet_temp:         { value: 1000, unit: '°C',     min: 900,  max: 1100, step: 8 },
  kiln_speed:              { value: 3.8,  unit: 'RPM',    min: 3.0,  max: 4.5,  step: 0.05 },
  kiln_feed_rate:          { value: 175,  unit: 'T/hr',   min: 150,  max: 200,  step: 2 },
  coal_feed_rate:          { value: 20,   unit: 'T/hr',   min: 15,   max: 25,   step: 0.5 },

  // RAW MILL SECTION
  raw_mill_feed_rate:      { value: 225,  unit: 'T/hr',   min: 200,  max: 250,  step: 2 },
  raw_mill_outlet_temp:    { value: 87,   unit: '°C',     min: 80,   max: 95,   step: 1 },
  raw_mill_power:          { value: 16,   unit: 'kWh/T',  min: 15,   max: 18,   step: 0.2 },
  raw_mill_speed:          { value: 15,   unit: 'RPM',    min: 14,   max: 16,   step: 0.1 },

  // CEMENT MILL SECTION
  cement_mill_feed_rate:   { value: 165,  unit: 'T/hr',   min: 150,  max: 180,  step: 2 },
  cement_mill_power:       { value: 31,   unit: 'kWh/T',  min: 28,   max: 35,   step: 0.3 },
  cement_mill_outlet_temp: { value: 110,  unit: '°C',     min: 100,  max: 120,  step: 1 },
  cement_fineness:         { value: 3350, unit: 'cm²/g',  min: 3200, max: 3500, step: 10 },

  // PRODUCTION KPIs
  clinker_production:      { value: 3000, unit: 'T/day',  min: 2700, max: 3300, step: 20 },
  cement_production:       { value: 3500, unit: 'T/day',  min: 3200, max: 3800, step: 25 },
  heat_consumption:        { value: 800,  unit: 'kcal/kg',min: 720,  max: 880,  step: 5 },
  equipment_availability:  { value: 92,   unit: '%',      min: 85,   max: 100,  step: 0.5 },
};

const generateValue = (param) => {
  const { value, step } = param;

  // 2% chance of spike
  if (Math.random() < 0.02) {
    const spikeDirection = Math.random() < 0.5 ? 1 : -1;
    return parseFloat((value + spikeDirection * step * 6).toFixed(2));
  }

  // Normal gradual change
  const change = (Math.random() - 0.5) * 2 * step;
  return parseFloat((value + change).toFixed(2));
};

const runSimulator = async () => {
  console.log('🤖 Simulator started!');

  setInterval(async () => {
    try {
      for (const [name, param] of Object.entries(parameters)) {
        const newValue = generateValue(param);
        parameters[name].value = newValue;

        // Save to database
        await pool.query(`
          INSERT INTO sensor_readings 
            (parameter_name, value, unit, source)
          VALUES ($1, $2, $3, 'simulator');
        `, [name, newValue, param.unit]);

        // Safety check
        await safetyCheck(name, newValue);

        // Push live to dashboard
        io.emit('new-reading', {
          parameter_name: name,
          value: newValue,
          unit: param.unit,
          recorded_at: new Date()
        });
      }

      console.log(`📊 Simulator tick — ${new Date().toLocaleTimeString()}`);

    } catch (err) {
      console.error('Simulator error:', err.message);
    }
  }, 5000);
};

export { runSimulator };