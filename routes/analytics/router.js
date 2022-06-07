const express = require('express');
const router = express.Router();
const path = require('path');

const controller = require('./controller.js');
const check = require(path.join(appRoot, 'routes/common/prevCheck.js'));
const common = require(path.join(appRoot, 'routes/common/common.js'));

router.route('/')
    .get(common.readDashCard, controller.getHealth);

router.route('/analytics')
    .get(common.readDashCard, controller.getAnalytics);

router.route('/health')
    .get(common.readDashCard, controller.getHealth);


    router.route('/btryDetailList')
    .post(controller.postbtryDetailList);
    
    router.route('/btryDetail')
    .post(controller.postbtryDetail);
    
    router.route('/firstLiveData')
    .post(common.readDashCard, controller.postFirstLiveData);
    router.route('/analyticsFirstLiveData')
    .post(common.readDashCard, controller.postAnalyticsFirstLiveData);
    
    
module.exports = router;