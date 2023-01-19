const Joi = require('joi');

module.exports.postSchema = Joi.object({
    post: Joi.object({
        title: Joi.string().required().min(5),
        description: Joi.string().required().min(5)
    }).required()
});

module.exports.commentSchema = Joi.object({
    comment: Joi.object({
        description: Joi.string().required().min(5)
    }).required()
});

module.exports.bulletinSchema = Joi.object({
    bulletin: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required().min(5),
        image: Joi.string().required()
    }).required()
});