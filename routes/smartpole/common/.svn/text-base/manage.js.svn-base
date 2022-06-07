const path = require('path');
const Pagination = require(path.join(global.appRoot, '/modules/pagination.js'));

// 사용자 리스트 가져오기
exports.getUserList = async (cmpySeq, page, size) => {
    // 1. 전체 개수 가져오기
    let query1 = 'SELECT COUNT(*) AS cnt';
        query1 += ' FROM OPENBMS.MPP_ACNT_CMPY mac';
        query1 += ' WHERE mac.cmpy_seq = "' + cmpySeq + '"';

    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query select error]', message: ' user count query error'});
        console.log(error);

        return rows1;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query result error]', message: ' user count empty'});

        return rows1;
    }
    rows1 = queryResult1[0];

    // 2. 페이징 생성
    let paging = new Pagination(rows1[0].cnt, page, size);
        paging.getPages(size);

    // 3. 페이지에 해당되는만큼 select
    let query2 = 'SELECT';
        query2 += ' ta.acnt_seq AS seq, ta.acnt_id AS id, ta.acnt_nm AS nm, ta.acnt_role AS role_cd,';
        query2 += ' ta.acnt_email AS email_enc, ta.acnt_tel AS tel_enc, ta.acnt_stat_cd AS stat_cd';
        query2 += ' FROM (';
        query2 += '     SELECT mac.acnt_seq';
        query2 += '     FROM OPENBMS.MPP_ACNT_CMPY mac';
        query2 += '     WHERE mac.cmpy_seq = "' + cmpySeq + '"';
        query2 += ' ) a';
        query2 += ' LEFT OUTER JOIN OPENBMS.TBL_ACNT ta';
        query2 += ' ON a.acnt_seq = ta.acnt_seq';
        query2 += ' ORDER BY ta.acnt_role ASC, ta.acnt_seq DESC';
        query2 += ' LIMIT ' + paging.limit;

    let queryResult2, rows2 = [];
    try {
        queryResult2 = await global.mysqlPool.query(query2);
    } catch (error) {
        console.log({code: '[query select error]', message: ' user list query error'});
        console.log(error);

        return rows2;
    }
    if (queryResult2 == null || queryResult2[0].length == 0) {
        console.log({code: '[query result error]', message: ' user list empty'});

        return rows2;
    }
    rows2 = queryResult2[0];

    return { paging: paging, rows: rows2 };
}

// 사용자 상세 가져오기
exports.getUserDetail = async (cmpySeq, targetAcntSeq) => {
    // 1. 사용자 가져오기
    let query1 = 'SELECT';
        query1 += '     ta.acnt_id, ta.acnt_nm,';
        query1 += '     ta.acnt_email AS acnt_email_enc, ta.acnt_email_allow,';
        query1 += '     ta.acnt_tel AS acnt_tel_enc, ta.acnt_tel_allow,';
        query1 += '     ta.acnt_stat_cd, ta.acnt_role AS acnt_role_cd, ta.acnt_delete_yn';
        query1 += ' FROM (';
        query1 += '     SELECT mac.acnt_seq';
        query1 += '     FROM OPENBMS.MPP_ACNT_CMPY mac';
        query1 += '     WHERE mac.cmpy_seq = "' + cmpySeq + '"';
        query1 += '     AND mac.acnt_seq = "' + targetAcntSeq + '"';
        query1 += ' ) a';
        query1 += ' LEFT OUTER JOIN OPENBMS.TBL_ACNT ta';
        query1 += ' ON a.acnt_seq = ta.acnt_seq';

    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query select error]', message: ' user select query error'});
        console.log(error);

        return rows1;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query select error]', message: ' user select empty'});

        return rows1;
    }
    rows1 = queryResult1[0];

    return rows1[0];
}

// 사용자 수정
exports.updUser = async (acntSeq, acntId, cmpySeq, info) => {
    // 1. 사용자 변경
    let query1 = 'UPDATE OPENBMS.TBL_ACNT';
        query1 += ' SET acnt_nm = "' + info.name + '",';
        query1 += '     acnt_email = "' + info.emailEnc + '",';
        query1 += '     acnt_tel = "' + info.telEnc + '",';
        query1 += '     acnt_email_allow = "' + info.emailAllow + '",';
        query1 += '     acnt_tel_allow = "' + info.telAllow + '",';
        if (info.role) query1 += '     acnt_role = "' + info.role + '",';
        if (info.stat) query1 += '     acnt_stat_cd = "' + info.stat + '",';
        query1 += '     upd_nm = "' + acntId + '",';
        query1 += '     upd_dttm = SYSDATE()';
        query1 += ' WHERE acnt_seq = "' + acntSeq + '"';
        query1 += ' AND cmpy_seq = "' + cmpySeq + '"';

    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query update error]', message: ' user update query error'});
        console.log(error);

        return false;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query update error]', message: ' user update empty'});

        return false;
    }
    rows1 = queryResult1[0];

    return true;
}

// 비밀번호 정보 가져오기
exports.getUserPwInfo = async (seq) => {
    let query1 = 'SELECT ta.acnt_pw, ta.acnt_pw_salt';
        query1 += ' FROM OPENBMS.TBL_ACNT ta';
        query1 += ' WHERE ta.acnt_seq = "' + seq + '"';

    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query select error]', message: ' user id count query error'});
        console.log(error);

        return rows1;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query result error]', message: ' user id count empty'});

        return rows1;
    }
    rows1 = queryResult1[0];

    return rows1[0];
}

// 비밀번호 수정
exports.updUserPw = async (acntSeq, acntId, info) => {
    // 1. 비밀번호 변경
    let query1 = 'UPDATE OPENBMS.TBL_ACNT';
        query1 += ' SET acnt_pw = "' + info.newPwHash + '",';
        query1 += '     acnt_pw_salt = "' + info.newPwSalt + '",';
        query1 += '     upd_nm = "' + acntId + '",';
        query1 += '     upd_dttm = SYSDATE()';
        query1 += ' WHERE acnt_seq = "' + acntSeq + '"';

    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query update error]', message: ' user update query error'});
        console.log(error);

        return false;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query update error]', message: ' user update empty'});

        return false;
    }
    rows1 = queryResult1[0];

    return true;
}

// 사용자 아이디 중복 체크
exports.getUserIdCount = async (id) => {
    // 1. 개수 가져오기
    let query1 = 'SELECT COUNT(*) AS cnt';
        query1 += ' FROM OPENBMS.TBL_ACNT ta';
        query1 += ' WHERE ta.acnt_id = "' + id + '"';

    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query select error]', message: ' user id count query error'});
        console.log(error);

        return rows1;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query result error]', message: ' user id count empty'});

        return rows1;
    }
    rows1 = queryResult1[0];

    return rows1[0];
}

// 사용자 추가
exports.insUser = async (acntId, cmpySeq, info, role) => {
    // 1. 사용자 추가
    let query1 = 'INSERT INTO OPENBMS.TBL_ACNT';
        query1 += ' SET acnt_id = "' + info.id + '",';
        query1 += '     acnt_pw = "' + info.pwHsah + '",';
        query1 += '     acnt_pw_salt = "' + info.pwSalt + '",';
        query1 += '     acnt_nm = "' + info.name + '",';
        query1 += '     acnt_email = "' + info.emailEnc + '",';
        query1 += '     acnt_tel = "' + info.telEnc + '",';
        query1 += '     acnt_email_allow = "' + info.emailAllow + '",';
        query1 += '     acnt_tel_allow = "' + info.telAllow + '",';
        query1 += '     acnt_stat_cd = "Y",';
        query1 += '     ins_nm = "' + acntId + '",';
        query1 += '     ins_dttm = SYSDATE(),';
        query1 += '     upd_nm = "' + acntId + '",';
        query1 += '     upd_dttm = SYSDATE(),';
        query1 += '     acnt_role = "' + info.role + '",';
        query1 += '     cmpy_seq = "' + cmpySeq + '",';
        query1 += '     acnt_delete_yn = "N"';

    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query insert error]', message: ' user insert query error'});
        console.log(error);

        return false;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query insert error]', message: ' user insert empty'});

        return false;
    }
    rows1 = queryResult1[0];

    // 2. 사용자 - 회사 매핑
    let query2 = 'INSERT INTO OPENBMS.MPP_ACNT_CMPY';
        query2 += ' SET acnt_seq = "' + rows1.insertId + '",';
        query2 += '     cmpy_seq = "' + cmpySeq + '"';

    let queryResult2, rows2 = [];
    try {
        queryResult2 = await global.mysqlPool.query(query2);
    } catch (error) {
        console.log({code: '[query insert error]', message: ' user mapping query error'});
        console.log(error);

        return false;
    }
    if (queryResult2 == null || queryResult2[0].length == 0) {
        console.log({code: '[query insert error]', message: ' user mapping empty'});

        return false;
    }
    rows2 = queryResult2[0];

    // 1. 사용자 권한 추가
    let query3 = 'INSERT INTO OPENBMS.MPP_ACNT_ACS(acnt_seq, acs_seq)';
        query3 += ' SELECT "' + rows1.insertId + '" AS acnt_seq, tac.acs_seq';
        query3 += ' FROM OPENBMS.TBL_ACS tac';
        query3 += ' WHERE tac.acs_gp = "' + role + '"';

    let queryResult3, rows3 = [];
    try {
        queryResult3 = await global.mysqlPool.query(query3);
    } catch (error) {
        console.log({code: '[query insert error]', message: ' user insert query error'});
        console.log(error);

        return false;
    }
    rows3 = queryResult3[0];
    
    return true;
}