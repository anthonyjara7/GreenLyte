const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { postSchema, commentSchema } = require('./schemas')
const catchAsync = require('./utils/catchAsync');
const methodOverride = require('method-override');
const Post = require('./models/post');
const Comment = require('./models/comment');
const ExpressError = require('./utils/ExpressError');

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

// Serverside validation to handle any incoming requests which
// contain only partial information needed
// Examples can be shown through postman
const validatePost = (req, res, next) => {
    //console.log(req.body);
    const { error } = postSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(element => element.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// Servserside validation to handle incoming comment requests
const validateComment = (req, res, next) => {
    const { error } = commentSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(element => element.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// Home route
app.get('/', (req, res) => {
    res.render('home'); // the view should not begin with a '/' for res.render since res.render already looks in the views folder
});

// Displays all posts
app.get('/posts', catchAsync(async (req, res, next) => {
    const posts = await Post.find({});
    res.render('posts/index', { posts });
}))

// Displays the create post form
app.get('/posts/new', (req, res) => {
    res.render('posts/new');
})

// Creates a new post and submits it to the database
app.post('/posts', validatePost, catchAsync(async (req, res, next) => {
    const post = new Post(req.body.post);
    await post.save();
    res.redirect(`/posts/${post._id}`);
}))

// Displays a specific post
app.get('/posts/:id', catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id).populate('comments');
    res.render('posts/show', { post });
}))

// Displays the edit post form
app.get('/posts/:id/edit', catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    res.render('posts/edit', { post });
}))

// Updates a post from the database
app.put('/posts/:id', validatePost, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { ...req.body.post });
    res.redirect(`/posts/${post._id}`);
}))

// Deletes a post from the databse
app.delete('/posts/:id', catchAsync(async (req, res, next) => {
    const post = await Post.findByIdAndDelete(req.params.id);
    res.redirect('/posts');
}))

// Posts a comment to a specific post
app.post('/posts/:id/comments', validateComment, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    const comment = new Comment(req.body.comment);
    post.comments.push(comment);
    await comment.save();
    await post.save();
    res.redirect(`/posts/${post._id}`);
}))

// Updates the comment on a specific post
app.put('/posts/:id/comments/:commentId', validateComment, catchAsync(async (req, res, next) => {
    const { id, commentId } = req.params;
    const post = await Post.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    const comment = new Comment(req.body.comment);
    post.comments.push(comment);
    await comment.save();
    await post.save();
    res.redirect(`/posts/${post._id}`);
}))

// Deletes a comment from a specific post
app.delete('/posts/:id/comments/:commentId', catchAsync(async (req, res, next) => {
    const { id, commentId } = req.params;
    const post = await Post.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentId);
    res.redirect(`/posts/${post._id}`);
}))

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