// const asyncWrapper = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next());
// const form = require('../../config/form.js');
const path = require('path');
const form = require(path.join(global.appRoot, '/modules/form.js'));
const rule = require(path.join(global.appRoot, '/modules/validRule.js'));
const masking = require(path.join(global.appRoot, '/modules/masking.js'));
const encryption = require(path.join(global.appRoot, '/modules/encryption.js'));
const code = require(path.join(global.appRoot, '/routes/layout/code.js'));
const commonManage = require('../common/manageQuery.js');

const viewName = 'production/account/';

exports.getUserProfile = async (req, res, next) => {
    // 1. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 2. 회원번호 가져오기
    let acntSeq = userInfo.acnt_seq;

    res.render(viewName + 'userProfile', { param: acntSeq });
}

exports.postUserProfileInfo = async (req, res, next) => {
    // 1. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 2. 회원번호 / 회사번호 가져오기
    let cmpySeq = userInfo.cmpy_seq, acntSeq = userInfo.acnt_seq;

    // 4. 회원정보 가져오기
    let userProfileInfo = await commonManage.getUserDetail(cmpySeq, acntSeq);
    if (!userProfileInfo) return form.result(res, req.method, 'FAIL', null, '해당되는 데이터가 없습니다', null, '/golf/manage/user');

    // 5. 코드 맵 가져오기
    let codeMap = await code.getCodeMap(['role_m', 'acnt_stat']);

    // 6. 복호화
    userProfileInfo['acnt_email'] = encryption.decryptGCM(userProfileInfo['acnt_email_enc']);
    userProfileInfo['acnt_tel'] = encryption.decryptGCM(userProfileInfo['acnt_tel_enc']);

    // 6. return
    return form.result(res, req.method, 'SUCCESS', null, null, { userProfileInfo: userProfileInfo, codeMap: codeMap }, null);
}

exports.postUserProfileChg = async (req, res, next) => {
    // 1. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 2. 회원 아이디 및 회사번호 가져오기
    let acntSeq = userInfo.acnt_seq, acntId = userInfo.acnt_id, cmpySeq = userInfo.cmpy_seq;

    // 3. 파라미터(body) 가져오기
    let body = {
        id: req.body.id, name: req.body.name,
        email: req.body.email, tel: req.body.tel,
        emailAllow: req.body.emailAllow, telAllow: req.body.telAllow
    }

    // 4. 체크 리스트 생성
    let chkMsgArray = [];
        chkMsgArray.push(rule.chkValidation(rule.TYPE.NAME, body.name));
        chkMsgArray.push(rule.chkValidation(rule.TYPE.EMAIL, body.email));
        chkMsgArray.push(rule.chkValidation(rule.TYPE.TEL, body.tel));
    
    // 5. 체크
    for (msg of chkMsgArray) if (msg) return form.result(res, req.method, 'FAIL', null, msg, null, null);

    // 6. 암호화
    body['emailEnc'] = encryption.encryptGCM(body['email']);
    body['telEnc'] = encryption.encryptGCM(body['tel']);

    // 7. 사용자 수정
    let result = await commonManage.updUser(acntSeq, acntId, cmpySeq, body);
    if (!result) form.result(res, req.method, 'FAIL', null, '사용자 수정 실패', null, null);

    // 8. 세션 업데이트
    userInfo['acnt_nm'] = body.name;
    req.session['userInfo'] = userInfo;

    // 9. 완료
    return form.result(res, req.method, 'SUCCESS', null, '사용자 수정이 완료되었습니다', null, '/golf/dashboard');
}

exports.postUserProfileChgPw = async (req, res, next) => {
    // 1. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 2. 회원 아이디 및 회사번호 가져오기
    let acntSeq = userInfo.acnt_seq, acntId = userInfo.acnt_id, cmpySeq = userInfo.cmpy_seq;

    // 3. 파라미터(body) 가져오기
    let body = {
        prevPw: req.body.prevPw,
        newPw: req.body.newPw
    }

    // 4. 체크 리스트 생성
    let chkMsgArray = [];
        chkMsgArray.push(rule.chkValidation(rule.TYPE.PW, body.newPw));
    
    // 5. 체크
    for (msg of chkMsgArray) if (msg) return form.result(res, req.method, 'FAIL', null, msg, null, null);

    // 6. 이전 비밀번호 체크
    let result1 = await commonManage.getUserPwInfo(acntSeq, acntId, cmpySeq, body);
    if (result1.length <= 0) return form.result(res, req.method, 'FAIL', null, '해당되는 데이터가 없습니다', null, null);

    let hashPassword = encryption.validatePassword(body.prevPw, result1.acnt_pw_salt);
    if (hashPassword != result1.acnt_pw) return form.result(res, req.method, 'FAIL', null, '이전 비밀번호가 일치히지 않습니다', null, null);

    // 7. 해쉬화
    let newPassword = encryption.createPassword(body.newPw);
    body['newPwHash'] = newPassword.hashPassword;
    body['newPwSalt'] = newPassword.salt;

    // 8. 비밀번호 수정
    let result2 = await commonManage.updUserPw(acntSeq, acntId, body);
    if (!result2) return form.result(res, req.method, 'FAIL', null, '비밀번호 수정 실패', null, null);

    // 9. 완료
    return form.result(res, req.method, 'SUCCESS', null, '비밀번호 수정이 완료되었습니다', null, '/golf/dashboard');
}