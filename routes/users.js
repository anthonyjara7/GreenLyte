const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');
const { checkReturnTo } = require('../middleware')

router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLoginForm)
    .post(
    // failureFlash is a passport-local-mongoose feature that allows us to display flash messages
    // failureRedirect is a passport-local-mongoose feature that allows us to redirect to a different page
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), 
    users.login);

router.get('/logout', users.logout);

module.exports = router;