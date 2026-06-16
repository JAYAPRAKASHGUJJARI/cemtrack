import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {createServer} from 'http';
import {Server} from 'socket.io';
import pool from './db.js';
import {runSimulator} from './simulator/simulator.js';
import readingsRouter from './routes/readings.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import alertsRouter from './routes/alerts.js';
import {initSocket} from './socket/socketHandler.js';
dotenv.config();
const app=express();
const httpServer =createServer(app);
const io=new Server(httpServer,{
    cors:{
        origin :'http://localhost:5173', //react dev server
        methods:['GET','POST']
    }
});
//middleware
app.use(cors());
app.use(express.json());

//Routes
 app.use('/readings',readingsRouter);
 app.use('/auth',authRouter);
 app.use('/users',usersRouter);
 app.use('/alerts',alertsRouter);
//test route
app.get('/',(req,res)=>{
    res.json({
        message:'cem track api is working',
        version:'1.0.0'
    });
});
// socket.io conection

// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);
  
//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//   });
// }); //intially did this

initSocket(); //in socket/socketHandler.hs



// Start server
// Start server
const PORT = process.env.PORT || 8080;

// Cleanup old readings every 24 hours
const startCleanup = () => {
  setInterval(async () => {
    try {
      const result = await pool.query(`
        DELETE FROM sensor_readings 
        WHERE recorded_at < NOW() - INTERVAL '7 days'
      `);
      console.log(`🧹 Cleaned up old readings`);

      // Also clean old alerts older than 30 days
      await pool.query(`
        DELETE FROM alerts
        WHERE created_at < NOW() - INTERVAL '30 days'
      `);
      console.log(`🧹 Cleaned up old alerts`);

    } catch (err) {
      console.error('Cleanup error:', err.message);
    }
  }, 24 * 60 * 60 * 1000); // every 24 hours
};

httpServer.listen(PORT, () => {
  console.log(`🚀 CemTrack server running on port ${PORT}`);
  runSimulator();
  startCleanup(); // ← add this
});



export { io };