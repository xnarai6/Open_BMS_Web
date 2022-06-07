const express = require('express');
const router = express.Router();

const controller = require('./controller.js');

router.route('/').get(controller.getDashboard);
router.route('/info').post(controller.postInfo);
router.route('/info/cart').post(controller.postInfoCart);

module.exports = router;