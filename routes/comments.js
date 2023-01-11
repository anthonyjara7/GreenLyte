const express = require('express');
const router = express.Router({ mergeParams: true }); // allows middleware to look in the parent router and find the id
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateComment, isCommentAuthor } = require('../middleware');

const { commentSchema } = require('../schemas');
const ExpressError = require('../utils/ExpressError');
const Post = require('../models/post');
const Comment = require('../models/comment');



// Posts a comment to a specific post
router.post('/', isLoggedIn, validateComment, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    const comment = new Comment(req.body.comment);
    comment.author = req.user._id;
    post.comments.push(comment);
    await comment.save();
    await post.save();
    req.flash('success', 'Successfully created a new comment!');
    res.redirect(`/posts/${post._id}`);
}))

// Updates the comment on a specific post
router.put('/:commentId', isLoggedIn, isCommentAuthor, validateComment, catchAsync(async (req, res, next) => {
    const { id, commentId } = req.params;
    const post = await Post.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentId);
    const comment = new Comment(req.body.comment);
    post.comments.push(comment);
    await comment.save();
    await post.save();
    req.flash('success', 'Successfully updated a comment!');
    res.redirect(`/posts/${post._id}`);
}))

// Deletes a comment from a specific post
router.delete('/:commentId', isLoggedIn, isCommentAuthor, catchAsync(async (req, res, next) => {
    const { id, commentId } = req.params;
    const post = await Post.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentId);
    req.flash('success', 'Successfully deleted a comment!');
    res.redirect(`/posts/${post._id}`);
}))

module.exports = router;    // needed to export the router to be used in app.js