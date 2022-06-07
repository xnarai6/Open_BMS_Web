const express = require('express');
const router = express.Router();
const path = require('path');

const check = require(path.join(appRoot, 'routes/common/prevCheck.js'));

// operation 사전 체크
router.use((req, res, next) => {
    // check auth
    next();
});

// redirect to dashboard
router.get('/', (req, res) => { res.redirect('/system/dashboard'); });
router.use('/dashboard', require('./dashboard/router.js'));
router.use('/analytics', require('./analytics/router.js'));
router.use('/asset', require('./asset/router.js'));
router.use('/bbs', require('./bbs/router.js'));
router.use('/ccms', require('./ccms/router.js'));
router.use('/location', require('./location/router.js'));
router.use('/log', require('./log/router.js'));
router.use('/report', require('./report/router.js'));
router.use('/setting', require('./setting/router.js'));

module.exports = router;