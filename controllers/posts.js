const Post = require('../models/post');
const ObjectID = require('mongoose').Types.ObjectId;

module.exports.index = async (req, res, next) => {
    const posts = await Post.find({}).populate('author');
    posts.reverse();
    res.render('posts/index', { posts });
}

module.exports.renderNewForm = (req, res) => {
    const { bulletinId } = req.params;
    res.render('posts/new', { bulletinId });
}

module.exports.createPost = async (req, res, next) => {
    const { bulletinId } = req.params;
    const post = new Post(req.body.post);
    post.bulletin = bulletinId;
    post.author = req.user._id;
    await post.save();
    req.flash('success', 'Successfully created a new post!');
    res.redirect(`/${bulletinId}/posts/${post._id}`);
};

module.exports.showPost = async (req, res, next) => {
    const { bulletinId, postId } = req.params;
    // below will be made into a middleware to catch invalid ids
    if (!ObjectID.isValid(postId)) {
        req.flash('error', 'Cannot find that post!');
        return res.redirect('/posts');
    }
    const post = await Post.findById(postId).populate({
        path:'comments',
        populate: {
            path: 'author'
    }}).populate('author');
    post.comments.reverse();
    if (!post) {
        req.flash('error', 'Cannot find that post!');
        return res.redirect('/posts');
    }
    res.render('posts/show', { bulletinId, post });
};

module.exports.renderEditForm = async (req, res, next) => {
    const { bulletinId } = req.params;
    const post = await Post.findById(req.params.postId);
    res.render('posts/edit', { bulletinId, post });
};

module.exports.updatePost = async (req, res, next) => {
    const { bulletinId, postId } = req.params;
    const post = await Post.findByIdAndUpdate(postId, { ...req.body.post });
    req.flash('success', 'Successfully updated a post!');
    res.redirect(`/${bulletinId}/posts/${post._id}`);
};

module.exports.deletePost = async (req, res, next) => {
    const { bulletinId } = req.params;
    const post = await Post.findByIdAndDelete(req.params.postId);
    req.flash('success', 'Successfully deleted a post!');
    res.redirect(`/${bulletinId}`);
};