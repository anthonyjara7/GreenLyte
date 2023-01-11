const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ObjectID = require('mongoose').Types.ObjectId;

const { postSchema } = require('../schemas');
const ExpressError = require('../utils/ExpressError');
const Post = require('../models/post');

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

// Displays all posts
router.get('/', catchAsync(async (req, res, next) => {
    const posts = await Post.find({});
    posts.reverse();
    res.render('posts/index', { posts });
}))

// Displays the create post form
router.get('/new', (req, res) => {
    res.render('posts/new');
})

// Creates a new post and submits it to the database
router.post('/', validatePost, catchAsync(async (req, res, next) => {
    const post = new Post(req.body.post);
    await post.save();
    req.flash('success', 'Successfully created a new post!');
    res.redirect(`/posts/${post._id}`);
}))

// Displays a specific post
router.get('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
        req.flash('error', 'Cannot find that post!');
        return res.redirect('/posts');
    }
    const post = await Post.findById(id).populate('comments');
    if(!post) {
        req.flash('error', 'Cannot find that post!');
        return res.redirect('/posts');
    }
    res.render('posts/show', { post });
}))

// Displays the edit post form
router.get('/:id/edit', catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    res.render('posts/edit', { post });
}))

// Updates a post from the database
router.put('/:id', validatePost, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { ...req.body.post });
    req.flash('success', 'Successfully updated a post!');
    res.redirect(`/posts/${post._id}`);
}))

// Deletes a post from the databse
router.delete('/:id', catchAsync(async (req, res, next) => {
    const post = await Post.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted a post!');
    res.redirect('/posts');
}))

module.exports = router;    // needed to export the router to be used in app.js