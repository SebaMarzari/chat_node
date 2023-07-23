const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const users = require('./data/users');
const messages = require('./data/messages');

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Routes
const chatRouter = require('./routes/chat');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use Routes
app.use('/chat', chatRouter);

io.on('connection', (socket) => {
    socket.on('login', (data) => {
        const { userName, password } = data;
        const user = users.find(user => user?.userName === userName.trim())
        if (user && user.password === password) {
            if (user.connected) {
                const message = 'El usuario ya esta conectado'
                socket.emit('login', {
                    error: message
                });
                socket.emit('notification', {
                    message,
                    status: 'error'
                })
                return;
            }
            user.connected = true;
            users.map(u => {
                if (u.userName === userName) {
                    u.connected = true;
                }
            });
            socket.broadcast.emit('users', users);
            socket.emit('login', {
                user
            });
            socket.broadcast.emit('notification', {
                message: `${userName} se ha conectado`,
                status: 'connect'
            })
            return;
        } else {
            const message = 'Usuario o contraseña incorrectos'
            socket.emit('login', {
                error: message
            });
            socket.emit('notification', {
                message,
                status: 'error'
            })
            return;
        }
    });

    socket.on('register', (data) => {
        const { userName, password } = data;
        const alreadyUser = users.find(user => user?.userName === userName.trim())
        if (alreadyUser) {
            const message = `El nombre ${userName} ya esta en uso`
            socket.emit('login', {
                error: message
            });
            socket.emit('notification', {
                message,
                status: 'error'
            })
            return;
        }
        if (users.length >= 50) {
            socket.emit('login', {
                error: 'El chat esta lleno'
            });
            return;
        }
        const user = {
            id: socket.id,
            userName,
            connected: true,
            password,
        }
        users.push(user);
        socket.emit('login', {
            user
        });
        socket.broadcast.emit('users', users);
        socket.broadcast.emit('notification', {
            message: `${userName} ha iniciado sesion`,
            status: 'login'

        })
    });

    socket.on('logout', (user) => {
        if (user) {
            users.map(u => {
                if (u.id === user.id) {
                    u.connected = false;
                }
            });
            socket.broadcast.emit('users', users);
            socket.broadcast.emit('notification', {
                message: `${user.userName} se ha desconectado`,
                status: 'disconnect'
            })
        }
    });

    socket.on('connectChat', (id) => {
        socket.join(id);
    });

    socket.on('typing', ({ isTyping, to }) => {
        socket.broadcast.emit(`typing${to}`, isTyping);
    });

    socket.on('users', () => {
        socket.emit('users', users);
    });

    socket.on('messages', () => {
        socket.emit('messages', messages);
    });

    socket.on('newMessage', (msg) => {
        messages.push(msg);
        socket.broadcast.emit('messages', messages);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log('listening on *:3000');
});
