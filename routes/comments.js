const express = require('express');
const router = express.Router({ mergeParams: true }); // allows middleware to look in the parent router and find the id
const catchAsync = require('../utils/catchAsync');

const { commentSchema } = require('../schemas');
const ExpressError = require('../utils/ExpressError');
const Post = require('../models/post');
const Comment = require('../models/comment');

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

// Posts a comment to a specific post
router.post('/', validateComment, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    const comment = new Comment(req.body.comment);
    post.comments.push(comment);
    await comment.save();
    await post.save();
    req.flash('success', 'Successfully created a new comment!');
    res.redirect(`/posts/${post._id}`);
}))

// Updates the comment on a specific post
router.put('/:commentId', validateComment, catchAsync(async (req, res, next) => {
    const { id, commentId } = req.params;
    const post = await Post.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    const comment = new Comment(req.body.comment);
    post.comments.push(comment);
    await comment.save();
    await post.save();
    req.flash('success', 'Successfully updated a comment!');
    res.redirect(`/posts/${post._id}`);
}))

// Deletes a comment from a specific post
router.delete('/:commentId', catchAsync(async (req, res, next) => {
    const { id, commentId } = req.params;
    const post = await Post.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentId);
    req.flash('success', 'Successfully deleted a comment!');
    res.redirect(`/posts/${post._id}`);
}))

module.exports = router;    // needed to export the router to be used in app.js