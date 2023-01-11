const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ObjectID = require('mongoose').Types.ObjectId;
const { isLoggedIn, validatePost, isAuthor } = require('../middleware');

const { postSchema } = require('../schemas');
const ExpressError = require('../utils/ExpressError');
const Post = require('../models/post');

// Displays all posts
router.get('/', catchAsync(async (req, res, next) => {
    const posts = await Post.find({}).populate('author');
    posts.reverse();
    res.render('posts/index', { posts });
}))

// Displays the create post form
router.get('/new', isLoggedIn, (req, res) => {
    res.render('posts/new');
})

// Creates a new post and submits it to the database
router.post('/', isLoggedIn, validatePost, catchAsync(async (req, res, next) => {
    const post = new Post(req.body.post);
    post.author = req.user._id;
    await post.save();
    req.flash('success', 'Successfully created a new post!');
    res.redirect(`/posts/${post._id}`);
}))

// Displays a specific post
router.get('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // below will be made into a middleware to catch invalid ids
    if (!ObjectID.isValid(id)) {
        req.flash('error', 'Cannot find that post!');
        return res.redirect('/posts');
    }
    const post = await Post.findById(id).populate({
        path:'comments',
        populate: {
            path: 'author'
    }}).populate('author');
    post.comments.reverse();
    if (!post) {
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
router.put('/:id', isLoggedIn, isAuthor, validatePost, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { ...req.body.post });
    req.flash('success', 'Successfully updated a post!');
    res.redirect(`/posts/${post._id}`);
}))

// Deletes a post from the databse
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res, next) => {
    const post = await Post.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted a post!');
    res.redirect('/posts');
}))

module.exports = router;    // needed to export the router to be used in app.js