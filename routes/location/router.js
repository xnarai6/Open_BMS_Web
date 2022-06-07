const express = require('express');
const router = express.Router();
const path = require('path');

const controller = require('./controller.js');
const check = require(path.join(appRoot, 'routes/common/prevCheck.js'));

router.route('/')
    .get(controller.getAssetlocation);

module.exports = router;