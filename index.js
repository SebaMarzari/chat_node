const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// Routes
const chatRouter = require('./routes/chat');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use Routes
app.use('/chat', chatRouter);

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log('listening on *:3000');
});
