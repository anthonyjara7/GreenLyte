const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const catchAsync = require('./utils/catchAsync');
const methodOverride = require('method-override');
const session = require('express-session'); // Allows us to store data on the server
const flash = require('connect-flash');     // Flash messages

const { postSchema, commentSchema } = require('./schemas')
const Post = require('./models/post');
const Comment = require('./models/comment');
const ExpressError = require('./utils/ExpressError');

const posts = require('./routes/posts');
const comments = require('./routes/comments');

// To avoid deprecation warnings, set strictQuery to false to get ready for mongoose 7.0
mongoose.set('strictQuery', false);

// Establishes connection to localhost database
mongoose.connect('mongodb://127.0.0.1:27017/socialApp')
    .then(() => console.log("Databse Connection Established"))
    .catch(err => console.log(`Error: ${err}`));

// Creates our Express application
const app = express();

app.set('view engine', 'ejs');  // Enables express to utilize ejs templates
app.set('views', path.join(__dirname, 'views'));    // makes app automatically search the views folder

app.use(express.urlencoded({ extended: true }));    // Enables express to parse html requests
app.use(methodOverride('_method')); // Allows put and delete endpoints through ejs templates
app.use(express.static(path.join(__dirname, 'public')));    // Lets express serve files in the public directory, browser will reject files otherwise

const sessionConfig = { // Configures the session
    secret: 'pieceofshitsecret',
    resave: false,  // resave: false means that the session will not be saved if nothing has changed
    saveUninitialized: true,   // saveUninitialized: true means that the session will be saved even if it is uninitialized
    cookie: {
        httpOnly: true, // httpOnly: true means that the cookie will not be accessible through javascript
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week in milliseconds
    }
}
app.use(session(sessionConfig));    // Enables the session
app.use(flash());   // Enables flash messages

app.use((req, res, next) => {
    res.locals.success = req.flash('success');  // Makes the flash messages available to all templates
    res.locals.error = req.flash('error');
    next();
})

app.use('/posts', posts);   // All routes in posts.js will be prefixed with /posts
app.use('/posts/:id/comments', comments);   // All routes in comments.js will be prefixed with /posts/:id/comments

// Home route
app.get('/', (req, res) => {
    res.render('home'); // the view should not begin with a '/' for res.render since res.render already looks in the views folder
});

// If a user tries to go to an endpoint that does not exist, this will execute
// since all other endpoints have been checked
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})

// The error handler which will execute when any error ocurs
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'Oh No, Something Went Wrong';
    res.status(statusCode).render('error', { err });
})

// Turns on the server to listen for connections
app.listen(3000, () => {
    console.log('Serving on port 3000');
});