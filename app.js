const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Post = require('./models/post');

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

// Home route
app.get('/', (req, res) => {
    res.render('home'); // the view should not begin with a '/' for res.render since res.render already looks in the views folder
});

// Displays all posts
app.get('/posts', async (req, res) => {
    const posts = await Post.find({});
    res.render('posts/index', { posts }); // passing in multiple posts as a single object
})

// Displays the create post form
app.get('/posts/new', async (req, res) => {
    res.render('posts/new');
})

// Creates a new post and submits it to the database
app.post('/posts', async (req, res) => {
    // console.log(req.body);
    const post = new Post(req.body.post);
    await post.save();
    res.redirect(`/posts/${post._id}`);
})

// Displays a specific post
app.get('/posts/:id', async (req, res) => {
    const post = await Post.findById(req.params.id);
    res.render('posts/show', { post });
})

// Displays the edit post form
app.get('/posts/:id/edit', async (req, res) => {
    const post = await Post.findById(req.params.id);
    res.render('posts/edit', { post });
})

// Updates a post from the database
app.put('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { ...req.body.post });
    res.redirect(`/posts/${post._id}`);
})

// Deletes a post from the databse
app.delete('/posts/:id', async (req, res) => {
    const post = await Post.findByIdAndDelete(req.params.id);
    res.redirect('/posts');
})

// Turns on the server to listen for connections
app.listen(3000, () => {
    console.log('Serving on port 3000');
});