// const asyncWrapper = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next());
// const form = require('../../config/form.js');
const path = require('path');
const form = require(path.join(global.appRoot, '/modules/form.js'));
const rule = require(path.join(global.appRoot, '/modules/validRule.js'));
const masking = require(path.join(global.appRoot, '/modules/masking.js'));
const encryption = require(path.join(global.appRoot, '/modules/encryption.js'));
const code = require(path.join(global.appRoot, '/routes/layout/code.js'));
const commonManage = require('../common/manage.js');

const viewName = 'golf/manage/';

exports.getUser = async (req, res, next) => {
    res.render(viewName + 'user');
}

exports.postUserList = async (req, res, next) => {
    // 1. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 2. 회사번호 가져오기
    let cmpySeq = userInfo.cmpy_seq;

    // 3. 파라미터 가져오기
    let page = Number(req.body.page);
    if (!Number.isInteger(page)) return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/golf/dashboard');
    if (page <= 0) page = 1;

    // 3. 회사번호에 해당되는 사용자 리스트 가져오기
    let userData = await commonManage.getUserList(cmpySeq, page, 10);
    if (!userData) return form.result(res, req.method, 'FAIL', null, '해당되는 데이터가 없습니다', null, '/golf/dashboard');

    // 4. 코드 맵 가져오기
    let codeMap = await code.getCodeMap(['acnt_stat', 'role']);

    // 5. 사용자 이메일 복호화 및 상태 코드 매핑 
    userData.rows.map(e => {
        e['role'] = code.getCodeResult(codeMap, 'role', e.role_cd);
        e['stat'] = code.getCodeResult(codeMap, 'acnt_stat', e.stat_cd);

        e['email'] = masking.masking(masking.TYPE.EMAIL, encryption.decryptGCM(e.email_enc), 3);
        e['tel'] = masking.masking(masking.TYPE.TEL, encryption.decryptGCM(e.tel_enc), null);
    });

    return form.result(res, req.method, 'SUCCESS', null, '성공', userData, null);
}

exports.getUserDetail = async (req, res, next) => {
    // 1. 파라미터 가져오기
    let seq = Number(req.params.seq);
    if (!Number.isInteger(seq)) return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/golf/manage/user');

    res.render(viewName + 'userDetail', { param: seq });
}

exports.postUserDetailInfo = async (req, res, next) => {
    // 1. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 2. 회사번호 가져오기
    let cmpySeq = userInfo.cmpy_seq;

    // 3. 파라미터 가져오기
    let targetSeq = Number(req.params.seq);
    if (!Number.isInteger(targetSeq)) return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/golf/manage/user');

    // 4. 자기 회사에 속한 직원인지 확인
    let userDetailInfo = await commonManage.getUserDetail(cmpySeq, targetSeq);
    if (!userDetailInfo) return form.result(res, req.method, 'FAIL', null, '해당되는 데이터가 없습니다', null, '/golf/manage/user');

    // 5. 코드 맵 가져오기
    let codeMap = await code.getCodeMap(['role_d', 'acnt_stat']);

    // 6. 복호화
    userDetailInfo['acnt_email'] = encryption.decryptGCM(userDetailInfo['acnt_email_enc']);
    userDetailInfo['acnt_tel'] = encryption.decryptGCM(userDetailInfo['acnt_tel_enc']);

    // 6. return
    return form.result(res, req.method, 'SUCCESS', null, null, { userDetailInfo: userDetailInfo, codeMap: codeMap }, null);
}

exports.postUserDetailChg = async (req, res, next) => {
    // 1. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 2. 회원 아이디 및 회사번호 가져오기
    let acntSeq = userInfo.acnt_seq, acntId = userInfo.acnt_id, cmpySeq = userInfo.cmpy_seq;

    // 3. 파라미터(params) 가져오기
    let targetSeq = Number(req.params.seq);
    if (!Number.isInteger(targetSeq)) return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/golf/manage/user');

    // 4. 파라미터(body) 가져오기
    let body = {
        id: req.body.id, name: req.body.name,
        email: req.body.email, tel: req.body.tel,
        emailAllow: req.body.emailAllow, telAllow: req.body.telAllow, 
        role: req.body.role, stat: req.body.stat
    }

    // 5. 체크 리스트 생성
    let chkMsgArray = [];
        chkMsgArray.push(rule.chkValidation(rule.TYPE.NAME, body.name));
        chkMsgArray.push(rule.chkValidation(rule.TYPE.EMAIL, body.email));
        chkMsgArray.push(rule.chkValidation(rule.TYPE.TEL, body.tel));
    
    // 6. 체크
    for (msg of chkMsgArray) if (msg) return form.result(res, req.method, 'FAIL', null, msg, null, null);

    // 7. 암호화
    body['emailEnc'] = encryption.encryptGCM(body['email']);
    body['telEnc'] = encryption.encryptGCM(body['tel']);

    // 8. 사용자 수정
    let result = await commonManage.updUser(targetSeq, acntId, cmpySeq, body);
    if (!result) form.result(res, req.method, 'FAIL', null, '사용자 수정 실패', null, null);

    // 9. 세션 업데이트
    if (acntSeq == targetSeq) {
        userInfo['acnt_nm'] = body.name;
        userInfo['acnt_role'] = body.role;

        req.session['userInfo'] = userInfo;
    }

    // 10. 완료
    return form.result(res, req.method, 'SUCCESS', null, '사용자 수정이 완료되었습니다', null, '/golf/manage/user');
}

exports.getUserReg = async (req, res, next) => {
    res.render(viewName + 'userReg');
}

exports.postUserRegCode = async (req, res, next) => {
    // 1. 코드 맵 가져오기
    let codeMap = await code.getCodeMap(['role_d']);

    // 2. return
    return form.result(res, req.method, 'SUCCESS', null, null, { codeMap: codeMap }, null);
}

exports.postUserRegDup = async (req, res, next) => {
    // 1. 파라미터 가져오기 + 체크
    let id = req.body.id, chkMsg = rule.chkValidation(rule.TYPE.ID, id);
    if (chkMsg) return form.result(res, req.method, 'FAIL', null, chkMsg, null, null);

    // 2. 중복여부 체크
    let userIdCount = await commonManage.getUserIdCount(id);

    // 3. 중복인 경우
    if (userIdCount.cnt > 0) return form.result(res, req.method, 'FAIL', null, '동일한 아이디가 존재합니다', null, null);

    // 4. 중복이 아닌 경우
    return form.result(res, req.method, 'SUCCESS', null, '사용가능한 아이디입니다', null, null);
}

exports.postUserRegChk = async (req, res, next) => {
    // 1. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 2. 회원 아이디 및 회사번호 가져오기
    let acntId = userInfo.acnt_id, cmpySeq = userInfo.cmpy_seq;

    // 3. 파라미터 가져오기
    let body = {
        id: req.body.id, name: req.body.name, pw: req.body.pw,
        email: req.body.email, tel: req.body.tel, emailAllow: req.body.emailAllow, telAllow: req.body.telAllow, 
        role: req.body.role
    }

    // 4. 체크 리스트 생성
    let chkMsgArray = [];
        chkMsgArray.push(rule.chkValidation(rule.TYPE.ID, body.id));
        chkMsgArray.push(rule.chkValidation(rule.TYPE.NAME, body.name));
        chkMsgArray.push(rule.chkValidation(rule.TYPE.PW, body.pw));
        chkMsgArray.push(rule.chkValidation(rule.TYPE.EMAIL, body.email));
        chkMsgArray.push(rule.chkValidation(rule.TYPE.TEL, body.tel));
    
    // 5. 체크 발생
    for (msg of chkMsgArray) if (msg) return form.result(res, req.method, 'FAIL', null, msg, null, null);

    // 6. 중복여부 체크
    let userIdCount = await commonManage.getUserIdCount(body.id);

    // 7. 중복인 경우
    if (userIdCount.cnt > 0) return form.result(res, req.method, 'FAIL', null, '동일한 아이디가 존재합니다', null, null);

    // 8. 비밀번호 암호화
    let newPw = encryption.createPassword(body['pw']);
    body['pwHsah'] = newPw.hashPassword;
    body['pwSalt'] = newPw.salt;

    // 9. 개인정보 암호화
    body['emailEnc'] = encryption.encryptGCM(body['email']);
    body['telEnc'] = encryption.encryptGCM(body['tel']);

    // 10. 사용자 생성
    let result = await commonManage.insUser(acntId, cmpySeq, body, 'golf');
    if (!result) form.result(res, req.method, 'FAIL', null, '사용자 생성 실패', null, null);

    // 11. 완료
    return form.result(res, req.method, 'SUCCESS', null, '사용자 등록이 완료되었습니다', null, '/golf/manage/user');
}

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
    let codeMap = await code.getCodeMap(['role_d', 'acnt_stat']);

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