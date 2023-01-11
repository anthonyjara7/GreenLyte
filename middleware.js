const { postSchema, commentSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Post = require('./models/post');
const Comment = require('./models/comment');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};

// Serverside validation to handle any incoming requests which
// contain only partial information needed
// Examples can be shown through postman
module.exports.validatePost = (req, res, next) => {
    //console.log(req.body);
    const { error } = postSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(element => element.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

// Servserside validation to handle incoming comment requests
module.exports.validateComment = (req, res, next) => {
    const { error } = commentSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(element => element.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    if(!post.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/posts/${id}`);
    }
    next();
};

module.exports.isCommentAuthor = async (req, res, next) => {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if(!comment.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/posts/${id}`);
    }
    next();
};