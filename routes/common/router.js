const express = require('express');
const router = express.Router();
const path = require('path');

const controller = require('./controller.js');
const check = require(path.join(appRoot, 'routes/common/prevCheck.js'));

router.route('/dash')
    .get(controller.getDash);

    /****
     * Ajax - 모든 회사 리스트 조회
     */

router.route('/getAllCompanylist')
    .get(controller.getAllCompanylist);

     /****
     * Ajax - id 별 위치 리스트 조회getAllLocationlist
     */

router.route('/postIDtoLocationlist')
    .post(controller.postIDtoLocationlist);

    /****
     * Ajax - 모든 위치 리스트 조회
     */
router.route('/getAllLocationlist')
    .get(controller.getAllLocationlist);

    /****
     * Ajax - id 별  배터리 리스트 조회
     */
router.route('/getIDtoBtrylist')
    .get(controller.getIDtoBtrylist);


    /****
     * Ajax - 특정위치의 배터리 리스트 조회
     */
router.route('/postLOCtoBtrylist')
     .post(controller.postLOCtoBtrylist);

    /****
     * Ajax - 모든  배터리 리스트 조회
     */
router.route('/getAllBtrylist')
    .get(controller.getAllBtrylist);

module.exports = router;