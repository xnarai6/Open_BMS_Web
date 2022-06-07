// const asyncWrapper = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next());
// const form = require('../../config/form.js');

const { globalAgent } = require("http");
const path = require("path");
const Pagination = require(path.join(global.appRoot,"/modules/pagination.js"));
const utiljs = require(path.join(global.appRoot,"/modules/util.js"));
const viewName = 'operation/';
//var dateFormat = require('dateformat');

exports.getRealtimelog = async(req, res, next) => {

    try{

        var currentPage = req.body.page;

        if (currentPage == null || currentPage == '') {
            currentPage = 1;
        }

        let query1 = "SELECT COUNT(*) AS total_count ";
        query1 += "FROM OPENBMS.TBL_LOC tl ";
        query1 += "LEFT OUTER JOIN MPP_CMPY_LOC mcl ON mcl.loc_seq = tl.loc_seq ";
        //회사 seq 
        query1 += "WHERE mcl.cmpy_seq = 1;";
    
        let [row1] = await global.mysqlPool.query(query1);

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 5);
        paginate.getPages(5);

        let query2 = "SELECT tl.loc_seq, tl.loc_nm, tl.ins_dttm, tc.cmpy_seq, tc.cmpy_nm ";
        query2 += "FROM OPENBMS.TBL_LOC tl ";
        query2 += "LEFT OUTER JOIN MPP_CMPY_LOC mcl ON mcl.loc_seq = tl.loc_seq ";
        query2 += "LEFT OUTER JOIN TBL_CMPY tc ON tc.cmpy_seq = mcl.cmpy_seq "
        //회사 seq 
        query2 += "WHERE mcl.cmpy_seq = 1 ";
        query2 += "LIMIT " + paginate.limit;

        let [row2] = await global.mysqlPool.query(query2);

        res.render(viewName+"log/realtimelog", {locList: row2, liRow: paginate.pages[paginate.page - 1], pages: paginate.threePages});
    }catch(err) {
        console.log(err);
        res.send({locList : null, liRow : "1", pages : "1"});
    }
    
}

exports.getRealtimedatalog = async(req, res, next) => {

    try{
        var info = {
            btry_seq : req.query.btry_seq
            
        }
/*
        var currentPage = req.body.page;

        if (currentPage == null || currentPage == '') {
            currentPage = 1;
        }
        //var day=dateFormat(new Date(), "yyyy-mm-dd h:MM:ss");

        let query1 = "select count(*) from OPENBMS.TBL_BTRY_PTC_RCV ";
       // query1 += "where DATE(ins_dttm) >= STR_TO_DATE('2021-05-10', '%Y-%m-%d') ";
       // query1 += "AND DATE(ins_dttm) <= STR_TO_DATE('2021-05-10', '%Y-%m-%d') ";
        //회사 seq 
        query1 += " where btry_seq = 1;";
    
        console.log(query1)
        let [row1] = await global.mysqlPool.query(query1);

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 5);
        paginate.getPages(5);

        let query2 = "select * from OPENBMS.TBL_BTRY_PTC_RCV ";
        query2 += "where ";
        //query2 += " DATE(ins_dttm) >= STR_TO_DATE('2021-05-10', '%Y-%m-%d') "; 
        //query2 += "AND DATE(ins_dttm) <= STR_TO_DATE('2021-05-10', '%Y-%m-%d') ";       
        //회사 seq 
        //query2 += "AND btry_seq = 1 ";
        query2 += " btry_seq = 1 ";
        query2 += " order by ins_dttm desc ";
        query2 += "LIMIT " + paginate.limit;

        let [row2] = await global.mysqlPool.query(query2);

        console.log(row2);
*/
        //res.render("log/realtimedatalog", {locList: row2, liRow: paginate.pages[paginate.page - 1], pages: paginate.threePages});
        res.render(viewName+"log/realtimedatalog",{btry_seq:info.btry_seq});
    }catch(err) {
        console.log(err);
        res.send({locList : null, liRow : "1", pages : "1"});
    }
    
}

exports.getRealtimedataList = async(req, res, next) => {
    console.log("getRealtimedataList start");
    sess = req.session;
    var acnt_seq = sess.acnt_seq;

    // 로그인 확인
    if(acnt_seq < 0){
        res.redirect('/account/login');
    }
    var currentPage = req.body.page;
    

    if (currentPage == null || currentPage == '') {
        currentPage = 1;
    }

   var info = {
        btry_seq : req.query.btry_seq
        
    }
;
 
    let query1 = "select count(*) from OPENBMS.TBL_BTRY_PTC_RCV ";
   // query1 += "where DATE(ins_dttm) >= STR_TO_DATE('2021-05-10', '%Y-%m-%d') ";
   // query1 += "AND DATE(ins_dttm) <= STR_TO_DATE('2021-05-10', '%Y-%m-%d') ";
    //회사 seq 
    query1 += "where btry_seq = "+info.btry_seq;
    let [row1] = await global.mysqlPool.query(query1); 


    // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
    let paginate = new Pagination(row1[0].total_count, currentPage, 5);
    paginate.getPages(5);

    let selectQuery = "select * from OPENBMS.TBL_BTRY_PTC_RCV ";
  //  selectQuery += "where DATE(ins_dttm) >= STR_TO_DATE('2021-05-10', '%Y-%m-%d') "; 
   // selectQuery += "AND DATE(ins_dttm) <= STR_TO_DATE('2021-05-10', '%Y-%m-%d') ";      
    
    selectQuery += "where btry_seq = "+info.btry_seq;
    selectQuery += " order by ins_dttm desc ";
    selectQuery += "LIMIT " + paginate.limit;

    let [mRows] = await global.mysqlPool.query(selectQuery);
    
    if(mRows.length <= 0) {
        res.send("No data");
    }else{
        
        res.send({ data: mRows, liRow: paginate.pages[paginate.page - 1], pages: paginate.threePages });

    }
}


exports.postFirstLiveData = async(req, res, next) => {

    var btry_seq = req.body.bms_seq;
    
    sess = req.session;
    var acnt_seq = sess.acnt_seq;
    //사용자 cmpy_seq
    let query0 = "SELECT * FROM OPENBMS.MPP_ACNT_CMPY WHERE acnt_seq = " + acnt_seq + ";";
    let [row0] = await global.mysqlPool.query(query0);
    let cmpy_seq = row0[0].cmpy_seq;

    //그래프 처음 10개 데이터
    let query1 = "SELECT biz_key, volt_sys as volt, curr_sys as curr, soc, soh, DATE_FORMAT(ins_dttm,'%Y/%m/%d %H:%i:%s') AS ins_dttm FROM OPENBMS.TBL_PTC_BIZ_DATA ";
    query1 += "WHERE cmpy_seq = " + cmpy_seq + " AND btry_seq = " + btry_seq + " ";
    query1 += "GROUP BY biz_key "
    query1 += "ORDER BY ins_dttm DESC ";
    query1 += "LIMIT 10";

    let [rows1] = await global.mysqlPool.query(query1);

    if(rows1.length > 0){
        var currData = [];
        var voltData = [];
        var socData = [];
        var sohData = [];
        var xData = [];
    
    
        var lastKey = rows1[0].biz_key;
    
    
        for(var i = 0; i < rows1.length; i++){
            //데이터 파싱
            var time = rows1[rows1.length-1-i].biz_key.substring(8,14);
            var timeString = time.substring(0, 2) + ":" + time.substring(2,4) + ":" + time.substring(4,6);
            xData.push(timeString);
            currData.push(parseFloat(rows1[rows1.length-1-i].curr == null ? 0 : rows1[rows1.length-1-i].curr).toFixed(2));
            voltData.push(parseFloat(rows1[rows1.length-1-i].volt == null ? 0 : rows1[rows1.length-1-i].volt).toFixed(2));
            socData.push(parseFloat(rows1[rows1.length-1-i].soc == null  ? 0 : rows1[rows1.length-1-i].soc).toFixed(2));
            sohData.push(parseFloat(rows1[rows1.length-1-i].soh == null ? 0 : rows1[rows1.length-1-i].soh).toFixed(2));
        }
    
        //SOC 계산할 최대 전압
        let query2 = "SELECT btry_max_volt, btry_min_volt, btry_rat_volt, btry_rat_curr, btry_max_curr, btry_min_curr FROM OPENBMS.TBL_BTRY WHERE btry_seq = " + btry_seq + ";";
    
        let [rows2] = await global.mysqlPool.query(query2);
    
        res.send({currData: currData, voltData: voltData, socData: socData, sohData: sohData, btry_info: rows2[0], xData: xData, lastKey: lastKey, cmpySeq: cmpy_seq});
    } else {
        res.send();
    }

    
    
}

//실시간 그래프 데이터
exports.postLiveData = async(req, res, next) => {

    var btry_seq = req.body.bms_seq;
    var last_key = req.body.last_key;
    var cmpy_seq = req.body.cmpy_seq;

    try{
        let query1 = "SELECT biz_key, volt_sys as volt, curr_sys as curr, soc, soh, DATE_FORMAT(ins_dttm,'%Y/%m/%d %H:%i:%s') AS ins_dttm FROM OPENBMS.TBL_PTC_BIZ_DATA ";
        query1 += "WHERE cmpy_seq = " + cmpy_seq + " AND btry_seq = " + btry_seq + " and biz_key > " + last_key + " ";
        query1 += "GROUP BY biz_key "
        query1 += "ORDER BY ins_dttm DESC;";
    
        let [rows1] = await global.mysqlPool.query(query1);
    

        if(rows1.length > 0){
            var currData = [];
            var voltData = [];
            var socData = [];
            var sohData = [];
            var xData = [];
            var lastKey = rows1[0].biz_key;
        
        
            for(var i = 0; i < rows1.length; i++){
        
                var time = rows1[rows1.length-1-i].biz_key.substring(8,14);
                var timeString = time.substring(0, 2) + ":" + time.substring(2,4) + ":" + time.substring(4,6);
                xData.push(timeString);
                currData.push(parseFloat(rows1[rows1.length-1-i].curr == null ? 0 : rows1[rows1.length-1-i].curr).toFixed(2));
                voltData.push(parseFloat(rows1[rows1.length-1-i].volt == null ? 0 : rows1[rows1.length-1-i].volt).toFixed(2));
                socData.push(parseFloat(rows1[rows1.length-1-i].soc == null  ? 0 : rows1[rows1.length-1-i].soc).toFixed(2));
                sohData.push(parseFloat(rows1[rows1.length-1-i].soh == null ? 0 : rows1[rows1.length-1-i].soh).toFixed(2));
            }
        
            //SOC 계산할 최대 전압
            let query2 = "SELECT btry_max_volt, btry_min_volt, btry_rat_volt, btry_rat_curr, btry_max_curr, btry_min_curr FROM OPENBMS.TBL_BTRY WHERE btry_seq = " + btry_seq + ";";
        
            let [rows2] = await global.mysqlPool.query(query2);

            console.log("lastKey!!!!" + lastKey);
        
            res.send({currData: currData, voltData: voltData, socData: socData, sohData: sohData, btry_info: rows2[0], xData: xData, lastKey: lastKey});
        } else {
            res.send();
        }
    
        
    } catch (err){
        console.log(err);
        res.send();
    }
    
}

exports.postFirstLiveDataForMore = async(req, res, next) => {

    var btry_seq = req.body.bms_seq;

    //그래프 처음 10개 데이터
    let query1 = "SELECT volt_sys as volt, curr_sys as curr, soc, soh, DATE_FORMAT(ins_dttm,'%Y/%m/%d %H:%i:%s') AS ins_dttm, ";
    query1 += "CONCAT(DATE_FORMAT(biz_dt,'%Y/%m/%d'),' ',biz_h,':',biz_m,':','00') AS time FROM OPENBMS.TBL_PTC_BIZ_DATA ";
    query1 += "WHERE btry_seq = " + btry_seq + " ";
    query1 += "GROUP BY CONCAT(DATE_FORMAT(biz_dt,'%Y/%m/%d'),' ',biz_h,':',biz_m,':','00') ";
    query1 += "ORDER BY time DESC  ";
    query1 += "LIMIT 100";

    let [rows1] = await global.mysqlPool.query(query1);

    var currData = [];
    var voltData = [];
    var socData = [];
    var sohData = [];
    var xData = [];


    for(var i = 0; i < rows1.length; i++){

        xData.push(rows1[rows1.length-1-i].time);
        currData.push(parseFloat(rows1[rows1.length-1-i].curr).toFixed(2));
        voltData.push(parseFloat(rows1[rows1.length-1-i].volt).toFixed(2));
        socData.push(parseFloat(rows1[rows1.length-1-i].soc).toFixed(2));
        sohData.push(parseFloat(rows1[rows1.length-1-i].soh).toFixed(2));
    }

    //SOC 계산할 최대 전압
    let query2 = "SELECT btry_max_volt, btry_min_volt, btry_rat_volt, btry_rat_curr, btry_max_curr, btry_min_curr FROM OPENBMS.TBL_BTRY WHERE btry_seq = " + btry_seq + ";";

    let [rows2] = await global.mysqlPool.query(query2);

    res.send({currData: currData, voltData: voltData, socData: socData, sohData: sohData, btry_info: rows2[0], xData: xData});
    
}

exports.postChargeByTempAndTime = async(req, res, next) => {

    var btry_seq = req.body.bms_seq;
    
    //AND 조건에 일주일 전까지만
    //AND tpbd.biz_dt > DATE_FORMAT(DATE_ADD(SYSDATE(),INTERVAL -1 WEEK ),'%Y%m%d')

    let query1 = "SELECT tsh.max_tp, tsh.min_tp, tsh.avg_chrg_time, tsh.avg_dischrg_time, CONCAT(DATE_FORMAT(tsh.sttc_dt,'%Y/%m/%d'),' ',tsh.sttc_hour,':','00',':','00') AS time ";
        query1 +="FROM OPENBMS.TBL_STTC_HOUR tsh ";
        query1 +="WHERE tsh.btry_seq = " + btry_seq + " ";
        query1 +="AND tsh.sttc_dt > DATE_FORMAT(DATE_ADD(SYSDATE(), INTERVAL -1 WEEK),'%Y%m%d') ";
        query1 +="ORDER BY CONCAT(tsh.sttc_dt,tsh.sttc_hour) ASC; ";

    let [rows1] = await global.mysqlPool.query(query1);

    var xData = [];
    var tempMaxData = [];
    var tempMinData = [];
    var chargeData = [];
    var disChargeData = [];

    for(var i = 0; i < rows1.length; i++){

        xData.push(rows1[i].time);
        tempMaxData.push({max_tp : rows1[i].max_tp, time : rows1[i].time});
        tempMinData.push({min_tp : rows1[i].min_tp, time : rows1[i].time});
        chargeData.push({avg_chrg_time : rows1[i].avg_chrg_time, time : rows1[i].time});
        disChargeData.push({avg_dischrg_time : rows1[i].avg_dischrg_time, time : rows1[i].time});
    }

    //배터리 정보
    let query2 = "SELECT btry_max_volt, btry_min_volt, btry_rat_volt, btry_rat_curr, btry_max_curr, btry_min_curr FROM OPENBMS.TBL_BTRY WHERE btry_seq = " + btry_seq + ";";

    let [rows2] = await global.mysqlPool.query(query2);

    res.send({xData: xData, tempMaxData: tempMaxData, tempMinData: tempMinData, chargeData: chargeData, disChargeData: disChargeData, btry_info: rows2[0]});
    
}

