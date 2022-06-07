const path = require('path');
const Pagination = require(path.join(global.appRoot, '/modules/pagination.js'));

// 배터리 리스트(+ 카트) 가져오기
exports.getBtryCartList = async (cmpySeq, param, yesterday, page, size) => {
    // 1. 전체 개수 가져오기
    let stat = param['stat'];
    let statChk = (stat == 'DC' || stat == 'C' || stat == 'W' ? 'V' : param['stat']);

    let query1 = 'SELECT COUNT(*) AS cnt';
        query1 += ' FROM (';
        query1 += '     SELECT a.cart_seq, a.cart_stat, a.cart_nm, mcb.btry_seq';
        query1 += '     FROM (';
        query1 += '         SELECT tca.cart_seq, tca.cart_stat, tca.cart_nm';
        query1 += '         FROM OPENBMS.TBL_CART tca';
        query1 += '         WHERE tca.cc_seq = (';
        query1 += '             SELECT tcc.cc_seq';
        query1 += '             FROM OPENBMS.TBL_CC tcc';
        query1 += '             WHERE tcc.cmpy_seq = "' + cmpySeq + '"';
        query1 += '             LIMIT 1';
        query1 += '         )';
    if (statChk == 'V') {
        query1 += '         AND IFNULL(tca.cart_stat, "N") = "Y"';
    }
        query1 += '     ) a';
        query1 += '     LEFT OUTER JOIN OPENBMS.MPP_CART_BTRY mcb';
        query1 += '     ON a.cart_seq = mcb.cart_seq';
        query1 += ' ) b';
        query1 += ' LEFT OUTER JOIN OPENBMS.TBL_BTRY tb';
        query1 += ' ON b.btry_seq = tb.btry_seq';
        query1 += ' LEFT OUTER JOIN OPENBMS.TBL_BTRY_LAST_STAT tbls';
        query1 += ' ON b.btry_seq = tbls.btry_seq';
        query1 += ' WHERE DATE_FORMAT(tb.install_dttm, "%Y%m%d") >= "' + param['insStart'] + '"';
        query1 += ' AND DATE_FORMAT(tb.install_dttm, "%Y%m%d") <= "' + param['insEnd'] + '"';
        query1 += ' AND IFNULL(tbls.soc, 0) >= "' + param['socStart'] + '"';
        query1 += ' AND IFNULL(tbls.soc, 0) <= "' + param['socEnd'] + '"';
    if (statChk == 'V') {
        query1 += ' AND IFNULL(tb.btry_mng_stat, "N") = "Y"';
        query1 += ' AND tbls.last_biz_dttm >= STR_TO_DATE("' + yesterday + '", "%Y-%m-%d %H:%i:%s")';
        query1 += ' AND tbls.chrg_stat_cd = "' + stat + '"';
    } else if (statChk == 'I') {
        query1 += ' AND (';
        query1 += '     IFNULL(b.cart_stat, "N") = "N"';
        query1 += '     OR IFNULL(tb.btry_mng_stat, "N") = "N"';
        query1 += '     OR tbls.last_biz_dttm IS NULL';
        query1 += '     OR tbls.last_biz_dttm < STR_TO_DATE("' + yesterday + '", "%Y-%m-%d %H:%i:%s")';
        query1 += ' )';
    }

    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query select error]', message: ' btry cart count query error'});
        console.log(error);

        return rows1;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query result error]', message: ' btry cart count empty'});

        return rows1;
    }
    rows1 = queryResult1[0];

    // 2. 페이징 생성
    let paging = new Pagination(rows1[0].cnt, page, size);
        paging.getPages(size);

    // 3. 페이지에 해당되는만큼 select
    let query2 = 'SELECT';
        query2 += '     b.cart_seq, IFNULL(b.cart_stat, "N") AS cart_stat, b.cart_nm,';
        query2 += '     b.btry_seq, IFNULL(tb.btry_mng_stat, "N") AS btry_stat, tb.btry_nm, tb.install_dttm,';
        query2 += '     tbls.last_biz_dttm, tbls.chrg_stat_cd, ROUND(IFNULL(tbls.soc, 0), 2) AS soc';
        query2 += ' FROM (';
        query2 += '     SELECT a.cart_seq, a.cart_stat, a.cart_nm, mcb.btry_seq';
        query2 += '     FROM (';
        query2 += '         SELECT tca.cart_seq, tca.cart_stat, tca.cart_nm';
        query2 += '         FROM OPENBMS.TBL_CART tca';
        query2 += '         WHERE tca.cc_seq = (';
        query2 += '             SELECT tcc.cc_seq';
        query2 += '             FROM OPENBMS.TBL_CC tcc';
        query2 += '             WHERE tcc.cmpy_seq = "' + cmpySeq + '"';
        query2 += '             LIMIT 1';
        query2 += '         )';
    if (statChk == 'V') {
        query2 += '         AND IFNULL(tca.cart_stat, "N") = "Y"';
    }
        query2 += '     ) a';
        query2 += '     LEFT OUTER JOIN OPENBMS.MPP_CART_BTRY mcb';
        query2 += '     ON a.cart_seq = mcb.cart_seq';
        query2 += ' ) b';
        query2 += ' LEFT OUTER JOIN OPENBMS.TBL_BTRY tb';
        query2 += ' ON b.btry_seq = tb.btry_seq';
        query2 += ' LEFT OUTER JOIN OPENBMS.TBL_BTRY_LAST_STAT tbls';
        query2 += ' ON b.btry_seq = tbls.btry_seq';
        query2 += ' WHERE DATE_FORMAT(tb.install_dttm, "%Y%m%d") >= "' + param['insStart'] + '"';
        query2 += ' AND DATE_FORMAT(tb.install_dttm, "%Y%m%d") <= "' + param['insEnd'] + '"';
        query2 += ' AND IFNULL(tbls.soc, 0) >= "' + param['socStart'] + '"';
        query2 += ' AND IFNULL(tbls.soc, 0) <= "' + param['socEnd'] + '"';
    if (statChk == 'V') {
        query2 += ' AND IFNULL(tb.btry_mng_stat, "N") = "Y"';
        query2 += ' AND tbls.last_biz_dttm >= STR_TO_DATE("' + yesterday + '", "%Y-%m-%d %H:%i:%s")';
        query2 += ' AND tbls.chrg_stat_cd = "' + stat + '"';
    } else if (statChk == 'I') {
        query2 += ' AND (';
        query2 += '     IFNULL(b.cart_stat, "N") = "N"';
        query2 += '     OR IFNULL(tb.btry_mng_stat, "N") = "N"';
        query2 += '     OR tbls.last_biz_dttm IS NULL';
        query2 += '     OR tbls.last_biz_dttm < STR_TO_DATE("' + yesterday + '", "%Y-%m-%d %H:%i:%s")';
        query2 += ' )';
    }
        query2 += ' ORDER BY tb.install_dttm DESC';
        query2 += ' LIMIT ' + paging.limit;

    let queryResult2, rows2 = [];
    try {
        queryResult2 = await global.mysqlPool.query(query2);
    } catch (error) {
        console.log({code: '[query select error]', message: ' btry cart list query error'});
        console.log(error);

        return rows2;
    }
    if (queryResult2 == null || queryResult2[0].length == 0) {
        console.log({code: '[query result error]', message: ' btry cart list empty'});

        return rows2;
    }
    rows2 = queryResult2[0];

    return { paging: paging, rows: rows2 };
}

// 배터리 정보 가져오기
exports.getBtryInfo = async (btrySeq) => {
    let query = 'SELECT';
        query += '     b.btry_nm, b.btry_mfctor_nm AS btry_mftr, b.btry_mng_stat AS btry_stat, b.btry_max_pwr AS btry_pw, IFNULL(b.btry_chrg_cnt, 0) AS btry_chrg_cnt,';
        query += '     c.last_biz_dttm AS last_dttm, c.chrg_stat_cd, IFNULL(ROUND(c.soc, 2), 0) AS soc,';
        query += '     tm.mdl_no AS mdl_nm, tm.mdl_mftr AS mdl_mftr_cd, tm.btry_ty AS btry_ty_cd';
        query += ' FROM (';
        query += '     SELECT mbm.btry_seq, mbm.mdl_seq';
        query += '     FROM OPENBMS.MPP_BTRY_MDL mbm';
        query += '     WHERE mbm.btry_seq = "' + btrySeq + '"';
        query += ' ) a';
        query += ' LEFT OUTER JOIN (';
        query += '     SELECT';
        query += '         tb.btry_seq, tb.btry_nm, tb.btry_mfctor_nm, tb.btry_mng_stat, tb.btry_max_pwr,';
        query += '         (SELECT COUNT(*) FROM OPENBMS.TBL_PTC_BIZ_STAT tpbs WHERE tpbs.btry_seq = "' + btrySeq + '" AND tpbs.type_cd = "C") AS btry_chrg_cnt';
        query += '     FROM OPENBMS.TBL_BTRY tb';
        query += '     WHERE tb.btry_seq = "' + btrySeq + '"';
        query += ' ) b';
        query += ' ON a.btry_seq = b.btry_seq';
        query += ' LEFT OUTER JOIN (';
        query += '     SELECT tbls.btry_seq, tbls.last_biz_dttm, tbls.chrg_stat_cd, tbls.soc';
        query += '     FROM OPENBMS.TBL_BTRY_LAST_STAT tbls';
        query += '     WHERE tbls.btry_seq = "' + btrySeq + '"';
        query += ' ) c';
        query += ' ON a.btry_seq = c.btry_seq';
        query += ' LEFT OUTER JOIN OPENBMS.TBL_MDL tm';
        query += ' ON a.mdl_seq = tm.mdl_seq';

    let queryResult, rows = [];
    try {
        queryResult = await global.mysqlPool.query(query);
    } catch (error) {
        console.log({code: '[query select error]', message: ' btry info query error'});
        console.log(error);

        return rows;
    }
    if (queryResult == null || queryResult[0].length == 0) {
        console.log({code: '[query result error]', message: ' btry info empty'});

        return rows;
    }
    rows = queryResult[0];

    return rows[0];
}

// 배터리 정보 가져오기
exports.getTTTTTT = async (btrySeq, date) => {
    let query = 'SELECT TIME_TO_SEC(STR_TO_DATE(CONCAT(MID(TPBD.biz_key, 9, 5), "0"), "%H%i%s")) AS key1, TPBD.soc, TPBD.chrg_stat_cd';
        query += ' FROM OPENBMS.TBL_PTC_BIZ_DATA TPBD';
        query += ' WHERE TPBD.btry_seq = "' + btrySeq + '"';
        query += ' AND LEFT(TPBD.biz_key, 8) = "' + date + '"';
        query += ' GROUP BY TPBD.biz_key';
        query += ' ORDER BY TPBD.biz_key ASC';

    let queryResult, rows = [];
    try {
        queryResult = await global.mysqlPool.query(query);
    } catch (error) {
        console.log({code: '[query select error]', message: ' btry info query error'});
        console.log(error);

        return rows;
    }
    if (queryResult == null || queryResult[0].length == 0) {
        console.log({code: '[query result error]', message: ' btry info empty'});

        return rows;
    }
    rows = queryResult[0];

    return rows;
}

// X시간 이내의 데이터 가져오기
exports.getBtryDthList = async (cmpySeq, btrySeq, endDth, count) => {
    let query = 'SELECT tsh.sttc_dt, tsh.sttc_hour, tsh.max_volt, tsh.min_volt, tsh.max_curr, tsh.min_curr, tsh.max_tp, tsh.min_tp';
        query += ' FROM OPENBMS.TBL_STTC_HOUR tsh';
        query += ' WHERE tsh.btry_seq = "' + btrySeq + '"';
		if (cmpySeq) {
			query += ' AND tsh.cmpy_seq = "' + cmpySeq + '"';
		}
        query += ' AND CONCAT(tsh.sttc_dt, tsh.sttc_hour) >= DATE_FORMAT(DATE_ADD(STR_TO_DATE("' + endDth + '", "%Y%m%d%H"), INTERVAL -' + count + ' HOUR), "%Y%m%d%H")';
        query += ' AND CONCAT(tsh.sttc_dt, tsh.sttc_hour) <= "' + endDth + '"';
        query += ' ORDER BY tsh.sttc_dt ASC, tsh.sttc_hour ASC';

    let queryResult, rows = [];
    try {
        queryResult = await global.mysqlPool.query(query);
    } catch (error) {
        console.log({code: '[query select error]', message: ' btry dth query error'});
        console.log(error);

        return rows;
    }
    if (queryResult == null || queryResult[0].length == 0) {
        console.log({code: '[query result error]', message: ' btry dth empty'});

        return rows;
    }
    rows = queryResult[0];

    return rows;
}

// 어제까지의 데이터 가져오기
exports.getDailyList = async (cmpySeq, btrySeq, page, size) => {
    // 1. 전체 개수 가져오기
    let query1 = 'SELECT COUNT(*) AS cnt';
        query1 += ' FROM OPENBMS.TBL_STTC_DAY tsd';
        query1 += ' WHERE tsd.btry_seq = "' + btrySeq + '"';
		if (cmpySeq) {
			query1 += ' AND tsd.cmpy_seq = "' + cmpySeq + '"';
		}

    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query select error]', message: ' daily count query error'});
        console.log(error);

        return rows1;
    }
    if (queryResult1 == null || queryResult1[0].length == 0) {
        console.log({code: '[query result error]', message: ' daily count empty'});

        return rows1;
    }
    rows1 = queryResult1[0];

    // 2. 페이징 생성
    let paging = new Pagination(rows1[0].cnt, page, size);
        paging.getPages(size);

    // 3. 페이지에 해당되는만큼 select
    let query2 = 'SELECT';
        query2 += '     DATE_FORMAT(tsd.sttc_dt, "%Y-%m-%d") AS sttc_dt,';
        query2 += '     ROUND(tsd.max_volt, 2) AS max_volt, ROUND(tsd.min_volt, 2) AS min_volt,';
        query2 += '     ROUND(tsd.max_curr, 2) AS max_curr, ROUND(tsd.min_curr, 2) AS min_curr,';
        query2 += '     ROUND(tsd.max_tp, 2) AS max_tp, ROUND(tsd.min_tp, 2) AS min_tp';
        query2 += ' FROM OPENBMS.TBL_STTC_DAY tsd';
        query2 += ' WHERE tsd.btry_seq = "' + btrySeq + '"';
		if (cmpySeq) {
        	query2 += ' AND tsd.cmpy_seq = "' + cmpySeq + '"';
		}
        query2 += ' ORDER BY tsd.sttc_dt DESC';
        query2 += ' LIMIT ' + paging.limit;

    let queryResult2, rows2 = [];
    try {
        queryResult2 = await global.mysqlPool.query(query2);
    } catch (error) {
        console.log({code: '[query select error]', message: ' daily query error'});
        console.log(error);

        return rows2;
    }
    if (queryResult2 == null || queryResult2[0].length == 0) {
        console.log({code: '[query result error]', message: ' daily empty'});

        return rows2;
    }
    rows2 = queryResult2[0];

    return { paging: paging, rows: rows2 };
}

// 배터리의 간격 내역
exports.getBtryPeriod = async (cmpySeq, btrySeq, prevDt, nowDt, nextDt) => {
    let query1 = 'SELECT DATE_FORMAT(tpbs.end_dttm, "%Y%m%d%H%i") AS end_dtm';
        query1 += ' FROM OPENBMS.TBL_PTC_BIZ_STAT tpbs';
        query1 += ' WHERE tpbs.btry_seq = "' + btrySeq + '"';
        if (cmpySeq) {
			query1 += ' AND tpbs.cmpy_seq = "' + cmpySeq + '"';
		}
        query1 += ' AND tpbs.end_dttm >= STR_TO_DATE("' + prevDt + '", "%Y%m%d")';
        query1 += ' AND tpbs.end_dttm < STR_TO_DATE("' + nowDt + '", "%Y%m%d")';
        query1 += ' ORDER BY tpbs.end_dttm DESC';
        query1 += ' LIMIT 1';

    let queryResult1, rows1 = [];
    try {
        queryResult1 = await global.mysqlPool.query(query1);
    } catch (error) {
        console.log({code: '[query select error]', message: ' btry prev period query error'});
        console.log(error);

        return { prev: undefined, nowList: [] };
    }
    if (queryResult1 == null) {
        console.log({code: '[query result error]', message: ' btry prev period empty'});

        return { prev: undefined, nowList: [] };
    }
    rows1 = queryResult1[0];
    
    let query2 = 'SELECT';
        query2 += '     tpbs.type_cd,';
        query2 += '     TIMESTAMPDIFF(MINUTE, DATE_FORMAT(tpbs.start_dttm, "%Y-%m-%d %H:%i"), DATE_FORMAT(tpbs.end_dttm, "%Y-%m-%d %H:%i")) AS period_m,';
        query2 += '     DATE_FORMAT(tpbs.start_dttm, "%Y%m%d%H%i") AS start_dtm,';
        query2 += '     ROUND(tpbs.start_volt, 2) AS start_volt, ROUND(tpbs.start_curr, 2) AS start_curr, ROUND(tpbs.start_tp, 2) AS start_tp, ROUND(tpbs.start_soc, 2) AS start_soc,';
        query2 += '     DATE_FORMAT(tpbs.end_dttm, "%Y%m%d%H%i") AS end_dtm,';
        query2 += '     ROUND(tpbs.end_volt, 2) AS end_volt, ROUND(tpbs.end_curr, 2) AS end_curr, ROUND(tpbs.end_tp, 2) AS end_tp, ROUND(tpbs.end_soc, 2) AS end_soc';
        query2 += ' FROM OPENBMS.TBL_PTC_BIZ_STAT tpbs';
        query2 += ' WHERE tpbs.btry_seq = "' + btrySeq + '"';
		if (cmpySeq) {
			query2 += ' AND tpbs.cmpy_seq = "' + cmpySeq + '"';
		}
        query2 += ' AND NOT (';
        query2 += '     (tpbs.start_dttm < STR_TO_DATE("' + nowDt + '", "%Y%m%d") AND tpbs.end_dttm < STR_TO_DATE("' + nowDt + '", "%Y%m%d"))';
        query2 += '     OR';
        query2 += '     (tpbs.start_dttm >= STR_TO_DATE("' + nextDt + '", "%Y%m%d") AND tpbs.end_dttm >= STR_TO_DATE("' + nextDt + '", "%Y%m%d"))';
        query2 += ' )';
        query2 += ' ORDER BY tpbs.start_key ASC';

    let queryResult2, rows2 = [];
    try {
        queryResult2 = await global.mysqlPool.query(query2);
    } catch (error) {
        console.log({code: '[query select error]', message: ' btry period query error'});
        console.log(error);

        return { prev: rows1[0], nowList: rows2 };
    }
    if (queryResult2 == null || queryResult2[0].length == 0) {
        console.log({code: '[query result error]', message: ' btry period empty'});

        return { prev: rows1[0], nowList: rows2 };
    }
    rows2 = queryResult2[0];

    return { prev: rows1[0], nowList: rows2 };
}