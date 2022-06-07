const express = require('express');
const router = express.Router();
const path = require('path');

const controller = require('./controller.js');
const check = require(path.join(appRoot, 'routes/common/prevCheck.js'));
const common = require(path.join(appRoot, 'routes/common/common.js'));

router.route('/cart/list')
    .get(common.readDashCard, controller.getCartList);
router.route('/cart/postList')
    .post(controller.postCartList);
router.route('/cors/stat')
    .get(common.readDashCard,controller.getCorsStat);


router.route('/mng/cc/ccList')
    .get(common.readDashCard, controller.getCcList);

router.route('/mng/cc/corsList')
    .get(common.readDashCard,controller.getCorsList);

    
router.route('/cart/cartdetail')
    .get(common.readDashCard,controller.getCartdetail);


module.exports = router;