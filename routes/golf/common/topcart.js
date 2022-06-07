const moment = require('moment');

exports.getTopCartInfo = async (cmpySeq) => {
    // 1. 회사 seq -> cart list -> btry list -> btry info and btry stat
    let query = 'SELECT';
        query += '     b.cart_seq, IFNULL(b.cart_stat, "N") AS cart_stat,';
        query += '     b.btry_seq, IFNULL(tb.btry_mng_stat, "N") AS btry_stat,';
        query += '     tbls.last_biz_dttm AS last_dttm, tbls.chrg_stat_cd AS last_stat';
        query += ' FROM (';
        query += '     SELECT a.cart_seq, a.cart_stat, mcb.btry_seq';
        query += '     FROM (';
        query += '         SELECT tca.cart_seq, tca.cart_stat';
        query += '         FROM OPENBMS.TBL_CART tca';
        query += '         WHERE tca.cc_seq = (';
        query += '             SELECT tcc.cc_seq';
        query += '             FROM OPENBMS.TBL_CC tcc';
        query += '             WHERE tcc.cmpy_seq = "' + cmpySeq + '"';
        query += '             LIMIT 1';
        query += '         )';
        query += '     ) a';
        query += '     LEFT OUTER JOIN OPENBMS.MPP_CART_BTRY mcb';
        query += '     ON a.cart_seq = mcb.cart_seq';
        query += ' ) b';
        query += ' LEFT OUTER JOIN OPENBMS.TBL_BTRY tb';
        query += ' ON b.btry_seq = tb.btry_seq';
        query += ' LEFT OUTER JOIN OPENBMS.TBL_BTRY_LAST_STAT tbls';
        query += ' ON b.btry_seq = tbls.btry_seq';

    let queryResult, rows = [];
    try {
        queryResult = await global.mysqlPool.query(query);
    } catch (error) {
        console.log({code: '[query select error]', message: ' top cart info query error'});
        console.log(error);

        return rows;
    }
    if (queryResult == null || queryResult[0].length == 0) {
        console.log({code: '[query result error]', message: ' top cart info empty'});

        return rows;
    }
    rows = queryResult[0];

    // 2. count 계산
    let topCartCount = { total: 0, oper: 0, chrg: 0, wait: 0, insp: 0 }
    rows.map(e => {
        // 전체
        topCartCount.total += 1;

        // 운행중
        // cart 상태 Y && btry 상태 Y && 1일 이내 O && 마지막 DC
        let operChk = e.cart_stat == 'Y'
            && e.btry_stat == 'Y'
            && e.last_dttm != null
            && moment().diff(moment(e.last_dttm), 'days') <= 0
            && e.last_stat != null
            && e.last_stat == 'DC';

        if (operChk) topCartCount.oper += 1;

        // 충전중
        // cart 상태가 Y && btry 상태가 Y && 1일 이내 O && 마지막 C
        let chrgChk = e.cart_stat == 'Y'
            && e.btry_stat == 'Y'
            && e.last_dttm != null
            && moment().diff(moment(e.last_dttm), 'days') <= 0
            && e.last_stat != null
            && e.last_stat == 'C';

        if (chrgChk) topCartCount.chrg += 1;

        // 대기중
        // cart 상태가 Y && btry 상태가 Y && 1일 이내 O && 마지막 W
        let waitChk = e.cart_stat == 'Y'
            && e.btry_stat == 'Y'
            && e.last_dttm != null
            && moment().diff(moment(e.last_dttm), 'days') <= 0
            && e.last_stat != null
            && e.last_stat == 'W';

        if (waitChk) topCartCount.wait += 1;

        // 점검중
        // cart 상태가 N || btry 상태가 N || 1일 이내 X
        let inspChk = e.cart_stat == 'N'
            || e.btry_stat == 'N'
            || e.last_dttm == null
            || moment().diff(moment(e.last_dttm), 'days') > 0

        if (inspChk) topCartCount.insp += 1;
    });

    return topCartCount;
}