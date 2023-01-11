const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to GreenLyte!');
            res.redirect('/posts');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', 
    // failureFlash is a passport-local-mongoose feature that allows us to display flash messages
    // failureRedirect is a passport-local-mongoose feature that allows us to redirect to a different page
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), 
    (req, res) => {
        req.flash('success', 'Welcome back!');
        const redirectUrl = req.session.returnTo || '/posts';
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    }
);

router.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
    });
    req.flash('success', 'Goodbye!');
    res.redirect('/posts');
});

module.exports = router;