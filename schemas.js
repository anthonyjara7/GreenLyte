const Joi = require('joi');

module.exports.postSchema = Joi.object({
    post: Joi.object({
        author: Joi.string().required(),
        title: Joi.string().required().min(5),
        description: Joi.string().required().min(5)
    }).required()
});

module.exports.commentSchema = Joi.object({
    comment: Joi.object({
        author: Joi.string().required(),
        description: Joi.string().required().min(5)
    }).required()
});