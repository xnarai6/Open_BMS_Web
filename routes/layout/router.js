const express = require('express');
const router = express.Router();

const controller = require('./controller.js');

//주소 API 팝업창 호출
router.route('/jusoPopup').get(controller.getJusoPopup);

module.exports = router;