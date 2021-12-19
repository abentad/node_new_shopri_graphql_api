const { GraphQLServer } = require('graphql-yoga');
const path = require('path');
const express = require('express');
const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');
const User = require('./resolvers/User');
const Conversation = require('./resolvers/Conversation');
const Message = require('./resolvers/Message');
const Product = require('./resolvers/Product');
const Upload = require('./resolvers/Upload');
const WishList = require('./resolvers/WishList');
const db = require('../models');
const { init_socketio_server, socketio_api } = require('./socket_io_api');


const server = new GraphQLServer({ 
    typeDefs:'src/schema.graphql',
    resolvers: { Upload, Query, Mutation, User, Product, Conversation, Message, WishList },
    context(req){ return { req, db }; } 
});
server.express.use('/profile', express.static(path.join(__dirname, `images/profile/`)));
server.express.use('/product', express.static(path.join(__dirname, `images/products/`)));

const io = init_socketio_server();
socketio_api(io);


server.start(() => console.log('Server is running on http://localhost:4000'));
