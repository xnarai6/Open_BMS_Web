const express = require('express');
const router = express.Router();

const controller = require('./controller.js');

router.get('/', (req, res) => { res.redirect('/manage/user'); });

router.route('/user').get(controller.getUser);
router.route('/user/list').post(controller.postUserList);
router.route('/user/detail/:seq').get(controller.getUserDetail);
router.route('/user/detail/:seq/info').post(controller.postUserDetailInfo);
router.route('/user/detail/:seq/chg').post(controller.postUserDetailChg);

router.route('/user/reg').get(controller.getUserReg);
router.route('/user/reg/code').post(controller.postUserRegCode);
router.route('/user/reg/dup').post(controller.postUserRegDup);
router.route('/user/chk/reg').post(controller.postUserRegChk);

router.route('/user/profile').get(controller.getUserProfile);
router.route('/user/profile/info').post(controller.postUserProfileInfo);
router.route('/user/profile/chg').post(controller.postUserProfileChg);
router.route('/user/profile/chg/pw').post(controller.postUserProfileChgPw);

module.exports = router;