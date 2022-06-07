const express = require('express');
const router = express.Router();
const path = require('path');
const form = require(path.join(global.appRoot, '/modules/form.js'));

const controller = require('./controller.js');

router.route('/login').post(controller.postLogin);

router.route('/logout').get(controller.getLogout);

router.route('/getPage404').get(controller.getPage404);

router.use(async (req, res, next) => {
    if (req.session.userInfo
        && req.session.userInfo.acnt_role
        && req.session.userInfo.cmpy_biz_type) {
        let role = req.session.userInfo.acnt_role;
        let biz = req.session.userInfo.cmpy_biz_type;

        if (biz == '50') res.redirect('/golf/dashboard');
        //스마트폴 임시 추가
        if (biz == '60') res.redirect('/smartpole/dashboard');
        else if (biz != '50' && (role == 'DA' || role == 'DC')) res.redirect('/operation/dashboard');
        else if (biz != '50' && (role == 'MA' || role == 'MC')) res.redirect('/production/dashboard');
        else if (biz != '50' && role == 'SA') res.redirect('/system');

        return ;
    }
    
    next();
});

router.route('/login').get(controller.getLogin);
router.route('/loginForAdmin').get(controller.getLoginForAdmin);
    
module.exports = router;