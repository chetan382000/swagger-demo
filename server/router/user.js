const express = require('express');
const Router = express.Router();
const User  = require('../bean/user');
const { verifyToken } = require('../bean/middleware');

Router.post('/register',User.register);
Router.post('/login',User.login);

Router.get('/get',verifyToken,User.getUser);
Router.post('/update',verifyToken,User.updateUser);
Router.delete('/delete',verifyToken,User.deleteUser);


module.exports = Router;
