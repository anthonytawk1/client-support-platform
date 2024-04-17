const io = require('socket.io-client');

const userThatShouldntBeNotified = '';
const userThatShouldBeNotified = ''

const socket = io('http://localhost:3000', {
});

socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('joinRoom', { userId: userThatShouldBeNotified });
});

socket.on('joinedRoom', (message) => {
    console.log('joined room',message);
    socket.on('statusChanged', (data) => {
        console.log('Received a status update:', data);
    });
});

socket.on('welcome', (msg) => {
    console.log('Received message:', msg);
});

socket.on('statusChanged', (data) => {
    console.log(data);
})

socket.on('disconnect', () => {
    console.log('Disconnected from the server');
});

socket.on('connect_error', (err) => {
    console.error('Connection error:', err);
});
