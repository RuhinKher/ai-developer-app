import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import Chat from './models/Chat.js'; // ✅ Import Chat model
import { generateResult } from './services/ai.service.js';

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

// 🔐 Authentication & project validation middleware
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
        const projectId = socket.handshake.query.projectId;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error('Invalid projectId'));
        }

        socket.project = await projectModel.findById(projectId);

        if (!token) {
            return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return next(new Error('Authentication error'));
        }

        socket.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
});

// 📡 Connection handler
io.on('connection', socket => {
    socket.roomId = socket.project._id.toString();
    console.log('a user connected');
    socket.join(socket.roomId);

    // 📩 Message handler
    socket.on('project-message', async data => {
        const message = data.message;
        const aiIsPresentInMessage = message.includes('@ai');

        // ✅ Save user message to DB
        await Chat.create({
            projectId: socket.project._id,
            sender: socket.user,
            message
        });

        // 🔁 Broadcast to all clients (including sender)
        io.to(socket.roomId).emit('project-message', {
            sender: socket.user,
            message
        });

        // 🧠 AI message handling
        if (aiIsPresentInMessage) {
            const prompt = message.replace('@ai', '');
            const result = await generateResult(prompt);

            // ✅ Save AI message to DB
            await Chat.create({
                projectId: socket.project._id,
                sender: {
                    _id: 'ai',
                    email: 'AI'
                },
                message: result
            });

            // 🛰️ Broadcast AI response
            io.to(socket.roomId).emit('project-message', {
                sender: {
                    _id: 'ai',
                    email: 'AI'
                },
                message: result
            });
        }
    });

    // 🔌 Disconnect handler
    socket.on('disconnect', () => {
        console.log('user disconnected');
        socket.leave(socket.roomId);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
