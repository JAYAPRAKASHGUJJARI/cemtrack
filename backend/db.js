import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const {Pool} =pg; //const { Pool } = pg; is equivalent to const Pool = pg.Pool;
 const pool=new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized:false
    }
 });
 //test connection
 pool.connect((err,client,release)=>{
    if(err)
    {
        console.log('database connection failed:',err.message);
    } else 
    {
        console.log('Database connected successfully');
        release();
    }
 });
 export default pool;