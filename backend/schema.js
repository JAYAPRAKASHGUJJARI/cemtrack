import pool from "./db.js";

const createTables=async () =>
{
  try {
    // users table-1
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
       id SERIAL PRIMARY KEY,
       name VARCHAR(100) NOT NULL,
       email VARCHAR(100) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       role VARCHAR(255) DEFAULT 'operator',
       is_active BOOLEAN DEFAULT true,
       created_at TIMESTAMP DEFAUlT NOW()
      ) ; 
        
        `);
         console.log('users table created successfully ');

         // parameters config table -2
       await pool.query(`
         CREATE TABLE IF NOT EXISTS parameters_config(
          id SERIAL PRIMARY KEY,
          parameter_name VARCHAR(100) UNIQUE NOT NULL,
          display_name VARCHAR(100) NOT NULL,
          unit VARCHAR (20),
          min_warning NUMERIC,
           max_warning NUMERIC,
        min_safe NUMERIC,
        max_safe NUMERIC,
        section VARCHAR(50)
         );
        
        
        `);
        console.log('parameter config table ready');
// sensor readings table -3
          await pool.query(`
      CREATE TABLE IF NOT EXISTS sensor_readings (
        id SERIAL PRIMARY KEY,
        parameter_name VARCHAR(100) NOT NULL,
        value NUMERIC NOT NULL,
        unit VARCHAR(20),
        source VARCHAR(20) DEFAULT 'simulator',
        operator_id INTEGER REFERENCES users(id),
        recorded_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Sensor readings table ready');
   //alerts table-4

        await pool.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        parameter_name VARCHAR(100) NOT NULL,
        value NUMERIC NOT NULL,
        status VARCHAR(20) NOT NULL,
        type VARCHAR(20) NOT NULL,
        message TEXT,
        ai_recommendation TEXT,
        acknowledged BOOLEAN DEFAULT false,
        acknowledged_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Alerts table ready');

    //shifts table-5
        await pool.query(`
      CREATE TABLE IF NOT EXISTS shifts (
        id SERIAL PRIMARY KEY,
        shift_name VARCHAR(20) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        operator_id INTEGER REFERENCES users(id),
        notes TEXT
      );
    `);
    console.log('Shifts table ready');

    //shifts reports table-6
         await pool.query(`
      CREATE TABLE IF NOT EXISTS shift_reports (
        id SERIAL PRIMARY KEY,
        shift_id INTEGER REFERENCES shifts(id),
        parameter_name VARCHAR(100),
        avg_value NUMERIC,
        min_value NUMERIC,
        max_value NUMERIC,
        total_alerts INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log(' Shift reports table ready');

    //audit log table-7
        await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(50) NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Audit log table ready');
      console.log('');
    console.log('🎉 All tables created successfully!');
    process.exit(0);
  } catch(err)
  {
    console.log('error creating tables:',err.message);
    process.exit(1);
  }
};
createTables();