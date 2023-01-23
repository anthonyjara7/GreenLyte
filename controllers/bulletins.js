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
    const bulletin = await Bulletin.findOne({ title: bulletinId }).populate('author');
    if(!bulletin){
        req.flash('error', 'Cannot find that bulletin!');
        return res.redirect('/bulletins');
    }
    const posts = await Post.find({ bulletin: bulletinId }).populate('author');
    posts.reverse();
    res.render('posts/index', { bulletinId, posts, bulletin });
};

module.exports.renderNewForm = (req, res) => {
    res.render('bulletins/new')
};

module.exports.createBulletin = async (req, res, next) => {
    const bulletin = new Bulletin(req.body.bulletin);
    bulletin.author = req.user._id;
    await bulletin.save();
    req.flash('success', 'Successfully created a new bulletin!');
    res.redirect(`/bulletins/${bulletin.title}`);
};

module.exports.deleteBulletin = async (req, res, next) => {
    const { bulletinId } = req.params;
    const bulletin = await Bulletin.findOneAndDelete({ title: bulletinId });
    if(!bulletin){
        req.flash('error', 'Cannot find that bulletin!');
        return res.redirect('/bulletins');
    }
    req.flash('success', 'Successfully deleted a bulletin!');
    res.redirect('/bulletins');
};

module.exports.renderEditForm = async (req, res, next) => {
    const { bulletinId } = req.params;
    const bulletin = await Bulletin.findOne({ title: bulletinId });
    if(!bulletin){
        req.flash('error', 'Cannot find that bulletin!');
        return res.redirect('/bulletins');
    }
    res.render('bulletins/edit', { bulletin, bulletinId });
}

module.exports.updateBulletin = async (req, res, next) => {
    const { bulletinId } = req.params;
    const bulletin = await Bulletin.findOneAndUpdate({ title: bulletinId }, req.body.bulletin, { runValidators: true, new: true });
    if(!bulletin){
        req.flash('error', 'Cannot find that bulletin!');
        return res.redirect('/bulletins');
    }
    req.flash('success', 'Successfully updated a bulletin!');
    res.redirect(`/bulletins/${bulletin.title}`);
};