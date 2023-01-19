const Post = require('../models/post');
const Bulletin = require('../models/bulletin');

module.exports.index = async (req, res, next) => {
    const bulletins = await Bulletin.find({});
    res.render('bulletins/index', { bulletins });
};

module.exports.showAllPosts = async (req, res, next) => {
    const bulletinId = 'allposts';
    const posts = await Post.find({}).populate('author');
    posts.reverse();
    res.render('posts/index', { bulletinId, posts });
};

module.exports.showBulletin = async (req, res, next) => {
    const { bulletinId } = req.params;
    const posts = await Post.find({ bulletin: bulletinId }).populate('author');
    posts.reverse();
    res.render('posts/index', { bulletinId, posts });
};

module.exports.renderNewForm = (req, res) => {
    res.render('bulletins/new')
};

module.exports.createBulletin = async (req, res, next) => {
    const bulletin = new Bulletin(req.body.bulletin);
    bulletin.author = req.user._id;
    await bulletin.save();
    req.flash('success', 'Successfully created a new bulletin!');
    res.redirect(`/${bulletin.title}`);
};

module.exports.deleteBulletin = async (req, res, next) => {
    const { bulletinId } = req.params;
    const bulletin = await Bulletin.findOneAndDelete({ title: bulletinId });
    req.flash('success', 'Successfully deleted a bulletin!');
    res.redirect('/bulletins');
};

module.exports.renderEditForm = async (req, res, next) => {
    const { bulletinId } = req.params;
    const bulletin = await Bulletin.findById(bulletinId);
    res.render('bulletins/edit', { bulletin });
}