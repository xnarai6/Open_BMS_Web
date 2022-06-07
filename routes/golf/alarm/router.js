const express = require('express');
const router = express.Router();
const controller = require('./controller.js');
const path = require('path');

//알람
router.route('/').get(controller.getAlarm);
router.route('/postSetAlarm').post(controller.postSetAlarm);
router.route('/sendingMailTest').post(controller.sendingMailTest);
module.exports = router;