const path = require('path');
const Pagination = require(path.join(global.appRoot, '/modules/pagination.js'));

//제조업체 소속 수요업체 가져오기
exports.getDmdrByMftr = async (cmpySeq) => {

    let query1 = "SELECT GROUP_CONCAT(mmd.dmdr_seq) as cmpy_seq ";
        query1+= "FROM MPP_MFTR_DMDR mmd ";
        query1+= "WHERE mmd.mftr_seq = " + cmpySeq + " ";

    let queryResult, rows = [];
    try {
        queryResult = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query select error]', message: ' getDmdrByMftr query error'});
        console.log(error);

        return rows;
    }
    if (queryResult == null || queryResult[0].length == 0) {
        console.log({code: '[query result error]', message: ' getDmdrByMftr empty'});

        return rows;
    }
    rows = queryResult[0];

    return rows;

}

// 회사 리스트 가져오기
exports.getCompanyList = async (cmpySeq, page, size) => {
    // 1. 전체 개수 가져오기
    let query1 = 'SELECT COUNT(*) AS cnt';
        query1 += ' FROM OPENBMS.TBL_CMPY tc';
        query1 += ' WHERE tc.cmpy_seq IN (' + cmpySeq + ') ';

    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query select error]', message: ' company count query error'});
        console.log(error);

        return rows1;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query result error]', message: ' company count empty'});

        return rows1;
    }
    rows1 = queryResult1[0];

    // 2. 페이징 생성
    let paging = new Pagination(rows1[0].cnt, page, size);
        paging.getPages(size);

    // 3. 페이지에 해당되는만큼 select
    let query2 = 'SELECT tc.cmpy_seq, tc.cmpy_ty_cd, ';
        query2 +='tc.cmpy_nm, tc.cmpy_chrg_nm, tc.cmpy_chrg_mail,  ';
        query2 +='tc.cmpy_chrg_tel, tc.cmpy_biz_type, tc.cmpy_approval_stat_cd ';
        query2 +='FROM OPENBMS.TBL_CMPY tc ';
        query2 +='WHERE tc.cmpy_seq IN (' + cmpySeq + ') ';
        query2 +='ORDER BY tc.cmpy_seq DESC ';
        query2 +='LIMIT ' + paging.limit;

    let queryResult2, rows2 = [];
    try {
        queryResult2 = await global.mysqlPool.query(query2);
    } catch (error) {
        console.log({code: '[query select error]', message: ' company list query error'});
        console.log(error);

        return rows2;
    }
    if (queryResult2 == null || queryResult2[0].length == 0) {
        console.log({code: '[query result error]', message: ' company list empty'});

        return rows2;
    }
    rows2 = queryResult2[0];

    return { paging: paging, rows: rows2 };
}

// 회사 상세 가져오기
exports.getCompanyDetail = async (cmpySeq) => {
    // 1. 회사 가져오기
    let query1 = 'SELECT tc.cmpy_seq, tc.cmpy_nm, tc.cmpy_biz_type, tc.cmpy_ty_cd, tc.cmpy_div_cd, tc.cmpy_biz_num, ';
        query1+= 'tc.cmpy_addr1, tc.cmpy_addr2, tc.cmpy_chrg_nm, tc.cmpy_chrg_mail, tc.cmpy_chrg_tel, tc.cmpy_approval_stat_cd ';
        query1+= 'FROM OPENBMS.TBL_CMPY tc ';
        query1+= 'WHERE tc.cmpy_seq = ' + cmpySeq + ' ';

    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query select error]', message: ' company detail query error'});
        console.log(error);

        return rows1;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query select error]', message: ' company detail empty'});

        return rows1;
    }
    rows1 = queryResult1[0];

    return rows1[0];
}

// 수요업체 등록 신청
exports.insCompany = async (acntId, cmpySeq, info) => {
    // 1. 수요업체 등록 신청
    let query1 = 'INSERT INTO OPENBMS.TBL_CMPY';
        query1 += ' SET cmpy_ty_cd = "D",';
        query1 += '     cmpy_div_cd = "NODIV",';
        query1 += '     cmpy_nm = "' + info.cmpy_nm + '",';
        query1 += '     cmpy_biz_num = "' + info.cmpy_biz_num + '",';
        query1 += '     cmpy_addr1 = "' + info.cmpy_addr1 + '",';
        query1 += '     cmpy_addr2 = "' + info.cmpy_addr2 + '",';
        query1 += '     cmpy_chrg_nm = "' + info.cmpy_chrg_nm + '",';
        query1 += '     cmpy_chrg_mail = "' + info.cmpy_chrg_mail + '",';
        query1 += '     cmpy_chrg_tel = "' + info.cmpy_chrg_tel + '",';
        query1 += '     cmpy_biz_type = "' + info.cmpy_biz_type + '",';
        query1 += '     cmpy_approval_stat_cd = "UR",';
        query1 += '     ins_nm = "' + acntId + '",';
        query1 += '     ins_dttm = SYSDATE(),';
        query1 += '     upd_nm = "' + acntId + '",';
        query1 += '     upd_dttm = SYSDATE()';

    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query insert error]', message: ' company insert query error'});
        console.log(error);

        return false;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query insert error]', message: ' company insert empty'});

        return false;
    }
    rows1 = queryResult1[0];

    // 2. 수요업체-제조업체 매핑
    let query2 = 'INSERT INTO OPENBMS.MPP_MFTR_DMDR';
        query2 += ' SET dmdr_seq = "' + rows1.insertId + '",';
        query2 += '     mftr_seq = "' + cmpySeq + '"';

    let queryResult2, rows2 = [];
    try {
        queryResult2 = await global.mysqlPool.query(query2);
    } catch (error) {
        console.log({code: '[query insert error]', message: ' manufacture_demander company mapping query error'});
        console.log(error);

        return false;
    }
    if (queryResult2 == null || queryResult2[0].length == 0) {
        console.log({code: '[query insert error]', message: ' manufacture_demander company mapping empty'});

        return false;
    }
    rows2 = queryResult2[0];

    // 3. 설치 장소 추가 (회사이름_회사보관)
    let query3 = 'INSERT INTO OPENBMS.TBL_LOC';
        query3 += ' SET loc_nm = "' + info.cmpy_nm + '_회사보관", ';
        query3 += '     loc_lon = "' + 0 + '", ';
        query3 += '     loc_lat = "' + 0 + '", ';
        query3 += '     loc_weather_code = "' + 0 + '", ';
        query3 += '     loc_addr1 = "' + info.cmpy_addr1 + '", ';
        query3 += '     loc_addr2 = "' + info.cmpy_addr2 + '", ';
        query3 += '     loc_delete_yn = "N", ';
        query3 += '     ins_nm = "' + acntId + '", ';
        query3 += '     ins_dttm = SYSDATE(), ';
        query3 += '     upd_nm = "' + acntId + '", ';
        query3 += '     upd_dttm = SYSDATE(); ';

    let queryResult3, rows3 = [];
    try {
        queryResult3 = await global.mysqlPool.query(query3);
    } catch (error) {
        console.log({code: '[query insert error]', message: ' location insert query error'});
        console.log(error);

        return false;
    }
    if (queryResult3 == null || queryResult3[0].length == 0) {
        console.log({code: '[query insert error]', message: ' location insert empty'});

        return false;
    }
    rows3 = queryResult3[0];

    // 4. 설치 장소 추가 (회사이름_회사보관)
    let query4 = 'INSERT INTO OPENBMS.MPP_CMPY_LOC';
        query4 += ' SET cmpy_seq = "' + rows1.insertId + '",';
        query4 += '     loc_seq = "' + rows3.insertId + '"';

    let queryResult4, rows4 = [];
    try {
        queryResult4 = await global.mysqlPool.query(query4);
    } catch (error) {
        console.log({code: '[query insert error]', message: ' company-location mapping query error'});
        console.log(error);

        return false;
    }
    if (queryResult4 == null || queryResult4[0].length == 0) {
        console.log({code: '[query insert error]', message: ' company-location mapping empty'});

        return false;
    }
    rows4 = queryResult4[0];
    
    return true;
}

// 수요업체 수정
exports.updCompany = async (cmpySeq, acntId, info) => {
    // 1. 수요업체 변경
    let query1 = 'UPDATE OPENBMS.TBL_CMPY';
        query1 += ' SET cmpy_biz_num = "' + info.cmpy_biz_num + '",';
        query1 += '     cmpy_addr1 = "' + info.cmpy_addr1 + '",';
        query1 += '     cmpy_addr2 = "' + info.cmpy_addr2 + '",';
        query1 += '     cmpy_chrg_nm = "' + info.cmpy_chrg_nm + '",';
        query1 += '     cmpy_chrg_mail = "' + info.cmpy_chrg_mail + '",';
        query1 += '     cmpy_chrg_tel = "' + info.cmpy_chrg_tel + '",';
        query1 += '     upd_nm = "' + acntId + '",';
        query1 += '     upd_dttm = SYSDATE()';
        query1 += ' WHERE cmpy_seq = "' + cmpySeq + '"';

    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query update error]', message: ' company update query error'});
        console.log(error);

        return false;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query update error]', message: ' company update empty'});

        return false;
    }
    rows1 = queryResult1[0];

    return true;
}

// 회사명 중복 체크
exports.getCmpyNmCount = async (cmpy_nm) => {
    // 1. 개수 가져오기
    let query1 = 'SELECT COUNT(*) AS cnt';
        query1 += ' FROM OPENBMS.TBL_CMPY tc';
        query1 += ' WHERE tc.cmpy_nm = "' + cmpy_nm + '"';

    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query select error]', message: ' company name count query error'});
        console.log(error);

        return rows1;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query result error]', message: ' company name count empty'});

        return rows1;
    }
    rows1 = queryResult1[0];

    return rows1[0];
}

// 회사에 연결된 회원목록 가져오기
exports.getCompanyAcntList = async (cmpySeq) => {
    // 1. 회사 가져오기
    let query1 = "SELECT ta.acnt_seq, ta.acnt_id FROM OPENBMS.TBL_ACNT ta ";
        query1+= "WHERE ta.acnt_delete_yn = 'N' ";
        query1+= "AND ta.acnt_seq IN (SELECT mac.acnt_seq FROM OPENBMS.MPP_ACNT_CMPY mac WHERE mac.cmpy_seq = " + cmpySeq + "); ";

    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query select error]', message: ' company detail query error'});
        console.log(error);

        return rows1;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query select error]', message: ' company acnt empty'});

        return rows1;
    }
    rows1 = queryResult1[0];

    return rows1;
}

// 회사에 연결된 배터리목록 가져오기
exports.getCompanyBtryList = async (cmpySeq) => {
    // 1. 회사 가져오기
    let query1 = "SELECT tb.btry_seq, tb.btry_nm ";
        query1+= "FROM OPENBMS.TBL_BTRY tb  ";
        query1+= "WHERE tb.btry_delete_yn = 'N' ";
        query1+= "AND tb.btry_seq IN (SELECT mcb.btry_seq FROM OPENBMS.MPP_CMPY_BTRY mcb WHERE mcb.cmpy_seq = " + cmpySeq + "); ";


    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query select error]', message: ' company detail query error'});
        console.log(error);

        return rows1;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query select error]', message: ' company btry empty'});

        return rows1;
    }
    rows1 = queryResult1[0];

    return rows1;
}

// 회사에 연결된 설치장소 목록 가져오기
exports.getCompanyLocList = async (cmpySeq) => {
    // 1. 회사 가져오기
    let query1 = "SELECT tl.loc_seq, tl.loc_nm ";
        query1+= "FROM OPENBMS.TBL_LOC tl  ";
        query1+= "WHERE tl.loc_delete_yn = 'N'  ";
        query1+= "AND tl.loc_seq IN (SELECT mcl.loc_seq FROM OPENBMS.MPP_CMPY_LOC mcl WHERE mcl.cmpy_seq = " + cmpySeq + "); ";

    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query select error]', message: ' company detail query error'});
        console.log(error);

        return rows1;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query select error]', message: ' company loc empty'});

        return rows1;
    }
    rows1 = queryResult1[0];

    return rows1;
}

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
        console.log({code: '[query insert error]', message: ' user insert query error'});
        console.log(error);

        return rows1;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query insert error]', message: ' user insert empty'});

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

// 배터리 리스트 가져오기
exports.getBatteryList = async (cmpySeq, page, size) => {
    // 1. 전체 개수 가져오기
    let query1 = "SELECT COUNT(*) AS cnt ";
        query1+= "FROM OPENBMS.TBL_BTRY tb ";
        query1+= "WHERE tb.btry_seq IN ( ";
        query1+= "    SELECT mcb.btry_seq ";
        query1+= "    FROM OPENBMS.MPP_CMPY_BTRY mcb ";
        query1+= "    WHERE mcb.cmpy_seq = " + cmpySeq + " ";
        query1+= ") ";

    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query select error]', message: ' battery count query error'});
        console.log(error);

        return rows1;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query result error]', message: ' battery count empty'});

        return rows1;
    }
    rows1 = queryResult1[0];

    // 2. 페이징 생성
    let paging = new Pagination(rows1[0].cnt, page, size);
        paging.getPages(size);

    // 3. 페이지에 해당되는만큼 select
    let query2  = " SELECT tb.btry_seq, tb.btry_nm, tb.btry_mdl_ty_cd, tb.btry_mfctor_nm, DATE_FORMAT(tb.prd_dttm,'%Y-%m-%d') AS prd_dttm, tb.prd_nm, ";
        query2 += "(SELECT tm.mdl_no FROM OPENBMS.TBL_MDL tm WHERE tm.mdl_delete_yn = 'N' AND tm.mdl_seq = tb.mdl_seq) as mdl_no, "; 
        query2 += "       (SELECT tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.cd =  "; 
        query2 += "        (SELECT tm.btry_ty FROM OPENBMS.TBL_MDL tm WHERE tb.mdl_seq = tm.mdl_seq) AND tc.gp_cd = 'btry_ty') as btry_ty, "; 
        query2 += "        (SELECT tc.cmpy_nm FROM OPENBMS.TBL_CMPY tc  "; 
        query2 += "        WHERE tc.cmpy_seq IN "; 
        query2 += "        (SELECT mcb.cmpy_seq FROM OPENBMS.MPP_CMPY_BTRY mcb WHERE mcb.btry_seq = tb.btry_seq) "; 
        query2 += "        AND tc.cmpy_ty_cd = 'D') as dmdr_cmpy_nm  "; 
        query2 += "    FROM OPENBMS.TBL_BTRY tb ";
        query2 += "    WHERE tb.btry_delete_yn = 'N'  ";
        query2 += "    AND tb.btry_seq IN ( ";
        query2 += "    SELECT mcb.btry_seq ";
        query2 += "    FROM OPENBMS.MPP_CMPY_BTRY mcb ";
        query2 += "    WHERE mcb.cmpy_seq = " + cmpySeq + " ";
        query2 += ") ";
        query2 += "    ORDER BY tb.btry_seq ASC  "; 
        query2 += "LIMIT " + paging.limit;

    let queryResult2, rows2 = [];
    try {
        queryResult2 = await global.mysqlPool.query(query2);
    } catch (error) {
        console.log({code: '[query select error]', message: ' battery list query error'});
        console.log(error);

        return rows2;
    }
    if (queryResult2 == null || queryResult2[0].length == 0) {
        console.log({code: '[query result error]', message: ' battery list empty'});

        return rows2;
    }
    rows2 = queryResult2[0];

    return { paging: paging, rows: rows2 };
}

//제조업체 목록 가져오기 
exports.getMftrCmpyList = async () => {
    let query = "SELECT tc.cmpy_seq, tc.cmpy_ty_cd, tc.cmpy_nm, tc.cmpy_biz_type ";
        query +="FROM OPENBMS.TBL_CMPY tc WHERE tc.cmpy_ty_cd = 'M' AND tc.cmpy_biz_type = '10'";
        query +="ORDER BY tc.cmpy_nm ASC";

    let queryResult, rows = [], result = {};
    try {
        queryResult = await global.mysqlPool.query(query);
    } catch (error) {
        console.log({code: '[query select error]', message: ' getMftrCmpyList query error'});
        console.log(error);

        return result;
    }
    if (queryResult == null || queryResult[0].length == 0) {
        console.log({code: '[query result error]', message: ' getMftrCmpyList empty'});

        return result;
    }
    rows = queryResult[0];

    rows.map(e => {
        if (!result['mftrCmpyList']) result['mftrCmpyList'] = {};
        result['mftrCmpyList'][e.cmpy_seq] = e.cmpy_nm;
    });

    return result;
}

//모듈 목록 가져오기 
exports.getMdlList = async () => {
    let query = "SELECT mdl_seq, mdl_no FROM OPENBMS.TBL_MDL WHERE mdl_delete_yn = 'N'";
        query +="ORDER BY mdl_no ASC";

    let queryResult, rows = [], result = {};
    try {
        queryResult = await global.mysqlPool.query(query);
    } catch (error) {
        console.log({code: '[query select error]', message: ' getMdlList query error'});
        console.log(error);

        return result;
    }
    if (queryResult == null || queryResult[0].length == 0) {
        console.log({code: '[query result error]', message: ' getMdlList empty'});

        return result;
    }
    rows = queryResult[0];

    rows.map(e => {
        if (!result['mdlList']) result['mdlList'] = {};
        result['mdlList'][e.mdl_seq] = e.mdl_no;
    });

    return result;
}

exports.getMdlMftrByMdlSeq = async (mdl_seq) => {

    let query = "SELECT IFNULL(tc.cd,'-1') as btry_mdl_ty_cd, IFNULL(tc.cd_desc,'선택') as btry_mdl_ty ";
        query+= "FROM OPENBMS.TBL_CD tc ";
        query+= "WHERE tc.gp_cd = 'btry_mdl_ty' "; 
        query+= "AND tc.cd = "; 
        query+= "    (SELECT tm.mdl_mftr "; 
        query+= "    FROM OPENBMS.TBL_MDL tm "; 
        query+= "    WHERE tm.mdl_delete_yn='N' "; 
        query+= "    AND tm.mdl_seq = " + mdl_seq + ")";
    
    let queryResult, rows = [], result = {};
    try {
        queryResult = await global.mysqlPool.query(query);
    } catch (error) {
        console.log({code: '[query select error]', message: ' getMdlMftrByMdlSeq query error'});
        console.log(error);

        return result;
    }
    if (queryResult == null || queryResult[0].length == 0) {
        console.log({code: '[query result error]', message: ' getMdlMftrByMdlSeq empty'});

        return result;
    }
    rows = queryResult[0];

    return rows;

}

exports.getSearchDmdrCmpy = async (cmpy_seq, cmpy_nm, page, size) => {

    // 1. 전체 개수 가져오기
    let query1 = "SELECT COUNT(*) AS cnt ";
        query1+= "FROM OPENBMS.TBL_CMPY tc ";
        query1+= "WHERE cmpy_ty_cd = 'D' "; 
        query1+= "    AND tc.cmpy_approval_stat_cd = 'AP' "; 
        query1+= "    AND tc.cmpy_nm LIKE '%" + cmpy_nm + "%' ";
        query1+= "    OR tc.cmpy_seq =" + cmpy_seq + "; ";

    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query select error]', message: ' getSearchDmdrCmpy count query error'});
        console.log(error);

        return rows1;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query result error]', message: ' getSearchDmdrCmpy count empty'});
        return rows1;
    }
    rows1 = queryResult1[0];

    // 2. 페이징 생성
    let paging = new Pagination(rows1[0].cnt, page, size);
        paging.getPages(size);

    let query2 = "SELECT tc.cmpy_seq, tc.cmpy_nm, ";
        query2+= "IFNULL(tc.cmpy_chrg_nm,'') AS cmpy_chrg_nm, ";
        query2+= "IFNULL(tc.cmpy_biz_type,'') AS cmpy_biz_type_cd, ";
        query2+= "IFNULL(tCode.cd_desc,'') AS cmpy_biz_type_cd_desc, ";
        query2+= "IFNULL(tc.cmpy_addr1,'') AS cmpy_addr1, ";
        query2+= "IFNULL(tc.cmpy_addr2,'') AS cmpy_addr2, ";
        query2+= "IFNULL(tc.cmpy_biz_num,'') AS cmpy_biz_num ";
        query2+= "FROM OPENBMS.TBL_CMPY tc ";
        query2+= "LEFT JOIN OPENBMS.TBL_CD tCode ";
        query2+= "ON tCode.gp_cd = 'cmpy_biz_type' ";
        query2+= "AND tCode.cd = tc.cmpy_biz_type ";
        query2+= "WHERE cmpy_ty_cd = 'D' ";
        query2+= "AND tc.cmpy_approval_stat_cd = 'AP' ";
        query2+= "AND tc.cmpy_nm LIKE '%" + cmpy_nm + "%' ";
        query2+= "OR tc.cmpy_seq =" + cmpy_seq + " ";
        query2+= "LIMIT " + paging.limit;
    
    let queryResult2, rows2 = [], result2 = {};
    try {
        queryResult2 = await global.mysqlPool.query(query2);
    } catch (error) {
        console.log({code: '[query select error]', message: ' getSearchDmdrCmpy query error'});
        console.log(error);

        return result2;
    }
    if (queryResult2 == null || queryResult2[0].length == 0) {
        console.log({code: '[query result error]', message: ' getSearchDmdrCmpy empty'});

        return result2;
    }
    rows2 = queryResult2[0];

    return { paging: paging, dmdrCmpyList: rows2, size : size };

}

exports.getSearchLocByDmdrCmpy = async (cmpy_seq) => {

    let query = "SELECT tl.loc_seq, tl.loc_nm ";
        query+= "FROM OPENBMS.TBL_LOC tl ";
        query+= "        WHERE tl.loc_seq IN ( ";
        query+= "            SELECT mcl.loc_seq ";
        query+= "           FROM OPENBMS.MPP_CMPY_LOC mcl ";
        query+= "            WHERE mcl.cmpy_seq = '" + cmpy_seq + "' ";
        query+= "       ) ";
        query+= "        AND tl.loc_delete_yn != 'Y'; ";
    
    let queryResult, rows = [], result = {};
    try {
        queryResult = await global.mysqlPool.query(query);
    } catch (error) {
        console.log({code: '[query select error]', message: ' getSearchLocByDmdrCmpy query error'});
        console.log(error);

        return result;
    }
    if (queryResult == null || queryResult[0].length == 0) {
        console.log({code: '[query result error]', message: ' getSearchLocByDmdrCmpy empty'});

        return result;
    }
    rows = queryResult[0];

    rows.map(e => {
        if (!result['dmdrLocList']) result['dmdrLocList'] = {};
        result['dmdrLocList'][e.loc_seq] = e.loc_nm;
    });

    return result;

}

// 사용자 아이디 중복 체크
exports.getBatteryNameCount = async (btry_nm) => {
    // 1. 개수 가져오기
    let query1 = 'SELECT COUNT(*) AS cnt';
        query1 += ' FROM OPENBMS.TBL_BTRY tb';
        query1 += ' WHERE tb.btry_nm = "' + btry_nm + '"';

    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query select error]', message: ' battery name count query error'});
        console.log(error);

        return rows1;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query result error]', message: ' battery name count empty'});

        return rows1;
    }
    rows1 = queryResult1[0];

    return rows1[0];
}

// 배터리 등록
exports.insBattery = async (acntId, cmpySeq, info) => {
    // 1. 배터리 등록
    let query1 = 'INSERT INTO OPENBMS.TBL_BTRY';
        query1 += '     btry_nm = "' + info.btry_nm + '",';
        query1 += '     btry_mdl_ty_cd = "' + info.btry_mdl_ty_cd + '",';
        query1 += '     btry_min_volt = "' + info.btry_min_volt + '",';
        query1 += '     btry_max_volt = "' + info.btry_max_volt + '",';
        query1 += '     btry_rat_volt = "' + info.btry_rat_volt + '",';
        query1 += '     btry_min_curr = "' + info.btry_min_curr + '",';
        query1 += '     btry_max_curr = "' + info.btry_max_curr + '",';
        query1 += '     btry_rat_curr = "' + info.btry_rat_curr + '",';
        query1 += '     btry_min_tp = "' + info.btry_min_tp + '",';
        query1 += '     btry_max_tp = "' + info.btry_max_tp + '",';
        query1 += '     ins_nm = "' + acntId + '",';
        query1 += '     ins_dttm = SYSDATE(),';
        query1 += '     upd_nm = "' + acntId + '",';
        query1 += '     upd_dttm = SYSDATE(),';
        query1 += '     btry_max_pwr = "' + info.btry_max_pwr + '",';
        query1 += '     btry_stat = "DG",';
        query1 += '     btry_mng_stat = "' + info.btry_mng_stat + '",';
        query1 += '     mdl_seq = "' + info.mdl_seq + '",';
        query1 += '     btry_mfctor_nm = "' + info.btry_mfctor_nm + '",';
        query1 += '     btry_delete_yn = "N",';
        query1 += '     prd_nm = "' + info.prd_nm + '",';
        query1 += '     prd_dttm = "' + info.prd_dttm + '",';
        query1 += '     install_nm = "' + acntId + '",';
        query1 += '     install_dttm = SYSDATE()';

    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query insert error]', message: ' company insert query error'});
        console.log(error);

        return false;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query insert error]', message: ' company insert empty'});

        return false;
    }
    rows1 = queryResult1[0];

    // 2. 수요업체-제조업체 매핑
    let query2 = 'INSERT INTO OPENBMS.MPP_MFTR_DMDR';
        query2 += ' SET dmdr_seq = "' + rows1.insertId + '",';
        query2 += '     mftr_seq = "' + cmpySeq + '"';

    let queryResult2, rows2 = [];
    try {
        queryResult2 = await global.mysqlPool.query(query2);
    } catch (error) {
        console.log({code: '[query insert error]', message: ' manufacture_demander company mapping query error'});
        console.log(error);

        return false;
    }
    if (queryResult2 == null || queryResult2[0].length == 0) {
        console.log({code: '[query insert error]', message: ' manufacture_demander company mapping empty'});

        return false;
    }
    rows2 = queryResult2[0];

    // 3. 설치 장소 추가 (회사이름_회사보관)
    let query3 = 'INSERT INTO OPENBMS.TBL_LOC';
        query3 += ' SET loc_nm = "' + info.cmpy_nm + '_회사보관", ';
        query3 += '     loc_lon = "' + 0 + '", ';
        query3 += '     loc_lat = "' + 0 + '", ';
        query3 += '     loc_weather_code = "' + 0 + '", ';
        query3 += '     loc_addr1 = "' + info.cmpy_addr1 + '", ';
        query3 += '     loc_addr2 = "' + info.cmpy_addr2 + '", ';
        query3 += '     loc_delete_yn = "N", ';
        query3 += '     ins_nm = "' + acntId + '", ';
        query3 += '     ins_dttm = SYSDATE(), ';
        query3 += '     upd_nm = "' + acntId + '", ';
        query3 += '     upd_dttm = SYSDATE(); ';

    let queryResult3, rows3 = [];
    try {
        queryResult3 = await global.mysqlPool.query(query3);
    } catch (error) {
        console.log({code: '[query insert error]', message: ' location insert query error'});
        console.log(error);

        return false;
    }
    if (queryResult3 == null || queryResult3[0].length == 0) {
        console.log({code: '[query insert error]', message: ' location insert empty'});

        return false;
    }
    rows3 = queryResult3[0];

    // 4. 설치 장소 추가 (회사이름_회사보관)
    let query4 = 'INSERT INTO OPENBMS.MPP_CMPY_LOC';
        query4 += ' SET cmpy_seq = "' + rows1.insertId + '",';
        query4 += '     loc_seq = "' + rows3.insertId + '"';

    let queryResult4, rows4 = [];
    try {
        queryResult4 = await global.mysqlPool.query(query4);
    } catch (error) {
        console.log({code: '[query insert error]', message: ' company-location mapping query error'});
        console.log(error);

        return false;
    }
    if (queryResult4 == null || queryResult4[0].length == 0) {
        console.log({code: '[query insert error]', message: ' company-location mapping empty'});

        return false;
    }
    rows4 = queryResult4[0];
    
    return true;
}