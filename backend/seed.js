import pool from './db.js';
 const seedParameters = async () => {
  try {
    const parameters = [
      // KILN SECTION
      ['burning_zone_temp', 'Burning Zone Temperature', '°C', 1380, 1520, 1400, 1500, 'kiln'],
      ['kiln_inlet_temp', 'Kiln Inlet Temperature', '°C', 880, 1120, 900, 1100, 'kiln'],
      ['kiln_speed', 'Kiln Speed', 'RPM', 2.8, 4.7, 3.0, 4.5, 'kiln'],
      ['kiln_feed_rate', 'Kiln Feed Rate', 'T/hr', 140, 210, 150, 200, 'kiln'],
      ['coal_feed_rate', 'Coal Feed Rate', 'T/hr', 13, 27, 15, 25, 'kiln'],

      // RAW MILL SECTION
      ['raw_mill_feed_rate', 'Raw Mill Feed Rate', 'T/hr', 190, 260, 200, 250, 'raw_mill'],
      ['raw_mill_outlet_temp', 'Raw Mill Outlet Temperature', '°C', 75, 100, 80, 95, 'raw_mill'],
      ['raw_mill_power', 'Raw Mill Power Consumption', 'kWh/T', 13, 20, 15, 18, 'raw_mill'],
      ['raw_mill_speed', 'Raw Mill Speed', 'RPM', 13, 17, 14, 16, 'raw_mill'],

      // CEMENT MILL SECTION
      ['cement_mill_feed_rate', 'Cement Mill Feed Rate', 'T/hr', 140, 190, 150, 180, 'cement_mill'],
      ['cement_mill_power', 'Cement Mill Power Consumption', 'kWh/T', 26, 37, 28, 35, 'cement_mill'],
      ['cement_mill_outlet_temp', 'Cement Mill Outlet Temperature', '°C', 95, 125, 100, 120, 'cement_mill'],
      ['cement_fineness', 'Cement Fineness', 'cm²/g', 3100, 3600, 3200, 3500, 'cement_mill'],

      // PRODUCTION KPIss
// Change these lines in seed.js
['clinker_production', 'Clinker Production', 'T/day', 2700, 3300, 2800, 3200, 'production'],
['cement_production', 'Cement Production', 'T/day', 3200, 3800, 3300, 3700, 'production'],
      ['heat_consumption', 'Heat Consumption', 'kcal/kg', 720, 880, 750, 850, 'production'],
      ['equipment_availability', 'Equipment Availability', '%', 85, 100, 90, 100, 'production'],
    ];
      for(const param of parameters)
      {
      await pool.query(`
  INSERT INTO parameters_config(
    parameter_name, display_name, unit, 
    min_warning, max_warning, min_safe, max_safe, section)
  VALUES($1,$2,$3,$4,$5,$6,$7,$8)
  ON CONFLICT (parameter_name) DO UPDATE SET
    min_warning = EXCLUDED.min_warning,
    max_warning = EXCLUDED.max_warning,
    min_safe = EXCLUDED.min_safe,
    max_safe = EXCLUDED.max_safe;
`, param);
      }
      console.log('parameters are seeded successfully');
      console.log(`${parameters.length} parameters inserted`);
      process.exit(0);
} catch (err)
{
    console.log('eeror during seeding:',err.message);
    process.exit(1);
}
 };
 seedParameters();