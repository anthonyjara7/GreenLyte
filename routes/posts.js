const express = require('express');
const router = express.Router({ mergeParams: true }); // allows middleware to look in the parent router and find the id
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validatePost, isPostAuthor } = require('../middleware');

const ExpressError = require('../utils/ExpressError');
const posts = require('../controllers/posts');

router.route('/')
    .get(catchAsync(posts.index))
    .post(isLoggedIn, validatePost, catchAsync(posts.createPost));

// Displays the create post form
router.get('/new', isLoggedIn, posts.renderNewForm);

router.route('/:postId')
    .get(catchAsync(posts.showPost))
    .put(isLoggedIn, isPostAuthor, validatePost, catchAsync(posts.updatePost))
    .delete(isLoggedIn, isPostAuthor, catchAsync(posts.deletePost));

// Displays the edit post form
router.get('/:postId/edit', isLoggedIn, isPostAuthor, catchAsync(posts.renderEditForm));

module.exports = router;    // needed to export the router to be used in app.js