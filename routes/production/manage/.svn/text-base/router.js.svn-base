const express = require('express');
const router = express.Router();
const path = require('path');

const common = require(path.join(global.appRoot, 'routes/common/common.js'));

const controller = require('./controller.js');

router.get('/', (req, res) => { res.redirect('/production/manage/user'); });

//회사 관리
router.route('/company').get(common.readDashCard, controller.getCompany);
router.route('/company/list').post(controller.postCompanyList);
router.route('/company/detail/:seq').get(common.readDashCard, controller.getCompanyDetail);
router.route('/company/detail/:seq/info').post(controller.postCompanyDetailInfo);
router.route('/company/detail/:seq/chg').post(controller.postCompanyDetailChg);
router.route('/company/reg').get(common.readDashCard, controller.getCompanyReg);
router.route('/company/reg/dup').post(controller.postCompanyRegDup);
router.route('/company/chk/reg').post(controller.postCompanyRegChk);

//사용자 관리
router.route('/user').get(common.readDashCard, controller.getUser);
router.route('/user/list').post(controller.postUserList);
router.route('/user/detail/:seq').get(common.readDashCard, controller.getUserDetail);
router.route('/user/detail/:seq/info').post(controller.postUserDetailInfo);
router.route('/user/detail/:seq/chg').post(controller.postUserDetailChg);
router.route('/user/reg').get(common.readDashCard, controller.getUserReg);
router.route('/user/reg/code').post(controller.postUserRegCode);
router.route('/user/reg/dup').post(controller.postUserRegDup);
router.route('/user/chk/reg').post(controller.postUserRegChk);

//배터리 관리
router.route('/battery').get(common.readDashCard, controller.getBattery);
router.route('/battery/list').post(controller.postBatteryList);
router.route('/battery/detail/:seq').get(common.readDashCard, controller.getBatteryDetail);
router.route('/battery/detail/:seq/info').post(controller.postBatteryDetailInfo);

router.route('/battery/reg').get(common.readDashCard, controller.getBatteryReg);
router.route('/battery/reg/dup').post(controller.postBatteryRegDup);
router.route('/battery/chk/reg').post(controller.postBatteryRegChk);

//배터리 등록,수정 select box
router.route('/battery/codeList').post(controller.postBatteryCodeList);
router.route('/battery/mdlMftrByMdlSeq').post(controller.postMdlMftrByMdlSeq);
router.route('/battery/searchDmdrCmpy').post(controller.postSearchDmdrCmpy);
router.route('/battery/searchLocByDmdrCmpy').post(controller.postSearchLocByDmdrCmpy);

//배터리 설치회사 검색 팝업
router.route('/battery/openSearchDmdrCmpy').get(controller.getOpenSearchDmdrCmpy);

module.exports = router;