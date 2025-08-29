import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import connectDB from "./db/connection.js";
import authRoutes from './routes/auth.routes.js'
// … your other imports
import './models/Permission.js'; // 👈 guarantees model is registered
import './models/Role.js';
import './models/User.js';


const app = express();
// Health Check
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));



//Middleware setup
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());



//Routes
app.use('/api',cookieParser());
app.use('/api/auth',  authRoutes) 


// Coneection setup
const PORT = process.env.PORT
app.listen(PORT, ()=>{
    console.log(`Server is running on port: ${PORT}`)
    connectDB()
})


//Error handling
app.use((err, _req, res, _next)=>{
    console.log(err)
    if(!res.headersSent) res.status(500).json({error: 'Server error'})
})

