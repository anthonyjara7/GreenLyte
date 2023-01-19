const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateBulletin, isBulletinAuthor } = require('../middleware');

const bulletins = require('../controllers/bulletins');

router.route('/bulletins')
    .get(catchAsync(bulletins.index));

router.route('/new')
    .get(isLoggedIn, bulletins.renderNewForm)
    .post(isLoggedIn, validateBulletin, catchAsync(bulletins.createBulletin));

router.route('/allposts')
    .get(catchAsync(bulletins.showAllPosts));

router.route('/:bulletinId')
    .get(catchAsync(bulletins.showBulletin))
    .put(isLoggedIn, isBulletinAuthor, validateBulletin, catchAsync(bulletins.updateBulletin))
    .delete(isLoggedIn, isBulletinAuthor, catchAsync(bulletins.deleteBulletin));

module.exports = router;