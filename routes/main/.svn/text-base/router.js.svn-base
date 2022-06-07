const express = require('express');
const router = express.Router();
const path = require('path');

const check = require(path.join(appRoot, 'routes/common/prevCheck.js'));

router.route('/').get((req, res, next) => {
    res.redirect('/dashboard')
});

module.exports = router;