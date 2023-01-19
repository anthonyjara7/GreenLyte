const mongoose = require('mongoose');
const Comment = require('./comment')
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: String,
    description: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    bulletin: String
})

// Deletion middleware which deletes all comments associated with a post
// 'doc' is the object that was deleted which we can access in this middleware
PostSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        // Goes through comments array in doc and deletes all comments with the associated _id
        await Comment.deleteMany({
            _id: {
                $in: doc.comments
            }
        })
    }
})

PostSchema.post('deleteMany', async function (doc) {
    if (doc) {
        //console.log(doc.comments);
        await Comment.deleteMany({
            _id: {
                $in: doc.comments
            }
        })
    }
})

module.exports = mongoose.model('Post', PostSchema);