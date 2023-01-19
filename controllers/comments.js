const Post = require('../models/post');
const Comment = require('../models/comment');

module.exports.createComment = async (req, res, next) => {
    const { bulletinId, postId } = req.params;
    const post = await Post.findById(postId);
    const comment = new Comment(req.body.comment);
    comment.author = req.user._id;
    post.comments.push(comment);
    await comment.save();
    await post.save();
    req.flash('success', 'Successfully created a new comment!');
    res.redirect(`/${bulletinId}/posts/${post._id}`);
}

module.exports.updateComment = async (req, res, next) => {
    const { postId, commentId } = req.params;
    const post = await Post.findByIdAndUpdate(postId, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentId);
    const comment = new Comment(req.body.comment);
    comment.author = req.user._id;
    post.comments.push(comment);
    await comment.save();
    await post.save();
    req.flash('success', 'Successfully updated a comment!');
    res.redirect(`/posts/${post._id}`);
}

module.exports.deleteComment = async (req, res, next) => {
    const { bulletinId, postId, commentId } = req.params;
    const post = await Post.findByIdAndUpdate(postId, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentId);
    req.flash('success', 'Successfully deleted a comment!');
    res.redirect(`/${bulletinId}/posts/${post._id}`);
}