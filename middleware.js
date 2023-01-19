const { postSchema, commentSchema, bulletinSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Post = require('./models/post');
const Comment = require('./models/comment');
const Bulletin = require('./models/bulletin');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        //console.log(res.locals.returnTo);
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

module.exports.isPostAuthor = async (req, res, next) => {
    const { bulletinId, postId } = req.params;
    const post = await Post.findById(postId);
    if(!post.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/${bulletinId}/posts/${postId}`);
    }
    next();
};

module.exports.isCommentAuthor = async (req, res, next) => {
    const { bulletinId, postId, commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if(!comment.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/${bulletinId}/posts/${postId}`);
    }
    next();
};

module.exports.validateBulletin = (req, res, next) => {
    const { error } = bulletinSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(element => element.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.isBulletinAuthor = async (req, res, next) => {
    const { bulletinId } = req.params;
    const bulletin = await Bulletin.findOne({ title: bulletinId });
    if(!bulletin.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect
    }
    next();
};