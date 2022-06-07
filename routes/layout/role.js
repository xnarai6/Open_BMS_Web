const path = require('path');
const form = require(path.join(global.appRoot, '/modules/form.js'));

exports.checkRole = async (req, res, parent, out) => {
    // 1. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 1-1. session check
    if (!userInfo || !userInfo.acnt_seq || !userInfo.cmpy_seq) {
        console.log({code: '[session check error]', message: ' no session'});
        form.result(res, req.method, 'FAIL', null, '사용자 정보가 없습니다', null, '/account/logout');
        return false;
    }

    // 2. 접근 가능한 url 여부 확인
    let acntSeq = userInfo.acnt_seq, url = parent + req.url;

    let query = 'SELECT COUNT(*) AS cnt';
        query += ' FROM OPENBMS.MPP_ACNT_ACS maa';
        query += ' WHERE maa.acnt_seq = "' + acntSeq + '"';
        query += ' AND maa.acs_seq IN (';
        query += '     SELECT ta.acs_seq';
        query += '     FROM OPENBMS.TBL_ACS ta';
        query += '     WHERE INSTR("' + url + '", ta.acs_url) > 0';
        query += ' )';

    let queryResult, rows = [];
    try {
        queryResult = await global.mysqlPool.query(query);
    } catch (error) {
        console.log({code: '[query select error]', message: ' url check query error'});
        console.log(error);

        form.result(res, req.method, 'FAIL', null, '해당 페이지의 접근 권한이 없습니다', null, out);
        return false;
    }
    if (queryResult == null || queryResult[0].length == 0) {
        console.log({code: '[query result error]', message: ' url check empty'});

        form.result(res, req.method, 'FAIL', null, '해당 페이지의 접근 권한이 없습니다', null, out);
        return false;
    }
    rows = queryResult[0];

    if (rows[0].cnt <= 0) {
        form.result(res, req.method, 'FAIL', null, '해당 페이지의 접근 권한이 없습니다', null, out);
        return false;
    }

    return true;
}