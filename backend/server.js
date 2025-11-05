
import express from 'express'
import dotenv from 'dotenv'
import connectDb from './lib/db.js';
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import bodyParser from 'body-parser';
import MessageRoutes from './routes/message.route.js';
import http from 'http'
import { initializeSocket } from './socket/socket.js';
import statusRoutes from './routes/status.route.js';



dotenv.config();
const app = express();


app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true
}))
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}))

const server = http.createServer(app)

const io = initializeSocket(server);


app.use((req,res,next) =>{
    req.io = io;
    req.socketUserMap   = io.socketUserMap
    next()
})

app.use('/api/v1/auth',authRoutes);
app.use('/api/v1/message',MessageRoutes)
app.use('/api/v1/status',statusRoutes)

const PORT = process.env.PORT || 5000
server.listen(PORT, () =>{
    console.log("server is running on Port ", PORT);
    connectDb()
})