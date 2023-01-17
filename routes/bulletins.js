const express = require('express');
const router = express.Router();

const bulletin = require('../controllers/bulletin');

router.route('/:bulletinId')
    .get(bulletin.showBulletin);

module.exports = router;