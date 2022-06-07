const express = require('express');
const router = express.Router();
const controller = require('./controller.js');
const path = require('path');
const common = require(path.join(appRoot, 'routes/production/common/common.js'));

//알람
router.route('/').get(common.readDashCard,controller.getAlarm);
router.route('/postSetAlarm').post(controller.postSetAlarm);
router.route('/sendingMailTest').post(controller.sendingMailTest);
module.exports = router;