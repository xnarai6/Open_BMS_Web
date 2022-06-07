const express = require('express');
const router = express.Router();
const controller = require('./controller.js');

router.get('/', (req, res) => { res.redirect('/search/report'); });


//��¥�� ����
router.route('/day').get(controller.getDaily);
router.route('/day/history').post(controller.postDailyHistory);
router.route('/day/historyForGraph').post(controller.postDailyHistoryForGraph);
//���� ���� (��� ����)
router.route('/month').get(controller.getMonthly);
router.route('/month/history').post(controller.postMonthlyHistory);
//�˻����� ����
router.route('/day/postLocListByCmpy').post(controller.postLocListByCmpy);
router.route('/day/postBtryListByLoc').post(controller.postBtryListByLoc);
router.route('/month/postLocListByCmpy').post(controller.postLocListByCmpy);
router.route('/month/postBtryListByLoc').post(controller.postBtryListByLoc);


module.exports = router;