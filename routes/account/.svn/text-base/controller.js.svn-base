// const asyncWrapper = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next());
const path = require("path");
const encryption = require(path.join(global.appRoot,"/modules/encryption.js"));
const form = require(path.join(global.appRoot, '/modules/form.js'));
const utiljs = require(path.join(global.appRoot,"/modules/util.js"));

exports.getLogin = (req, res, next) => {
    res.render("account/login");
}

exports.getLoginForAdmin = (req, res, next) => {
    res.render("account/loginForAdmin");
}

exports.postLogin = async (req, res, next) => {
    // 0. body 정보 가져오기
    let info = {
        role: req.body.loginRole,
        loginID: req.body.loginID,
        loginPW: req.body.loginPW
    };

    // 0. body 값 체크
    if ((info.role == "") || (info.loginID == "") || (info.loginPW == "")) {
        return form.result(res, req.method, 'FAIL', null, '아이디와 비밀번호를 확인해 주세요', null, null);
    }

    let url = '/dashboard/index', data = {};

    let sess, acntRole = '("")';

    // 0. role 셋팅하기
    if (info.role == 'S') acntRole = '("MA", "MC")';
    if (info.role == 'O') acntRole = '("DA", "DC")';
    if (info.role == 'SA') acntRole = '("SA")';
    
    // 1. 아이디 및 권한 일치하는 정보 가져오기
    let selectQuery1 = 'select * from OPENBMS.TBL_ACNT ';
        selectQuery1 += ' WHERE acnt_id = "' + info.loginID + '"';
        selectQuery1 += ' AND acnt_role IN ' + acntRole + '';

    let [rows1] = await global.mysqlPool.query(selectQuery1);
    
    if (rows1.length < 1) {
        return form.result(res, req.method, 'FAIL', null, '해당 정보와 일치하는 계정이 없습니다', null, null);
    } else if(rows1.length > 1) {
        return form.result(res, req.method, 'FAIL', null, '서버 오류 발생 : 중복된 아이디가 존재합니다', null, null);
    }

    if(rows1[0].acnt_stat_cd != 'Y') {
        return form.result(res, req.method, 'FAIL', null, '정지된 사용자입니다', null, null);
    } 

    // 2. 패스워드 확인
    let hashPassword = encryption.password.validate(info.loginPW, rows1[0].acnt_pw_salt);

    let selectQuery2 = "select * from OPENBMS.TBL_ACNT ta";
        selectQuery2 += " LEFT OUTER JOIN OPENBMS.TBL_CMPY tc ON ta.cmpy_seq = tc.cmpy_seq"
        selectQuery2 += " where acnt_role IN " + acntRole + "";
        selectQuery2 += " and acnt_id = '" + info.loginID + "'";
        selectQuery2 += "  and acnt_pw = '" + hashPassword + "'";

    let [mRows] = await global.mysqlPool.query(selectQuery2);

    if (mRows.length <= 0) {
        return form.result(res, req.method, 'FAIL', null, '아이디와 비밀번호가 일치하지 않습니다', null, null);
    } else {
        sess = req.session;
        
        sess.acnt_seq = mRows[0].acnt_seq;              // 사용자 일련번호
        
        data.acnt_seq = mRows[0].acnt_seq;
        data.acnt_id = mRows[0].acnt_id;                // 사용자 아이디
        data.acnt_nm = mRows[0].acnt_nm;                // 사용자이름
        data.acnt_role = mRows[0].acnt_role;            // 사용자역할
        data.cmpy_seq = mRows[0].cmpy_seq;              // 회사 seq
        data.cmpy_biz_type = mRows[0].cmpy_biz_type;    // 사업업종

        sess.userInfo = data;
    }

    //사용자 로그 테이블 로그인
    var currentTime = new Date();
    var currentIp = utiljs.getIPAddress();

    let acntLogData = {
        acnt_seq : mRows[0].acnt_seq,
        cmpy_seq : mRows[0].cmpy_seq,
        acnt_log_type_cd : 'LI',
        acnt_id : mRows[0].acnt_id,
        acnt_nm : mRows[0].acnt_nm,
        login_dttm : currentTime,
        login_ip : currentIp,
        log_content : '로그인',
        ins_nm : mRows[0].acnt_id,
        ins_dttm : currentTime,
        upd_nm : mRows[0].acnt_id,
        upd_dttm : currentTime
    }

    let acntLogSql = "INSERT INTO OPENBMS.TBL_ACNT_LOG ";
        acntLogSql +="SET ? ";

    let [acntLogRow] = await global.mysqlPool.query(acntLogSql,acntLogData);

    if(acntLogRow.affectedRows < 1){
        //return form.result(res, req.method, 'FAIL', null, '사용자 로그 테이블 업데이트 실패!', null, null);
    }

    // 임시로 로그인 권한에 따라서 페이지 분리
    // 수요업체 -> /operation
    // 공급업체 -> /production
    // 관리자 -> /system
    // 골프 -> /golf

    // 임시로 스마트폴 -> /smartpole 추가 (골프를 임시로 변형함) 
    if (sess.userInfo.cmpy_biz_type == '50') {
        url = "/golf";
    } else if(sess.userInfo.cmpy_biz_type == '60'){
        url = "/smartpole";
    } else if (sess.userInfo.acnt_role == 'DA' || sess.userInfo.acnt_role == 'DC') {
        url = "/operation";
    } else if (sess.userInfo.acnt_role == 'MA' || sess.userInfo.acnt_role == 'MC') {    
        url = "/production";
    } else if (sess.userInfo.acnt_role == 'SA') {
        url = "/system";
    }

    return form.result(res, req.method, 'SUCCESS', null, null, data, url);
}

exports.getLogout = async (req, res, next) => {

    //사용자 로그 테이블 로그아웃
    var userInfo = req.session.userInfo;

    if (userInfo) {
        var currentTime = new Date();
        var currentIp = utiljs.getIPAddress();

        let acntLogData = {
            acnt_seq : userInfo.acnt_seq,
            cmpy_seq : userInfo.cmpy_seq,
            acnt_log_type_cd : 'LO',
            acnt_id : userInfo.acnt_id,
            acnt_nm : userInfo.acnt_nm,
            login_dttm : currentTime,
            login_ip : currentIp,
            log_content : '로그아웃',
            ins_nm : userInfo.acnt_id,
            ins_dttm : currentTime,
            upd_nm : userInfo.acnt_id,
            upd_dttm : currentTime
        }

        let acntLogSql = "INSERT INTO OPENBMS.TBL_ACNT_LOG ";
            acntLogSql +="SET ? ";

        let [acntLogRow] = await global.mysqlPool.query(acntLogSql,acntLogData);
    }
    

    req.acnt_seq = undefined;
    req.session.userInfo = undefined;
    res.redirect("/account/login");
}

exports.getPage404 = (req, res, next) => {
    res.render("common/page404");
}