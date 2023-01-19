const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Post = require('./post');

const BulletinSchema = new Schema({
    title: String,
    description: String,
    image: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

BulletinSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        const posts = await Post.find({ bulletin: doc.title });
        posts.forEach(async (post) => {
            await Post.findByIdAndDelete(post._id);
        });
    }
})

module.exports = mongoose.model('Bulletin', BulletinSchema);