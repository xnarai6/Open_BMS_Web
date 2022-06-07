const express = require('express');
const router = express.Router();
const path = require('path');

const controller = require('./controller.js');
const check = require(path.join(appRoot, 'routes/common/prevCheck.js'));
const common = require(path.join(appRoot, 'routes/common/common.js'));

router.route('/')
    .get(controller.getAssethistory);

    router.route('/assetlocation')
    .get(common.readDashCard, controller.getAssetlocation);

    router.route('/assetlocation/btry')
    .post(controller.postAssetlocationBtry);

    router.route('/assetlocation/history')
    .post(controller.postAssetInspecHstry);

    router.route('/assethistory')
    .get(common.readDashCard, controller.getAssethistory);

    router.route('/assetcalandar')
    .get(common.readDashCard, controller.getAssetcalandar);

    router.route('/assetcalandar/event')
    .post(controller.postCalendarHistory);

    router.route('/assetcalendar/regist')
    .post(controller.postCalendarRegistComplete);

    router.route('/assetcalendar/delete')
    .post(controller.postCalendarDeleteComplete);

module.exports = router;