const express = require('express');
const router = express.Router();
const controller = require('./controller.js');
const path = require('path');
const common = require(path.join(appRoot, 'routes/production/common/common.js'));

router.get('/', (req, res) => { res.redirect('/production/report/day'); });


//��¥�� ����
router.route('/day').get(common.readDashCard,controller.getDaily);
router.route('/day/history').post(controller.postDailyHistory);
router.route('/day/historyForGraph').post(controller.postDailyHistoryForGraph);
//���� ����
router.route('/month').get(common.readDashCard,controller.getMonthly);
router.route('/month/history').post(controller.postMonthlyHistory);
//���͸� ����
router.route('/battery').get(common.readDashCard,controller.getBattery);
//�˻����� ����
router.route('/day/postLocListByCmpy').post(controller.postLocListByCmpy);
router.route('/day/postBtryListByLoc').post(controller.postBtryListByLoc);
router.route('/day/postOperCmpyList').post(controller.postOperCmpyList);
router.route('/battery/postOperCmpyListWithAll').post(controller.postOperCmpyListWithAll);
router.route('/battery/postLocListByCmpyWithAll').post(controller.postLocListByCmpyWithAll);

module.exports = router;