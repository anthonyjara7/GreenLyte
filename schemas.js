const Joi = require('joi');

module.exports.postSchema = Joi.object({
    post: Joi.object({
        author: Joi.string().required(),
        description: Joi.string().required().min(10)
    }).required()
});