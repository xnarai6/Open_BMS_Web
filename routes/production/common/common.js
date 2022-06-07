const path = require("path");
const Pagination = require(path.join(global.appRoot,"/modules/pagination.js"));
const utiljs = require(path.join(global.appRoot,"/modules/util.js"));

exports.readDashCard = (req, res, next) => {
    console.log("readDashCard start");  

    var _render = res.render;
    res.render = async function(view, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        } else if (!options) {
            options = {};
        }

        sess = req.session;      
        var acnt_seq = sess.acnt_seq;
        var acnt_role = sess.userInfo.acnt_role;
        var cmpy_seq = sess.userInfo.cmpy_seq;

        let selectsql1 = "";

        if(acnt_role == 'SA'){
            selectsql1 = "SELECT  tb.btry_nm, tb.btry_seq, tb.btry_max_pwr, MAX(CONCAT(tpbd.biz_dt,tpbd.biz_h,tpbd.biz_m,'00')) AS dttm, tpbd.chrg_stat_cd ";
            selectsql1 += "FROM OPENBMS.TBL_BTRY tb ";
            selectsql1 += "LEFT OUTER JOIN OPENBMS.TBL_PTC_BIZ_DATA tpbd ON tpbd.btry_seq = tb.btry_seq AND CONCAT(tpbd.biz_dt,tpbd.biz_h,tpbd.biz_m) = (SELECT MAX(CONCAT(tpbd2.biz_dt,tpbd2.biz_h,tpbd2.biz_m)) FROM OPENBMS.TBL_PTC_BIZ_DATA tpbd2) ";
            selectsql1 += "GROUP BY tb.btry_seq;";
        }else{
            selectsql1 += 'SELECT tb.btry_seq, tb.btry_nm, tb.btry_max_pwr, tbls.chrg_stat_cd, DATE_FORMAT(tbls.last_biz_dttm, "%Y%m%d%H%s%i") AS dttm';
            selectsql1 += ' FROM OPENBMS.MPP_CMPY_BTRY mcb';
            selectsql1 += ' LEFT OUTER JOIN OPENBMS.TBL_BTRY tb';
            selectsql1 += ' ON mcb.btry_seq = tb.btry_seq';
            selectsql1 += ' LEFT OUTER JOIN OPENBMS.TBL_BTRY_LAST_STAT tbls';
            selectsql1 += ' ON mcb.btry_seq = tbls.btry_seq';
            selectsql1 += ' WHERE mcb.cmpy_seq = "' + cmpy_seq + '"';
        }

        let [row1] = await global.mysqlPool.query(selectsql1);
        
        var i=0;
        var retdata = new Object();
        retdata.sum_bty_max_pwr = 0;
        retdata.btry_stat_total_cnt = 0;
        retdata.btry_stat_charge_cnt = 0;
        retdata.btry_stat_discharge_cnt = 0;
        retdata.btry_stat_block_cnt = 0;    
        var sum_bty_max_pwr = 0;
        
        retdata.acnt_seq = sess.userInfo.acnt_seq;
        retdata.acnt_id = sess.userInfo.acnt_id;
        retdata.acnt_nm = sess.userInfo.acnt_nm;
        retdata.acnt_role = sess.userInfo.acnt_role;
        
        for(var i = 0; i < row1.length; i++){
            if (row1[i].dttm != null){
                var ins = new Date(row1[i].dttm);
                var now = new Date();
    
                var diff = (now.getTime() - ins.getTime())/1000/60/60;
               // console.log(diff);
    
                //biz_data 마지막 ins_dttm이 하루 전
            //    if ( diff > 24){
             //       retdata.btry_stat_block_cnt += 1;
              //  } else {

                    if (row1[i].chrg_stat_cd == 'C'){
                        retdata.btry_stat_charge_cnt += 1;
                       // console.log("row1[i].btry_max_pwr:"+row1[i].btry_max_pwr);
                        sum_bty_max_pwr = sum_bty_max_pwr + (row1[i].btry_max_pwr * 1);
                    } else if (row1[i].chrg_stat_cd == 'DC'){
                        retdata.btry_stat_discharge_cnt += 1;
                        //console.log("row1[i].btry_max_pwr:"+row1[i].btry_max_pwr);
                        sum_bty_max_pwr = sum_bty_max_pwr + (row1[i].btry_max_pwr * 1);
                    } else {
                        retdata.btry_stat_block_cnt += 1;
                    }
             //   }
            } else {
                retdata.btry_stat_block_cnt += 1;
            }
        }

        retdata.btry_stat_total_cnt = row1.length;

        // do {
        //     console.log("row1["+i+"]:"+row1[i].sum_bty_max_pwr);
            
        //     if(row1[i].btry_stat =="C"){
        //         retdata.btry_stat_charge_cnt = row1[i].sum_btry_stat;
        //         retdata.sum_bty_max_pwr = retdata.sum_bty_max_pwr + row1[i].sum_bty_max_pwr;  
        //     }else if(row1[i].btry_stat =="D"){
        //         retdata.btry_stat_discharge_cnt = row1[i].sum_btry_stat;
        //         retdata.sum_bty_max_pwr =retdata.sum_bty_max_pwr + row1[i].sum_bty_max_pwr;   
        //     }else if(row1[i].btry_stat =="Y"){
        //         retdata.btry_stat_standby_cnt = row1[i].sum_btry_stat;
        //         retdata.sum_bty_max_pwr =retdata.sum_bty_max_pwr + row1[i].sum_bty_max_pwr;   
        //     }else if(row1[i].btry_stat =="N"){
        //         retdata.btry_stat_block_cnt = row1[i].sum_btry_stat;
        //         retdata.sum_bty_max_pwr = retdata.sum_bty_max_pwr + row1[i].sum_bty_max_pwr;   
        //     }
            
        //     i++;
        // }while (row1[i])

        var pwrAndUnit = utiljs.unitConvertWithComma(sum_bty_max_pwr);
        retdata.sum_bty_max_pwr = pwrAndUnit.power;
        retdata.sum_bty_max_pwr_unit = pwrAndUnit.unit;

        Object.assign(options, {retdata: retdata });
        _render.call(this, view, options, callback);
    }
    next();
}

// 제조업체에서 등록한 배터리 목록과 배터리 목록이 설치된 회사
exports.getBtryGroupByCmpy = async (cmpy_seq) => {

    let query = "SELECT a.*, tc.cmpy_nm ";
        query+= "FROM ( ";
        query+= "   SELECT mcb1.cmpy_seq, COUNT(*) AS cnt, GROUP_CONCAT(CAST(mcb1.btry_seq AS CHAR(10))) AS btry_seq_group ";
        query+= "   FROM OPENBMS.MPP_CMPY_BTRY mcb1 ";
        query+= "   WHERE mcb1.cmpy_seq != " + cmpy_seq +" ";
        query+= "   AND mcb1.btry_seq IN ( ";
        query+= "      SELECT mcb2.btry_seq ";
        query+= "      FROM OPENBMS.MPP_CMPY_BTRY mcb2 ";
        query+= "      WHERE mcb2.cmpy_seq = " + cmpy_seq + " ";
        query+= "   ) ";
        query+= "   GROUP BY mcb1.cmpy_seq ";
        query+= ") a ";
        query+= "LEFT OUTER JOIN OPENBMS.TBL_CMPY tc ";
        query+= "ON a.cmpy_seq = tc.cmpy_seq ";

    let queryResult, rows = [];
    try {
        queryResult = await global.mysqlPool.query(query);
    } catch (error) {
        console.log({code: '[query select error]', message: ' getBtryGroupByCmpy query error'});
        console.log(error);

        return rows;
    }
    if (queryResult == null || queryResult[0].length == 0) {
        console.log({code: '[query result error]', message: ' getBtryGroupByCmpy empty'});

        return rows;
    }
    rows = queryResult[0];

    var allCmpy = "";
    var allBtry = "";

    for(var i in rows){
        if(i==(rows.length-1)){
            allCmpy += rows[i].cmpy_seq;
            allBtry += rows[i].btry_seq_group;
            break;
        }
        allCmpy += rows[i].cmpy_seq + ",";
        allBtry += rows[i].btry_seq_group + ",";
    }

    if(allCmpy == null || allCmpy == ""){
        allCmpy = "-1";
    }
    if(allBtry == null || allBtry == ""){
        allBtry = "-1";
    }

    rows.unshift({
        cmpy_seq: allCmpy,
        cnt: 0,
        btry_seq_group: allBtry,
        cmpy_nm: "전체"
    });

    return rows;
}

// 수요업체별 배터리 상태
exports.getBtryStatusByCmpy = async (cmpy_seq, btry_seq_group) => {

    let query = "SELECT tb.btry_seq,tb.btry_nm, tcmpy.cmpy_seq, tcmpy.cmpy_nm, ";
        query+= "IFNULL(tbls.chrg_stat_cd,'W') AS btry_stat, ";
        query+= "IFNULL(tc2.cd_desc,(SELECT tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd='btry_stat' AND tc.cd = 'W')) AS btry_stat_desc ";
        query+= "FROM OPENBMS.TBL_BTRY tb ";
        query+= "LEFT JOIN OPENBMS.MPP_CMPY_BTRY mcb ON mcb.btry_seq = tb.btry_seq ";
        query+= "LEFT JOIN OPENBMS.TBL_CMPY tcmpy ON tcmpy.cmpy_seq = mcb.cmpy_seq ";
        query+= "LEFT JOIN OPENBMS.TBL_BTRY_LAST_STAT tbls ON tbls.btry_seq = tb.btry_seq AND tbls.last_biz_dttm > DATE_FORMAT(DATE_ADD(SYSDATE(),INTERVAL -1 DAY),'%Y-%m-%d %H:%i:%S') ";
        query+= "LEFT JOIN OPENBMS.TBL_CD tc2 ON tc2.cd = tbls.chrg_stat_cd AND tc2.gp_cd = 'btry_stat' ";
        if(cmpy_seq != null && cmpy_seq != ""){
            query+= "WHERE tcmpy.cmpy_seq IN (" + cmpy_seq + ") ";
        }
        if(btry_seq_group != null && btry_seq_group != ""){
            query+= "AND tb.btry_seq IN (" + btry_seq_group + ") ";
        }  

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

    return rows;
}

// 배터리 타입별 배터리 상태
exports.getBtryStatusByBtryType = async (cmpy_seq,btry_ty) => {

    console.log("start getBtryStatusByBtryType in Production");

    let seqRow = await this.getBtryGroupByCmpy(cmpy_seq);
    var cmpy_seq_group = "";
    var btry_seq_group = "";

    for(var i in seqRow){
        if(seqRow[i].cmpy_nm=="전체"){
            cmpy_seq_group = seqRow[i].cmpy_seq;
            btry_seq_group = seqRow[i].btry_seq_group;
        }
    }

    let query = "SELECT tb.btry_seq,tb.btry_nm, tm.btry_ty, tc3.cd_desc AS btry_ty_desc, ";
        query+= "IFNULL(tbls.chrg_stat_cd,'W') AS btry_stat, ";
        query+= "IFNULL(tc2.cd_desc,(SELECT tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd='btry_stat' AND tc.cd = 'W')) AS btry_stat_desc ";
        query+= "FROM OPENBMS.TBL_BTRY tb ";
        query+= "LEFT JOIN OPENBMS.TBL_MDL tm ON tm.mdl_seq = tb.mdl_seq ";
        query+= "LEFT JOIN OPENBMS.MPP_CMPY_BTRY mcb ON mcb.btry_seq = tb.btry_seq  ";
        query+= "LEFT JOIN OPENBMS.TBL_CMPY tcmpy ON tcmpy.cmpy_seq = mcb.cmpy_seq ";
        query+= "LEFT JOIN OPENBMS.TBL_BTRY_LAST_STAT tbls ON tbls.btry_seq = tb.btry_seq AND tbls.last_biz_dttm > DATE_FORMAT(DATE_ADD(SYSDATE(),INTERVAL -1 DAY),'%Y-%m-%d %H:%i:%S') ";
        query+= "LEFT JOIN OPENBMS.TBL_CD tc2 ON tc2.cd = tbls.chrg_stat_cd AND tc2.gp_cd = 'btry_stat' ";
        query+= "LEFT JOIN OPENBMS.TBL_CD tc3 ON tc3.cd = tm.btry_ty AND tc3.gp_cd = 'btry_ty' ";
        if(btry_ty == null || btry_ty == 'all' || btry_ty == ''){
            query+= "WHERE 1=1 ";
        }else{
            query+= "WHERE tm.btry_ty = '" + btry_ty + "' ";
        }
        query+= "AND tcmpy.cmpy_seq IN (" + cmpy_seq_group + ") ";
        query+= "AND tb.btry_seq IN (" + btry_seq_group + ") ";

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

    return rows;
}
// 코드 그룹 array로 코드 정보 가져오기
exports.getCodeList = async (gpArray) => {
    let query = 'SELECT tcd.gp_cd, tcd.gp_cd_desc, tcd.cd, tcd.cd_desc';
        query += ' FROM OPENBMS.TBL_CD tcd';
        query += ' WHERE tcd.gp_cd IN ("' + gpArray.join('","') + '")';
        query += ' ORDER BY tcd.gp_cd, tcd.cd';

    let queryResult, rows = [];
    try {
        queryResult = await global.mysqlPool.query(query);
    } catch (error) {
        console.log({code: '[query select error]', message: ' code query error'});
        console.log(error);

        return rows;
    }
    if (queryResult == null || queryResult[0].length == 0) {
        console.log({code: '[query result error]', message: ' code empty'});

        return rows;
    }
    rows = queryResult[0];

    return rows;
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
        query += '         (SELECT SUM(tsd.chrg_cnt) FROM TBL_STTC_DAY tsd WHERE tsd.btry_seq = "' + btrySeq + '") AS btry_chrg_cnt';
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
        query2 += ' DATE_FORMAT(tsd.sttc_dt, "%Y-%m-%d") AS sttc_dt,';
        query2 += ' ROUND(tsd.max_volt, 2) AS max_volt, ROUND(tsd.min_volt, 2) AS min_volt,';
        query2 += ' ROUND(tsd.max_curr, 2) AS max_curr, ROUND(tsd.min_curr, 2) AS min_curr,';
        query2 += ' ROUND(tsd.max_tp, 2) AS max_tp, ROUND(tsd.min_tp, 2) AS min_tp';
        query2 += ' FROM OPENBMS.TBL_STTC_DAY tsd';
        query2 += ' WHERE tsd.btry_seq = "' + btrySeq + '"';
		if (cmpySeq) {
			query2 += ' WHERE tsd.cmpy_seq = "' + cmpySeq + '"';
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