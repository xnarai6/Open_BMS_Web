const express = require('express');
const router = express.Router();
const path = require('path');
const common = require(path.join(appRoot, 'routes/common/common.js'));

const controller = require('./controller.js');

router.route('/acntList')
    .get(common.readDashCard, controller.getAcntList);
router.route('/postAcntList')
    .post(controller.postAcntList);
router.route('/acntReg')
    .get(common.readDashCard, controller.getAcntReg);

module.exports = router;