const express = require('express');
const router = express.Router();
const path = require('path');

const controller = require('./controller.js');
const check = require(path.join(appRoot, 'routes/common/prevCheck.js'));
const common = require(path.join(appRoot, 'routes/common/common.js'));

router.route('/').get(common.readDashCard, controller.getDaily);
router.route('/daily').get(common.readDashCard, controller.getDaily);
router.route('/weekly').get(common.readDashCard, controller.getWeekly);
router.route('/monthly').get(common.readDashCard, controller.getMonthly);
router.route('/daily/history').post(controller.postDailyHistory);
router.route('/monthly/history').post(controller.postMonthlyHistory);
router.route('/weekly/history').post(controller.postWeeklyHistory);
module.exports = router;