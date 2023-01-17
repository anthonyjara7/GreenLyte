const Post = require('../models/post');

module.exports.showBulletin = async (req, res, next) => {
    const { bulletinId } = req.params;
    const posts = await Post.find({ bulletin: bulletinId }).populate('author');
    posts.reverse();
    res.render('posts/index', { posts });
};