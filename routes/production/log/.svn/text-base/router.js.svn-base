const express = require('express');
const router = express.Router();
const controller = require('./controller.js');
const path = require('path');
const common = require(path.join(appRoot, 'routes/production/common/common.js'));

router.get('/', (req, res) => { res.redirect('/production/log/user'); });

//사용자 로그
router.route('/user').get(common.readDashCard,controller.getUser);
router.route('/user/postAcntLogList').post(controller.postAcntLogList);
router.route('/user/postOperCmpyList').post(controller.postOperCmpyList);

//알람 로그
router.route('/alarm').get(common.readDashCard,controller.getAlarm);
router.route('/alarm/postAlarmLogList').post(controller.postAlarmLogList);
router.route('/alarm/postOperCmpyList').post(controller.postOperCmpyList);

module.exports = router;