const express = require('express');
const router = express.Router();

const controller = require('./controller.js');

router.get('/', (req, res) => { res.redirect('/account/profile'); });

router.route('/profile').get(controller.getUserProfile);
router.route('/profile/info').post(controller.postUserProfileInfo);
router.route('/profile/chg').post(controller.postUserProfileChg);
router.route('/profile/chg/pw').post(controller.postUserProfileChgPw);

module.exports = router;