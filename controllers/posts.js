const Post = require('../models/post');
const ObjectID = require('mongoose').Types.ObjectId;

module.exports.index = async (req, res, next) => {
    const posts = await Post.find({}).populate('author');
    posts.reverse();
    res.render('posts/index', { posts });
}

module.exports.renderNewForm = (req, res) => {
    res.render('posts/new')
}

module.exports.createPost = async (req, res, next) => {
    const post = new Post(req.body.post);
    post.author = req.user._id;
    await post.save();
    req.flash('success', 'Successfully created a new post!');
    res.redirect(`/posts/${post._id}`);
};

module.exports.showPost = async (req, res, next) => {
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
};

module.exports.renderEditForm = async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    res.render('posts/edit', { post });
};

module.exports.updatePost = async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { ...req.body.post });
    req.flash('success', 'Successfully updated a post!');
    res.redirect(`/posts/${post._id}`);
};

module.exports.deletePost = async (req, res, next) => {
    const post = await Post.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted a post!');
    res.redirect('/posts');
};