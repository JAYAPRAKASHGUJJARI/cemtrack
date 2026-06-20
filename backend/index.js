import './config.js'; // ← MUST BE FIRST
import express from 'express';
import cors from 'cors';
import {createServer} from 'http';
import {Server} from 'socket.io';
import pool from './db.js';
import {runSimulator} from './simulator/simulator.js';
import readingsRouter from './routes/readings.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import alertsRouter from './routes/alerts.js';
import aiRouter from './routes/ai.js';
import {initSocket} from './socket/socketHandler.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.use('/readings', readingsRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/alerts', alertsRouter);
app.use('/ai', aiRouter);

app.get('/', (req, res) => {
  res.json({ message: 'cem track api is working', version: '1.0.0' });
});

initSocket();

const PORT = process.env.PORT || 8080;

const startCleanup = () => {
  setInterval(async () => {
    try {
      await pool.query(`DELETE FROM sensor_readings WHERE recorded_at < NOW() - INTERVAL '7 days'`);
      console.log('🧹 Cleaned up old readings');
      await pool.query(`DELETE FROM alerts WHERE created_at < NOW() - INTERVAL '30 days'`);
      console.log('🧹 Cleaned up old alerts');
    } catch (err) {
      console.error('Cleanup error:', err.message);
    }
  }, 24 * 60 * 60 * 1000);
};

httpServer.listen(PORT, () => {
  console.log(`🚀 CemTrack server running on port ${PORT}`);
  runSimulator();
  startCleanup();
});

export { io };