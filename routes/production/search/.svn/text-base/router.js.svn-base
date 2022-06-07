const express = require('express');
const router = express.Router();
const path = require('path');
const common = require(path.join(appRoot, 'routes/production/common/common.js'));
const controller = require('./controller.js');

router.get('/', (req, res) => { res.redirect('/production/search/batteryByType'); });

//종류별 배터리 조회
router.route('/batteryByType').get(common.readDashCard,controller.getBatteryByType);
router.route('/batteryByType/code').post(controller.postBtryCode);
router.route('/batteryByType/postBatteryListByType').post(controller.postBatteryListByType);
router.route('/batteryByType/:seq').get(common.readDashCard, controller.getBatteryDetailByType);
router.route('/batteryByType/:seq/info').post(controller.postBatteryDetailInfoByType);
router.route('/batteryByType/:seq/graph/:dth').post(controller.postBatteryDetailGraph);
router.route('/batteryByType/:seq/daily').post(controller.postBatteryDetailDaily);
router.route('/batteryByType/:seq/period/:dt').post(controller.postBtryDetailPeriod);

//수요업체별 배터리 조회
router.route('/batteryByOper').get(common.readDashCard,controller.getBatteryByOper);
router.route('/batteryByOper/code').post(controller.postBtryCode);
router.route('/batteryByOper/postBatteryListByOper').post(controller.postBatteryListByOper);
router.route('/batteryByOper/:seq').get(common.readDashCard, controller.getBatteryDetailByOper);
router.route('/batteryByOper/:seq/info').post(controller.postBatteryDetailInfoByOper);
router.route('/batteryByOper/:seq/graph/:dth').post(controller.postBatteryDetailGraph);
router.route('/batteryByOper/:seq/daily').post(controller.postBatteryDetailDaily);
router.route('/batteryByOper/:seq/period/:dt').post(controller.postBtryDetailPeriod);

//실시간
router.route('/now').get(common.readDashCard, controller.getNow);
router.route('/now/postOperCmpyList').post(controller.postOperCmpyList);
router.route('/now/postCmpyTypeList').post(controller.postCmpyTypeList);
router.route('/now/postBtrySeqList').post(controller.postBtrySeqList);
router.route('/now/postDailyHistory').post(controller.postDailyHistory);
router.route('/now/postFirstLiveData').post(controller.postFirstLiveData);

//알람조회
router.route('/alarmHsty').get(common.readDashCard, controller.getAlarmHsty);
router.route('/check/postAlarmHstyList').post(controller.postAlarmHstyList);

//점검조회
router.route('/check').get(common.readDashCard, controller.getCheck);
router.route('/check/postInspecHstry').post(controller.postInspecHstry);
router.route('/check/postOperCmpyList').post(controller.postOperCmpyList);
router.route('/check/postLocListByCmpy').post(controller.postLocListByCmpy);
router.route('/check/postInspecTypeList').post(controller.postInspecTypeList);

module.exports = router;