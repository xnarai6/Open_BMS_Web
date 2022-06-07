const express = require('express');
const router = express.Router();
const path = require('path');

const controller = require('./controller.js');
const check = require(path.join(appRoot, 'routes/common/prevCheck.js'));
const common = require(path.join(appRoot, 'routes/common/common.js'));

router.route('/')
    .get(common.readDashCard, controller.getPricing);

router.route('/faq')
    .get(common.readDashCard,controller.getFaq);

router.route('/faq/reg/complete')
    .post(controller.postFaqRegComplete);

router.route('/faq/mod/complete')
    .post(controller.postFaqModComplete);

router.route('/faq/delete/complete')
    .post(controller.postFaqDeleteComplete);

router.route('/qna')
    .get(common.readDashCard, controller.getQna);

router.route('/qna/view')
    .get(common.readDashCard,controller.getQnaView);

router.route('/qna/reg')
    .get(common.readDashCard,controller.getQnaReg);

router.route('/qna/reg/complete')
    .post(common.readDashCard, controller.postQnaRegComplete);

router.route('/qna/mod/complete')
    .post(controller.postQnaModComplete);

router.route('/qna/delete/complete')
    .post(controller.postQnaDeleteComplete);

router.route('/qna/ans/reg/complete')
    .post(controller.postQnaAnsRegComplete);

router.route('/qna/ans/mod/complete')
    .post(controller.postQnaAnsModComplete);

router.route('/qna/ans/delete/complete')
    .post(controller.postQnaAnsDeleteComplete);

router.route('/pricing')
    .get(common.readDashCard, controller.getPricing);


module.exports = router;