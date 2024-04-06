const express = require('express');
const Router = express.Router();
const User  = require('../bean/user');
const { verifyToken } = require('../bean/middleware');

Router.post('/register',User.register);
Router.post('/login',User.login);

Router.get('/get',verifyToken,User.getUser);
Router.post('/update',verifyToken,User.updateUser);
Router.delete('/delete',verifyToken,User.deleteUser);
Router.get('/forgot-password',User.getForgotPassword)
Router.post('/forgot-password',User.forgotPassword);
Router.get('/reset-password/:token',User.getResetPassword);
Router.post('/reset-password/:token', User.resetPassword);


module.exports = Router;
