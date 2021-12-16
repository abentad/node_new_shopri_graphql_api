const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const init_socketio_server = () => {
    const app = express();
    const server = http.createServer(app);
    const io = socketio(server, { cors: { origin: "*" } });
    server.listen(5000);
    return io;
}

const socketio_api = (io) => {
//socket connections 
io.on('connection', (socket) => {
    console.log('client connect...', socket.id);
  
    //for sending message to all users
    socket.on('send-message', (message) => {
      io.emit('receive-message', message);  
    });
    
    //for joining a room
    socket.on('join-room', (roomName)=> {
      socket.join(roomName);
      // console.log(`${socket.id} joined ${roomName}`);
    });
  
    //for sending message to who are inside the given room users
    socket.on('send-message-to-room', (data) => {
      socket.to(data['roomName']).emit('receive-message-from-room', data['message']);
    });
  
    //for when user disconnects
    socket.on('disconnect', () => {
      console.log('client disconnect...', socket.id);
    });
  
    //for when error occurs
    socket.on('error', (err) => { 
      console.log('received error from client:', socket.id);
      console.log(err);
    });
  });
}

module.exports = { init_socketio_server, socketio_api };