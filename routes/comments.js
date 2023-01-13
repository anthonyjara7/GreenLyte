const express = require('express');
const router = express.Router({ mergeParams: true }); // allows middleware to look in the parent router and find the id
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateComment, isCommentAuthor } = require('../middleware');

const ExpressError = require('../utils/ExpressError');
const comments = require('../controllers/comments');

// Posts a comment to a specific post
router.post('/', isLoggedIn, validateComment, catchAsync(comments.createComment))

router.route('/:commentId')
    .put(isLoggedIn, isCommentAuthor, validateComment, catchAsync(comments.updateComment))
    .delete(isLoggedIn, isCommentAuthor, catchAsync(comments.deleteComment));

module.exports = router;    // needed to export the router to be used in app.js