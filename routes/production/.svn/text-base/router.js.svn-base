const express = require('express');
const router = express.Router();
const path = require('path');

const common = require(path.join(global.appRoot, 'routes/common/common.js'));
const role = require(path.join(global.appRoot, 'routes/layout/role.js'));

router.get('/', (req, res) => { res.redirect('/production/dashboard'); });

// production 사전 체크
router.use(async (req, res, next) => {
    // 임시 세션 설정
    // if (!req.session.userInfo) {
    //     req.session.acnt_seq = 30;
    //     req.session.userInfo = {
    //         acnt_seq: 3,
    //         acnt_id: 'tsman',
    //         acnt_nm: '박TS',
    //         acnt_role: 'MA',
    //         cmpy_seq: 3,
    //     }

    //     res.locals.userInfo = req.session.userInfo;
    // }

	// role 체크
    let result = await role.checkRole(req, res, '/production', 'back');
    if (!result) return ;

    if (req.method == 'GET') {
        // let result = await role.checkRole(req, res, '/production', 'back');

        // if (!result) return ;
    }

    next();
});

router.use('/dashboard', require('./dashboard/router.js'));
router.use('/search', require('./search/router.js'));
router.use('/report', require('./report/router.js'));
router.use('/manage', require('./manage/router.js'));
router.use('/log', require('./log/router.js'));
router.use('/account', require('./account/router.js'));
router.use('/alarm', require('./alarm/router.js'));

module.exports = router;