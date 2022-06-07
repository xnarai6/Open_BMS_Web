const express = require('express');
const router = express.Router();
const path = require('path');

const controller = require('./controller.js');
const check = require(path.join(appRoot, 'routes/common/prevCheck.js'));
const common = require(path.join(appRoot, 'routes/common/common.js'));

router.route('/')
    .get(common.readDashCard, controller.getDashboard);

router.route('/index')
    .get(common.readDashCard, controller.getDashboard);

router.route('/indivbatterylog')
    .get(common.readDashCard, controller.getIndivBatteryLog);

router.route('/postindivbatteryinfo')
    .post(common.readDashCard, controller.postIndivBatteryInfo);

router.route('/chargegraph')
    .post(controller.postChargeGraphData);

router.route('/socgraph')
    .post(common.readDashCard, controller.postSOCGraphData);

router.route('/bmslist')
    .post(common.readDashCard, controller.postDashBMSList);

router.route('/graphheader')
    .post( controller.postGraphHeader);

router.route('/viewProfile')
    .get(common.readDashCard, controller.getViewProfile);

router.route('/postCheckCurrentPw')
    .post(controller.postCheckCurrentPw);

router.route('/postPwModComplete')
    .post(controller.postPwModComplete);
    
module.exports = router;

