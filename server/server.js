import express from "express";
import "dotenv/config"
import cors from "cors"
import http from "http"
import mongoose from "mongoose";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// CORS setup for frontend
const FRONTEND_URL = process.env.FRONTEND_URL || "*";
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

// Express middleware
app.use(express.json({ limit: "4mb" }));

// Routes
app.use("/api/status", (req,res)=> res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Socket.io
export const io = new Server(server, {
    cors: { origin: FRONTEND_URL, methods: ["GET","POST"] }
});

export const userSocketMap = {};

io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    if(userId) userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", ()=>{
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

// MongoDB connection
console.log("MONGO_URI:", process.env.MONGO_URI);
await mongoose.connect(process.env.MONGO_URI);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server running on port: " + PORT));

// Export server for Vercel if needed
export default server;
