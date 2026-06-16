import { io } from '../index.js';
import pool from '../db.js';

const initSocket = () => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Send active alerts on connection
    socket.on('get-active-alerts', async () => {
      try {
        const result = await pool.query(`
          SELECT * FROM alerts
          WHERE acknowledged = false
          ORDER BY created_at DESC;
        `);
        socket.emit('active-alerts', result.rows);
      } catch (err) {
        console.error('Socket error:', err.message);
      }
    });

    // Send latest readings on connection
    socket.on('get-latest-readings', async () => {
      try {
        const result = await pool.query(`
          SELECT DISTINCT ON (parameter_name)
            parameter_name, value, unit, recorded_at
          FROM sensor_readings
          ORDER BY parameter_name, recorded_at DESC;
        `);
        socket.emit('latest-readings', result.rows);
      } catch (err) {
        console.error('Socket error:', err.message);
      }
    });

    // Handle alert acknowledgement via socket
    socket.on('acknowledge-alert', async (data) => {
      try {
        const { alertId, userId } = data;
        await pool.query(`
          UPDATE alerts
          SET acknowledged = true,
              acknowledged_by = $1
          WHERE id = $2;
        `, [userId, alertId]);

        // Broadcast to ALL clients
        io.emit('alert-acknowledged', { alertId });
        console.log(`✅ Alert ${alertId} acknowledged`);
      } catch (err) {
        console.error('Acknowledge error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};

export { initSocket };