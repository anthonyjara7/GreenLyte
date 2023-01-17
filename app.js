const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const catchAsync = require('./utils/catchAsync');
const methodOverride = require('method-override');
const session = require('express-session'); // Allows us to store data on the server
const flash = require('connect-flash');     // Flash messages
const passport = require('passport');   // Handles authentication
const LocalStrategy = require('passport-local');  // Handles authentication with username and password

const { postSchema, commentSchema } = require('./schemas')
const Post = require('./models/post');
const Comment = require('./models/comment');
const User = require('./models/user');
const ExpressError = require('./utils/ExpressError');

const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const bulletinRoutes = require('./routes/bulletins');

// To avoid deprecation warnings, set strictQuery to false to get ready for mongoose 7.0
mongoose.set('strictQuery', false);

// Establishes connection to localhost database
// Will throw error if initial connection fails
mongoose.connect('mongodb://127.0.0.1:27017/socialApp')
    .then(() => console.log("Databse Connection Established"))
    .catch(err => console.log(`Error: ${err}`));

// Gets the connection object
const db = mongoose.connection;
// Binds the connection to an error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'connection error:'));
// Will execute once the connection is open
db.once('open', () => {
    console.log("Database Connected");
});

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
};

app.use(session(sessionConfig));    // Enables the session
app.use(flash());   // Enables flash messages

app.use(passport.initialize()); // Enables passport
app.use(passport.session());    // Enables passport to use sessions for persistent login sessions
passport.use(new LocalStrategy(User.authenticate()));   // Tells passport to use the authenticate method from passport-local-mongoose

passport.serializeUser(User.serializeUser());   // Tells passport how to store the user in the session
passport.deserializeUser(User.deserializeUser()); // Tells passport how to unstore the user from the session

app.use((req, res, next) => {
    //console.log(req.session);   // Prints the session to the console
    res.locals.currentUser = req.user;  // Makes the current user available to all templates
    res.locals.success = req.flash('success');  // Makes the flash messages available to all templates
    res.locals.error = req.flash('error');
    next();
});

app.use('/', userRoutes);     // All routes in userRoutes.js will be prefixed with /userRoutes
app.use('/posts', postRoutes);   // All routes in postRoutes.js will be prefixed with /postRoutes
app.use('/posts/:id/comments', commentRoutes);   // All routes in commentRoutes.js will be prefixed with /postRoutes/:id/commentRoutes
//app.use('/', bulletinRoutes);    // All routes in boardRoutes.js will be prefixed with /boardRoutes

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