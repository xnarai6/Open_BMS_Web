const path = require('path');
const form = require(path.join(global.appRoot, "/modules/form.js"));

exports.checkUserSessionNo = (req, res, next) => {

    let session = req.session;
    if(!session || !session["userInfo"]) res.send(form.result2(req.method, "/", "FAIL", "로그인 정보가 없습니다"));
    else next();
}

exports.checkUserSessionYes = (req, res, next) => {

    let session = req.session;
    if(session && session["userInfo"]) res.send(form.result2(req.method, "/home", "SUCCESS", "이미 로그인되었습니다2"));
    else next();
}