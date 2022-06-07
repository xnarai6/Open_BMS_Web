
// 회사 seq로 골프장 정보 가져오기
exports.getCCInfo = async (cmpySeq) => {
    // 1. 회사번호 -> 골프장 테이블 -> 코스 테이블 순으로 조인 조회
    let query = 'SELECT tcc.cc_seq, tcc.cors_cnt, tcc.lat, tcc.lon';
        query += ' FROM OPENBMS.TBL_CC tcc';
        query += ' WHERE tcc.cmpy_seq = "' + cmpySeq + '"';

    let queryResult, rows = [];
    try {
        queryResult = await global.mysqlPool.query(query);
    } catch (error) {
        console.log({code: '[query select error]', message: ' cc query error'});
        console.log(error);

        return rows;
    }
    if (queryResult == null || queryResult[0].length == 0) {
        console.log({code: '[query result error]', message: ' cc empty'});

        return rows;
    }
    rows = queryResult[0];

    return rows[0];
}

// 골프장 정보로 코스 list 가져오기
exports.getCorsList = async (ccInfo) => {
    // 1. 골프장 seq -> 코스 테이블 순으로 조회
    let query = 'SELECT tco.cors_seq, tco.cors_group_nm, tco.cors_group_order, tco.cors_nm, tco.cors_type, tco.lat, tco.lon';
        query += ' FROM OPENBMS.TBL_CORS tco';
        query += ' WHERE tco.cc_seq = ' + ccInfo.cc_seq + ''; 
        query += ' ORDER BY tco.cors_group_nm ASC, tco.cors_group_order ASC, tco.cors_seq ASC';

    let queryResult, rows = [];
    try {
        queryResult = await global.mysqlPool.query(query);
    } catch (error) {
        console.log({code: '[query select error]', message: ' cors query error'});
        console.log(error);

        return rows;
    }
    if (queryResult == null || queryResult[0].length == 0) {
        console.log({code: '[query result error]', message: ' cors empty'});

        return rows;
    }
    rows = queryResult[0];

    return rows;
}

// 코스 list로 홀 list 가져오기
exports.getHoleList = async (corsList) => {
    // 1. 코스 list -> 홀 테이블 순으로 조회
    let query = 'SELECT th.cors_seq, th.hole_seq, th.hole_nm, th.hole_meter, th.hole_par, th.lat, th.lon, th.view_yn';
        query += ' FROM OPENBMS.TBL_HOLE th';
        query += ' WHERE th.cors_seq IN (' + corsList.map(e => e.cors_seq).join(',') + ')';
        query += ' ORDER BY th.cors_seq ASC, th.ordr ASC';

    let queryResult, rows = [];
    try {
        queryResult = await global.mysqlPool.query(query);
    } catch (error) {
        console.log({code: '[query select error]', message: ' hole query error'});
        console.log(error);

        return rows;
    }
    if (queryResult == null || queryResult[0].length == 0) {
        console.log({code: '[query result error]', message: ' hole empty'});

        return rows;
    }
    rows = queryResult[0];

    return rows;
}

// 홀 list로 홀 loc list 가져오기
exports.getHoleLocList = async (holeList) => {
    // 1. 홀 list -> 홀 loc 테이블 순으로 조회
    let query = 'SELECT tcg.hole_seq, tcg.lat, tcg.lon';
        query += ' FROM OPENBMS.TMP_CORS_GPS tcg';
        query += ' WHERE tcg.hole_seq IN (' + holeList.map(e => e.hole_seq).join(',') + ')';
        query += ' ORDER BY tcg.hole_seq ASC, tcg.ordr ASC';

    let queryResult, rows = [];
    try {
        queryResult = await global.mysqlPool.query(query);
    } catch (error) {
        console.log({code: '[query select error]', message: ' hole loc query error'});
        console.log(error);

        return rows;
    }
    if (queryResult == null || queryResult[0].length == 0) {
        console.log({code: '[query result error]', message: ' hole loc empty'});

        return rows;
    }
    rows = queryResult[0];

    return rows;
}

// 회사번호로 카트 list 가져오기
exports.getCartList = async (cmpySeq) => {
    // 1. 회사 seq -> 카트 테이블 순으로 조회
    let query = 'SELECT tc.cart_seq, tc.cart_nm, tc.cart_stat';
        query += ' FROM OPENBMS.TBL_CART tc';
        query += ' WHERE tc.cc_seq = (';
        query += '     SELECT tcc.cc_seq';
        query += '     FROM OPENBMS.TBL_CC tcc';
        query += '     WHERE tcc.cmpy_seq = "' + cmpySeq + '"';
        query += '     LIMIT 1';
        query += ' )';

    let queryResult, rows = [];
    try {
        queryResult = await global.mysqlPool.query(query);
    } catch (error) {
        console.log({code: '[query select error]', message: ' cart query error'});
        console.log(error);

        return rows;
    }
    if (queryResult == null || queryResult[0].length == 0) {
        console.log({code: '[query result error]', message: ' cart empty'});

        return rows;
    }
    rows = queryResult[0];

    return rows;
}

// 카트 list로 배터리 list 가져오기
exports.getBtryList = async (cartList) => {
    // 1. 카트 list -> 카트-배터리 매핑 테이블 -> 배터리 + 배터리 마지막 상태 테이블 순으로 조인 조회
    let query = 'SELECT a.cart_seq, a.btry_seq, ROUND(tbls.soc, 2) AS soc, tbls.lat, tbls.lon, tb.btry_mng_stat, tbls.last_biz_dttm, tbls.chrg_stat_cd';
        query += ' FROM (';
        query += '     SELECT mcb.cart_seq, mcb.btry_seq';
        query += '     FROM OPENBMS.MPP_CART_BTRY mcb';
        query += '     WHERE mcb.cart_seq IN (' + cartList.map(e => e.cart_seq).join(',') + ')';
        query += ' ) a';
        query += ' LEFT OUTER JOIN OPENBMS.TBL_BTRY tb';
        query += ' ON a.btry_seq = tb.btry_seq';
        query += ' LEFT OUTER JOIN OPENBMS.TBL_BTRY_LAST_STAT tbls';
        query += ' ON a.btry_seq = tbls.btry_seq';

    let queryResult, rows = [];
    try {
        queryResult = await global.mysqlPool.query(query);
    } catch (error) {
        console.log({code: '[query select error]', message: ' btry query error'});
        console.log(error);

        return rows;
    }
    if (queryResult == null || queryResult[0].length == 0) {
        console.log({code: '[query result error]', message: ' btry empty'});

        return rows;
    }
    rows = queryResult[0];

    return rows;
}