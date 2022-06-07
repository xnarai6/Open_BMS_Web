const express = require('express');
const router = express.Router();

const controller = require('./controller.js');

router.get('/', (req, res) => { res.redirect('/search/battery'); });

router.route('/battery').get(controller.getBtry);
router.route('/battery/code').post(controller.postBtryCode);
router.route('/battery/list').post(controller.getBtryCartList);
router.route('/battery/:seq').get(controller.getBtryDetail);
router.route('/battery/:seq/info').post(controller.postBtryDetailInfo);
router.route('/battery/:seq/graph/:dth').post(controller.postBtryDetailGraph);
router.route('/battery/:seq/daily').post(controller.postBtryDetailDaily);
router.route('/battery/:seq/period/:dt').post(controller.postBtryDetailPeriod);
router.route('/battery/:seq/test/:date').get(controller.getBtryDetailTest);
router.route('/battery/:seq/test/:date').post(controller.postBtryDetailTest);

//실시간
router.route('/now').get(controller.getNow);
router.route('/now/postCmpyTypeList').post(controller.postCmpyTypeList);
router.route('/now/postBtrySeqList').post(controller.postBtrySeqList);
router.route('/now/postDailyHistory').post(controller.postDailyHistory);
router.route('/now/postFirstLiveData').post(controller.postFirstLiveData);

//알람조회
router.route('/alarmHsty').get(controller.getAlarmHsty);
router.route('/check/postAlarmHstyList').post(controller.postAlarmHstyList);

//점검조회
router.route('/check').get(controller.getCheck);
router.route('/check/postInspecHstry').post(controller.postInspecHstry);
router.route('/check/postLocListByCmpy').post(controller.postLocListByCmpy);
router.route('/check/postInspecTypeList').post(controller.postInspecTypeList);

module.exports = router;