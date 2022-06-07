const express = require('express');
const router = express.Router();
const path = require('path');

const controller = require('./controller.js');

const common = require(path.join(appRoot, 'routes/production/common/common.js'));

router.get('/', (req, res) => { res.redirect('/account/profile'); });

router.route('/profile').get(common.readDashCard, controller.getUserProfile);
router.route('/profile/info').post(controller.postUserProfileInfo);
router.route('/profile/chg').post(controller.postUserProfileChg);
router.route('/profile/chg/pw').post(controller.postUserProfileChgPw);

module.exports = router;