// const asyncWrapper = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next());
// const form = require('../../config/form.js');
const path = require('path');
const form = require(path.join(global.appRoot, '/modules/form.js'));
const rule = require(path.join(global.appRoot, '/modules/validRule.js'));
const masking = require(path.join(global.appRoot, '/modules/masking.js'));
const encryption = require(path.join(global.appRoot, '/modules/encryption.js'));
const code = require(path.join(global.appRoot, '/routes/layout/code.js'));
const common = require('../common/common.js');
const query = require('../common/manageQuery.js');
const commonManage = require('../common/manageQuery.js');

const viewName = 'production/manage/';

exports.getCompany = async (req, res, next) => {
    res.render(viewName + 'company');
}

exports.postCompanyList = async (req, res, next) => {
    // 1. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 2. 회사번호 가져오기
    let myCmpySeq = userInfo.cmpy_seq;
    let cmpySeq = '-1';

    let cmpySeqList = await commonManage.getDmdrByMftr(myCmpySeq);
    
    cmpySeq = cmpySeqList[0].cmpy_seq;

    // 3. 파라미터 가져오기
    let page = Number(req.body.page);
    if (!Number.isInteger(page)) return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/production/dashboard');
    if (page <= 0) page = 1;

    // 3. 회사번호에 해당되는 사용자 리스트 가져오기
    let cmpyData = await query.getCompanyList(cmpySeq, page, 10);
    if (!cmpyData) return form.result(res, req.method, 'FAIL', null, '해당되는 데이터가 없습니다', null, '/production/dashboard');

    // 4. 코드 맵 가져오기
    let codeMap = await code.getCodeMap(['cmpy_ty', 'cmpy_biz_type','cmpy_approval_stat']);

    try {
        // 5. 사용자 이메일 복호화 및 상태 코드 매핑 
        cmpyData.rows.map(e => {
            e['cmpy_ty'] = code.getCodeResult(codeMap, 'cmpy_ty', e.cmpy_ty_cd);
            e['cmpy_biz_type'] = code.getCodeResult(codeMap, 'cmpy_biz_type', e.cmpy_biz_type);
            e['cmpy_approval_stat'] = code.getCodeResult(codeMap, 'cmpy_approval_stat', e.cmpy_approval_stat_cd);

            if(e.cmpy_chrg_mail == null || e.cmpy_chrg_mail == ''){
                e['cmpy_chrg_mail'] = '';
            }else{
                e['cmpy_chrg_mail'] = masking.masking(masking.TYPE.EMAIL, encryption.decryptGCM(e.cmpy_chrg_mail), 3);
            }
            if(e.cmpy_chrg_tel == null || e.cmpy_chrg_tel == ''){
                e['cmpy_chrg_tel'] = '';
            }else{
                e['cmpy_chrg_tel'] = masking.masking(masking.TYPE.EMAIL, encryption.decryptGCM(e.cmpy_chrg_tel), null);
            }
        });   
    } catch (error) {
        console.log(error);
        return form.result(res, req.method, 'FAIL', null, '잘못된 데이터', null, '/production/dashboard');
    }

    return form.result(res, req.method, 'SUCCESS', null, '성공', cmpyData, null);
}

exports.getCompanyDetail = async (req, res, next) => {
    // 1. 파라미터 가져오기
    let targetCompanySeq = Number(req.params.seq);
    if (!Number.isInteger(targetCompanySeq)) return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/production/manage/company');

    res.render(viewName + 'companyDetail', {
        param: targetCompanySeq
    });
}

exports.postCompanyDetailInfo = async (req, res, next) => {
    // 1. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 2. 회사번호 가져오기
    let cmpySeq = userInfo.cmpy_seq;

    // 3. 파라미터 가져오기
    let targetCompanySeq = Number(req.params.seq);
    if (!Number.isInteger(targetCompanySeq)) return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/production/manage/company');

    // 4. 회사 정보 가져오기
    let companyDetailInfo = await query.getCompanyDetail(targetCompanySeq);
    if (!companyDetailInfo) return form.result(res, req.method, 'FAIL', null, '해당되는 데이터가 없습니다', null, '/production/manage/company');

    // 4. 회사에 속한 회원 목록
    let companyAcntList = await query.getCompanyAcntList(targetCompanySeq);
    if (!companyAcntList) return form.result(res, req.method, 'FAIL', null, '해당되는 데이터가 없습니다', null, '/production/manage/company');

    // 4. 회사에 속한 배터리 목록
    let companyBtryList = await query.getCompanyBtryList(targetCompanySeq);
    if (!companyBtryList) return form.result(res, req.method, 'FAIL', null, '해당되는 데이터가 없습니다', null, '/production/manage/company');

    // 4. 회사에 속한 설치장소 목록
    let companyLocList = await query.getCompanyLocList(targetCompanySeq);
    if (!companyLocList) return form.result(res, req.method, 'FAIL', null, '해당되는 데이터가 없습니다', null, '/production/manage/company');

    // 5. 코드 맵 가져오기
    let codeMap = await code.getCodeMap(['cmpy_biz_type', 'cmpy_ty', 'cmpy_div']);

    // 6. code 매핑 및 복호화
    companyDetailInfo['cmpy_biz_type'] = code.getCodeResult(codeMap, 'cmpy_biz_type', companyDetailInfo['cmpy_biz_type']);
    companyDetailInfo['cmpy_ty'] = code.getCodeResult(codeMap, 'cmpy_ty', companyDetailInfo['cmpy_ty_cd']);
    companyDetailInfo['cmpy_div'] = code.getCodeResult(codeMap, 'cmpy_div', companyDetailInfo['cmpy_div_cd']);
    companyDetailInfo['cmpy_chrg_mail'] = encryption.decryptGCM(companyDetailInfo['cmpy_chrg_mail']);
    companyDetailInfo['cmpy_chrg_tel'] = encryption.decryptGCM(companyDetailInfo['cmpy_chrg_tel']);

    // 6. return
    return form.result(res, req.method, 'SUCCESS', null, null, { companyDetailInfo: companyDetailInfo, acntList : companyAcntList, btryList : companyBtryList, locList : companyLocList }, null);
}

exports.postCompanyDetailChg = async (req, res, next) => {
    // 1. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 2. 회원 아이디 및 회사번호 가져오기
    let acntId = userInfo.acnt_id;

    // 3. 파라미터(params) 가져오기
    let targetSeq = Number(req.params.seq);
    if (!Number.isInteger(targetSeq)) return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/production/manage/company');

    // 4. 파라미터(body) 가져오기
    let body = {
        cmpy_biz_num: req.body.cmpy_biz_num, 
        cmpy_addr1: req.body.cmpy_addr1, 
        cmpy_addr2: req.body.cmpy_addr2, 
        cmpy_chrg_nm: req.body.cmpy_chrg_nm, 
        cmpy_chrg_mail: req.body.cmpy_chrg_mail, 
        cmpy_chrg_tel: req.body.cmpy_chrg_tel
    }

    // 5. 체크 리스트 생성
    let chkMsgArray = [];
        chkMsgArray.push(rule.chkValidation(rule.TYPE.NAME, body.cmpy_chrg_nm));
        chkMsgArray.push(rule.chkValidation(rule.TYPE.EMAIL, body.cmpy_chrg_mail));
        chkMsgArray.push(rule.chkValidation(rule.TYPE.TEL, body.cmpy_chrg_tel));
    
    // 6. 체크
    for (msg of chkMsgArray) if (msg) return form.result(res, req.method, 'FAIL', null, msg, null, null);

    // 7. 암호화
    body['cmpy_chrg_mail'] = encryption.encryptGCM(body['cmpy_chrg_mail']);
    body['cmpy_chrg_tel'] = encryption.encryptGCM(body['cmpy_chrg_tel']);

    // 8. 사용자 수정
    let result = await commonManage.updCompany(targetSeq, acntId, body);
    if (!result) form.result(res, req.method, 'FAIL', null, '수요업체 수정 실패', null, null);

    // 9. 완료
    return form.result(res, req.method, 'SUCCESS', null, '수요업체 수정이 완료되었습니다', null, '/production/manage/company');
}

exports.getCompanyReg = async (req, res, next) => {
    res.render(viewName + 'companyReg');
}

exports.postCompanyRegDup = async (req, res, next) => {
    // 1. 파라미터 가져오기 + 체크
    let cmpy_nm = req.body.cmpy_nm, chkMsg = rule.chkValidation(rule.TYPE.NAME, cmpy_nm);
    if (chkMsg) return form.result(res, req.method, 'FAIL', null, chkMsg, null, null);

    // 2. 중복여부 체크
    let cmpyNmCount = await commonManage.getCmpyNmCount(cmpy_nm);

    // 3. 중복인 경우
    if (cmpyNmCount.cnt > 0) return form.result(res, req.method, 'FAIL', null, '동일한 회사명이 존재합니다', null, null);

    // 4. 중복이 아닌 경우
    return form.result(res, req.method, 'SUCCESS', null, '사용가능한 회사명입니다', null, null);
}

exports.postCompanyRegChk = async (req, res, next) => {
    // 1. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 2. 회원 아이디 및 회사번호 가져오기
    let acntId = userInfo.acnt_id, cmpySeq = userInfo.cmpy_seq;

    // 3. 파라미터 가져오기
    let body = {
        cmpy_nm: req.body.cmpy_nm, 
        cmpy_biz_type: req.body.cmpy_biz_type,
        cmpy_biz_num: req.body.cmpy_biz_num,
        cmpy_addr1: req.body.cmpy_addr1,
        cmpy_addr2: req.body.cmpy_addr2,
        cmpy_chrg_nm: req.body.cmpy_chrg_nm,
        cmpy_chrg_mail: req.body.cmpy_chrg_mail,
        cmpy_chrg_tel: req.body.cmpy_chrg_tel
    }

    // 4. 체크 리스트 생성
    let chkMsgArray = [];
        chkMsgArray.push(rule.chkValidation(rule.TYPE.NAME, body.cmpy_chrg_nm));
        chkMsgArray.push(rule.chkValidation(rule.TYPE.EMAIL, body.cmpy_chrg_mail));
        chkMsgArray.push(rule.chkValidation(rule.TYPE.TEL, body.cmpy_chrg_tel));
    
    // 5. 체크 발생
    for (msg of chkMsgArray) if (msg) return form.result(res, req.method, 'FAIL', null, msg, null, null);

    // 6. 개인정보 암호화
    body['cmpy_chrg_mail'] = encryption.encryptGCM(body['cmpy_chrg_mail']);
    body['cmpy_chrg_tel'] = encryption.encryptGCM(body['cmpy_chrg_tel']);

    // 7. 사용자 생성
    let result = await commonManage.insCompany(acntId, cmpySeq, body);
    if (!result) form.result(res, req.method, 'FAIL', null, '회사 등록 신청 실패', null, null);

    // 8. 완료
    return form.result(res, req.method, 'SUCCESS', null, '회사 등록 신청이 완료되었습니다', null, '/production/manage/company');
}

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
    if (!Number.isInteger(page)) return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/production/dashboard');
    if (page <= 0) page = 1;

    // 3. 회사번호에 해당되는 사용자 리스트 가져오기
    let userData = await commonManage.getUserList(cmpySeq, page, 10);
    if (!userData) return form.result(res, req.method, 'FAIL', null, '해당되는 데이터가 없습니다', null, '/production/dashboard');

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
    if (!Number.isInteger(seq)) return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/production/manage/user');

    res.render(viewName + 'userDetail', { param: seq });
}

exports.postUserDetailInfo = async (req, res, next) => {
    // 1. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 2. 회사번호 가져오기
    let cmpySeq = userInfo.cmpy_seq;

    // 3. 파라미터 가져오기
    let targetSeq = Number(req.params.seq);
    if (!Number.isInteger(targetSeq)) return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/production/manage/user');

    // 4. 자기 회사에 속한 직원인지 확인
    let userDetailInfo = await commonManage.getUserDetail(cmpySeq, targetSeq);
    if (!userDetailInfo) return form.result(res, req.method, 'FAIL', null, '해당되는 데이터가 없습니다', null, '/production/manage/user');

    // 5. 코드 맵 가져오기
    let codeMap = await code.getCodeMap(['role_m', 'acnt_stat']);

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
    if (!Number.isInteger(targetSeq)) return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/production/manage/user');

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
    return form.result(res, req.method, 'SUCCESS', null, '사용자 수정이 완료되었습니다', null, '/production/manage/user');
}

exports.getUserReg = async (req, res, next) => {
    res.render(viewName + 'userReg');
}

exports.postUserRegCode = async (req, res, next) => {
    // 1. 코드 맵 가져오기
    let codeMap = await code.getCodeMap(['role_m']);

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
    let result = await commonManage.insUser(acntId, cmpySeq, body, 'production');
    if (!result) form.result(res, req.method, 'FAIL', null, '사용자 생성 실패', null, null);

    // 11. 완료
    return form.result(res, req.method, 'SUCCESS', null, '사용자 등록이 완료되었습니다', null, '/production/manage/user');
}

exports.getBattery = async (req, res, next) => {
    res.render(viewName + 'battery');
}

exports.postBatteryList = async (req, res, next) => {
    // 1. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 2. 회사번호 가져오기
    let cmpySeq = userInfo.cmpy_seq;

    // 3. 파라미터 가져오기
    let page = Number(req.body.page);
    if (!Number.isInteger(page)) return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/production/dashboard');
    if (page <= 0) page = 1;

    // 3. 회사번호에 해당되는 배터리 리스트 가져오기
    let userData = await commonManage.getBatteryList(cmpySeq, page, 10);
    if (!userData) return form.result(res, req.method, 'FAIL', null, '해당되는 데이터가 없습니다', null, '/production/dashboard');

    

    return form.result(res, req.method, 'SUCCESS', null, '성공', userData, null);
}

exports.getBatteryDetail = async (req, res, next) => {
    // 1. 파라미터 가져오기
    let seq = Number(req.params.seq);
    if (!Number.isInteger(seq)) return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/production/manage/battery');

    res.render(viewName + 'batteryDetail', { param: seq });
}

exports.postBatteryDetailInfo = async (req, res, next) => {
    // 1. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 2. 회사번호 가져오기
    let cmpySeq = userInfo.cmpy_seq;

    // 3. 파라미터 가져오기
    let targetSeq = Number(req.params.seq);
    if (!Number.isInteger(targetSeq)) return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/production/manage/battery');

    // 4. 자기 회사에 속한 직원인지 확인
    let batteryDetailInfo = await commonManage.getBatteryDetail(cmpySeq, targetSeq);
    if (!batteryDetailInfo) return form.result(res, req.method, 'FAIL', null, '해당되는 데이터가 없습니다', null, '/production/manage/battery');

    // 5. return
    return form.result(res, req.method, 'SUCCESS', null, null, { batteryDetailInfo: batteryDetailInfo }, null);
}

exports.getBatteryReg = async (req, res, next) => {
    res.render(viewName + 'batteryReg');
}

exports.postBatteryRegDup = async (req, res, next) => {
    // 1. 파라미터 가져오기 + 체크
    let btry_nm = req.body.btry_nm, chkMsg = rule.chkValidation(rule.TYPE.NAME, btry_nm);
    if (chkMsg) return form.result(res, req.method, 'FAIL', null, chkMsg, null, null);

    // 2. 중복여부 체크
    let batteryNameCount = await commonManage.getBatteryNameCount(btry_nm);

    // 3. 중복인 경우
    if (batteryNameCount.cnt > 0) return form.result(res, req.method, 'FAIL', null, '동일한 배터리 이름이 존재합니다', null, null);

    // 4. 중복이 아닌 경우
    return form.result(res, req.method, 'SUCCESS', null, '사용가능한 배터리 이름입니다', null, null);
}

//배터리 등록
exports.postBatteryRegChk = async (req, res, next) => {
    // 1. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 2. 회원 아이디 및 회사번호 가져오기
    let acntId = userInfo.acnt_id, cmpySeq = userInfo.cmpy_seq;

    // 3. 파라미터 가져오기
    let body = {
        btry_nm: req.body.btry_nm, 
        btry_mfctor_nm: req.body.btry_mfctor_nm,
        btry_min_volt: req.body.btry_min_volt,
        btry_max_volt: req.body.btry_max_volt,
        btry_rat_volt: req.body.btry_rat_volt,
        btry_min_curr: req.body.btry_min_curr,
        btry_max_curr: req.body.btry_max_curr,
        btry_max_curr: req.body.btry_max_curr,
        btry_min_tp: req.body.btry_min_tp,
        btry_max_tp: req.body.btry_max_tp,
        btry_max_pwr: req.body.btry_max_pwr,
        mdl_seq: req.body.mdl_seq,
        btry_mdl_ty_cd: req.body.btry_mdl_ty_cd,
        btry_mng_stat: req.body.btry_mng_stat,
        dmdr_cmpy_nm: req.body.dmdr_cmpy_nm,
        dmdr_loc_seq: req.body.dmdr_loc_seq
    }

    // 4. 체크 리스트 생성
    let chkMsgArray = [];
        chkMsgArray.push(rule.chkValidation(rule.TYPE.NAME, body.btry_nm));
    
    // 5. 체크 발생
    for (msg of chkMsgArray) if (msg) return form.result(res, req.method, 'FAIL', null, msg, null, null);

    // 6. 배터리 생성
    let result = await commonManage.insBattery(acntId, cmpySeq, body);
    if (!result) form.result(res, req.method, 'FAIL', null, '배터리 등록 실패', null, null);

    // 8. 완료
    return form.result(res, req.method, 'SUCCESS', null, '배터리 등록이 완료되었습니다', null, '/production/manage/battery');
}

//배터리 등록, 수정에서 사용되는 코드리스트
exports.postBatteryCodeList = async (req, res, next) => {

    try {
        // 제조업체 목록 가져오기
        let mftrCmpyMap = await commonManage.getMftrCmpyList();
        // 모듈 모델 목록 가져오기
        let mdlMap = await commonManage.getMdlList();
        // 배터리 관리 상태 목록 가져오기
        let codeMap = await code.getCodeMap(['btry_mng_stat']);

        // 2. return
        return form.result(res, req.method, 'SUCCESS', null, null, { mftrCmpyMap: mftrCmpyMap, mdlMap: mdlMap, codeMap: codeMap }, null);

    } catch (error) {
        console.log(error);
        return form.result(res, req.method, 'FAIL', null, '서버 오류 발생', null, null);
    }
}

//모듈이 제조된 회사 이름 조회
exports.postMdlMftrByMdlSeq = async(req, res, next) => {

    try {
        let mdl_seq = req.body.mdl_seq;

        if(mdl_seq == null || mdl_seq == '') return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터 입니다', null, null);

        let mdlInfo = await commonManage.getMdlMftrByMdlSeq(mdl_seq);
    
        return form.result(res, req.method, 'SUCCESS', null, null, { mdlInfo : mdlInfo }, null);

    } catch (error) {
        console.log(error);
        return form.result(res, req.method, 'FAIL', null, '서버 오류 발생', null, null);
    }

}

//설치 회사 조회
exports.postSearchDmdrCmpy = async(req, res, next) => {

    try {

        let cmpy_nm = req.body.cmpy_nm, page = req.body.page, size = req.body.size;

        // 1. 세션정보 가져오기
        let userInfo = req.session.userInfo;

        // 2. 회사번호 가져오기
        let cmpy_seq = userInfo.cmpy_seq;

        if(page == null || page == '') page = 1;
        if(size == null || size == '') size = 5;

        if(cmpy_nm == null)return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터 입니다', null, null);

        let result = await commonManage.getSearchDmdrCmpy(cmpy_seq, cmpy_nm, page, size);

        return form.result(res, req.method, 'SUCCESS', null, null, { dmdrCmpyList : result.dmdrCmpyList, paging : result.paging, size : result.size }, null);

    } catch (error) {
        console.log(error);
        return form.result(res, req.method, 'FAIL', null, '서버 오류 발생', null, null);
    }

}

//설치 회사에서 검색된 회사명으로 설치 장소 조회
exports.postSearchLocByDmdrCmpy = async(req, res, next) => {

    try {

        let cmpy_seq = req.body.cmpy_seq;

        if(cmpy_seq == null || cmpy_seq == '') return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터 입니다', null, null);

        let dmdrLocMap = await commonManage.getSearchLocByDmdrCmpy(cmpy_seq);

        return form.result(res, req.method, 'SUCCESS', null, null, { dmdrLocMap : dmdrLocMap }, null);

    } catch (error) {
        console.log(error);
        return form.result(res, req.method, 'FAIL', null, '서버 오류 발생', null, null);
    }

}

//설치 회사 검색 팝업창
exports.getOpenSearchDmdrCmpy = async(req, res, next) => {
    res.render('production/common/searchDmdrCmpyPopup');
}
