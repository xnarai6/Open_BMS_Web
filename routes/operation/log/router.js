const express = require('express');
const router = express.Router();
const path = require('path');

const controller = require('./controller.js');
const check = require(path.join(appRoot, 'routes/common/prevCheck.js'));
const common = require(path.join(appRoot, 'routes/common/common.js'));

router.route('/')
    .get(common.readDashCard, controller.getRealtimelog);

router.route('/realtimelog')
    .get(common.readDashCard, controller.getRealtimelog);

router.route('/realtimedatalog')
    .get(common.readDashCard, controller.getRealtimedatalog);

router.route('/getRealtimedataList')
    .get(common.readDashCard, controller.getRealtimedataList);
    
router.route('/firstLiveData')
    .post(controller.postFirstLiveData);

router.route('/livedata')
    .post(controller.postLiveData);

router.route('/firstLiveDataForMore')
    .post(controller.postFirstLiveDataForMore);

router.route('/postChargeByTempAndTime')
    .post(controller.postChargeByTempAndTime);
    
module.exports = router;