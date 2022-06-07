const express = require('express');
const router = express.Router();
const path = require('path');

const controller = require('./controller.js');
const check = require(path.join(appRoot, 'routes/common/prevCheck.js'));
const common = require(path.join(appRoot, 'routes/common/common.js'));

router.route('/acnt')
    .get(common.readDashCard, controller.getAcnt);
router.route('/acnt/reg')
    .get(common.readDashCard, controller.getAcntReg);
router.route('/acnt/dupCheck')
    .post(common.readDashCard, controller.postDupCheck);
router.route('/acnt/reg/acntRoleListByCmpy')
    .post(common.readDashCard, controller.postAcntRoleListByCmpy);
router.route('/acnt/reg/complete')
    .post(common.readDashCard, controller.postAcntRegComplete);
router.route('/acnt/mod')
    .get(common.readDashCard, controller.getAcntMod);
router.route('/acnt/mod/complete')
    .post(common.readDashCard, controller.postAcntModComplete);
router.route('/acnt/delete/complete')
    .post(common.readDashCard, controller.postAcntDeleteComplete);

router.route('/cmpy')
    .get(common.readDashCard, controller.getCmpy);
router.route('/cmpy/reg')
    .get(common.readDashCard, controller.getCmpyReg);
router.route('/cmpy/reg/complete')
    .post(common.readDashCard, controller.postCmpyRegComplete);
router.route('/cmpy/mod')
    .get(common.readDashCard, controller.getCmpyMod);
router.route('/cmpy/mod/complete')
    .post(common.readDashCard, controller.postCmpyModComplete);

router.route('/mgtmodule')
    .get(common.readDashCard, controller.getMgtmodule);
router.route('/mgtmodule/reg')
    .get(common.readDashCard, controller.getMgtmoduleReg);
router.route('/mgtmodule/reg/complete')
    .post(common.readDashCard, controller.postMgtmoduleRegComplete);
router.route('/mgtmodule/mod')
    .get(common.readDashCard, controller.getMgtmoduleMod);
router.route('/mgtmodule/mod/complete')
    .post(common.readDashCard, controller.postMgtmoduleModComplete);
router.route('/mgtmodule/delete/complete')
    .post(common.readDashCard, controller.postMgtmoduleDeleteComplete);

router.route('/mgtbattery')
    .get(common.readDashCard, controller.getMgtbattery);
router.route('/mgtbattery/reg')
    .get(common.readDashCard, controller.getMgtbatteryReg);
router.route('/mgtbattery/reg/complete')
    .post(common.readDashCard, controller.postMgtbatteryRegComplete);
router.route('/mgtbattery/mod')
    .get(common.readDashCard, controller.getMgtbatteryMod);
router.route('/mgtbattery/postMdlMftrByMdlSeq')
    .post(common.readDashCard, controller.postMdlMftrByMdlSeq);
router.route('/mgtbattery/postCmpyNmByLocSeq')
    .post(common.readDashCard, controller.postCmpyNmByLocSeq);
router.route('/mgtbattery/mod/complete')
    .post(common.readDashCard, controller.postMgtbatteryModComplete);
router.route('/mgtbattery/delete/complete')
    .post(common.readDashCard, controller.postMgtbatteryDeleteComplete);

router.route('/mgtlocation')
    .get(common.readDashCard, controller.getMgtlocation);
router.route('/mgtlocation/reg')
    .get(common.readDashCard, controller.getMgtlocationReg);
router.route('/mgtlocation/reg/complete')
    .post(common.readDashCard, controller.postMgtlocationRegComplete);
router.route('/mgtlocation/mod')
    .get(common.readDashCard, controller.getMgtlocationMod);
router.route('/mgtlocation/mod/complete')
    .post(common.readDashCard, controller.postMgtlocationModComplete);
router.route('/mgtlocation/delete/complete')
    .post(common.readDashCard, controller.postMgtlocationDeleteComplete);
router.route('/jusoPopup')
    .get(common.readDashCard, controller.getJusoPopup);
router.route('/mgtlocation/postConvertLonAndLat')
    .post(common.readDashCard, controller.postConvertLonAndLat);

router.route('/mgtalarm')
    .get(common.readDashCard, controller.getMgtalarm);
router.route('/mgtalarm/reg')
    .get(common.readDashCard, controller.getMgtalarmReg);
router.route('/mgtalarm/reg/complete')
    .post(common.readDashCard, controller.postMgtalarmRegComplete);
router.route('/mgtalarm/mod')
    .get(common.readDashCard, controller.getMgtalarmMod);
router.route('/mgtalarm/mod/complete')
    .post(common.readDashCard, controller.postMgtalarmModComplete);

router.route('/alarmsetup')
    .get(common.readDashCard, controller.getAlarmsetup);
router.route('/getArmdataList')
    .post( controller.getArmdataList);
router.route('/alarmReg')
    .get(common.readDashCard,  controller.getAlarmReg);   
router.route('/setArmdataList')
    .post(common.readDashCard,  controller.postsetArmdataList);

    
module.exports = router;