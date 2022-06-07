const express = require('express');
const router = express.Router();
const path = require('path');
const common = require(path.join(appRoot, 'routes/common/common.js'));

const controller = require('./controller.js');

router.route('/')
    .get(common.readDashCard, controller.getDashboard);
router.route('/dashboard')
    .get(common.readDashCard,controller.getDashboard);

module.exports = router;