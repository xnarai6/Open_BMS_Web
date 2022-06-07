const express = require('express');
const router = express.Router();
const path = require('path');

const role = require(path.join(global.appRoot, 'routes/layout/role.js'));
const topcart = require(path.join(global.appRoot, 'routes/smartpole/common/topcart.js'));

router.get('/', (req, res) => { res.redirect('/smartpole/dashboard'); });

// smartpole 사전 작업
router.use(async (req, res, next) => {
    // 임시 세션 설정
    // if (!req.session.userInfo) {
    //     req.session.acnt_seq = 30;
    //     req.session.userInfo = {
    //         acnt_seq: 30,
    //         acnt_id: 'dreampark',
    //         acnt_nm: '드림파크골프장관리자',
    //         acnt_role: 'DA',
    //         cmpy_seq: 6,
    //         cmpy_biz_type: '50'
    //     }

    //     res.locals.userInfo = req.session.userInfo;
    // }
    
    // role 체크
    let result = await role.checkRole(req, res, '/smartpole', 'back');
    if (!result) return ;

    // 탑 카트 카드 데이터 설정
    if (req.method == 'GET') {
        let topCartCount = await topcart.getTopCartInfo(req.session.userInfo.cmpy_seq);
        req.session.userInfo['topCartInfo'] = topCartCount;
    }

    next();
});

router.use('/dashboard', require('./dashboard/router.js'));
router.use('/search', require('./search/router.js'));
router.use('/report', require('./report/router.js'));
router.use('/alarm', require('./alarm/router.js'));
router.use('/manage', require('./manage/router.js'));
router.use('/account', require('./account/router.js'));

module.exports = router;