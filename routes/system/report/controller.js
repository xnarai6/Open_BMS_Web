// const asyncWrapper = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next());
// const form = require('../../config/form.js');

const { globalAgent } = require("http");
const path = require("path");
const util = require("../../../modules/util");
const Pagination = require(path.join(global.appRoot,"/modules/pagination.js"));
const utiljs = require(path.join(global.appRoot,"/modules/util.js"));
const viewName = 'system/';
require("date-utils");


exports.getDaily = async(req, res, next) => {
    sess = req.session;
    var acnt_seq = sess.acnt_seq;
    
    // 로그인 확인
    if(acnt_seq < 0){
        res.redirect('/account/login');
    }

    try {

        res.render(viewName+"report/daily");

        
    } catch (error) {
        console.log(error);
    }

}

exports.getWeekly = (req, res, next) => {
    sess = req.session;
    var acnt_seq = sess.acnt_seq;
    
    // 로그인 확인
    if(acnt_seq < 0){
        res.redirect('/account/login');
    }
    res.render(viewName+"report/weekly");
}

exports.getMonthly = (req, res, next) => {
    sess = req.session;
    var acnt_seq = sess.acnt_seq;
    
    // 로그인 확인
    if(acnt_seq < 0){
        res.redirect('/account/login');
    }
    
    res.render(viewName+"report/monthly");
}


exports.postDailyHistory = async(req, res, next) => {
    console.log("postDailyHistory start");

    try{
        var currentPage = req.body.page;

        if (currentPage == null || currentPage == '') {
            currentPage = 1;
        }

        var loc_seq = req.body.loc_seq;
        var bms_seq = req.body.bms_seq;
        var startDate = req.body.startDate;
        var endDate = req.body.endDate;

        let query1 = "select COUNT(*) AS total_count from OPENBMS.TBL_STTC_DAY tsd ";
        //설치장소, BMS 선택 여부에 따른 리스트 목록
        if((bms_seq != null && bms_seq != '') && (loc_seq != null && loc_seq != '')){
            query1 += "where tsd.btry_seq ="+bms_seq+" AND tsd.cmpy_seq = (SELECT mlc.cmpy_seq FROM MPP_CMPY_LOC mlc WHERE mlc.loc_seq = " + loc_seq + ") ";
        }else{
            query1 += "where tsd.btry_seq IN (SELECT mlb.btry_seq FROM MPP_LOC_BTRY mlb WHERE mlb.loc_seq = " + loc_seq + ") AND tsd.cmpy_seq = (SELECT mlc.cmpy_seq FROM MPP_CMPY_LOC mlc WHERE mlc.loc_seq = " + loc_seq + ")";
        }
        //날짜 선택 여부에 따른 리스트
        if(startDate != null && startDate != '' && endDate != null && endDate != ''){
            query1 += " AND tsd.sttc_dt BETWEEN " + startDate + " AND " + endDate + " ";
        }
        let [row1] = await global.mysqlPool.query(query1); 

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 5);
        paginate.getPages(5);

        let query2 = "select tsd.sttc_day_seq, (SELECT tb.btry_nm FROM TBL_BTRY tb WHERE tb.btry_seq = tsd.btry_seq) AS btry_nm, tsd.sttc_dt,";
            query2+= " tsd.sttc_dayweek, IFNULL(tsd.comment,'') as comment, tsd.avg_chrg_time, tsd.avg_dischrg_time, tsd.avg_standby_time, tsd.avg_soc, tsd.avg_soh, IFNULL(tsd.chrg_cnt,0) as chrg_cnt, ";
            query2+= " tsd.ins_nm, tsd.ins_dttm FROM OPENBMS.TBL_STTC_DAY tsd ";
        //설치장소, BMS 선택 여부에 따른 리스트 목록
        if((bms_seq != null && bms_seq != '') && (loc_seq != null && loc_seq != '')){
            query2 += "where tsd.btry_seq ="+bms_seq+" AND tsd.cmpy_seq = (SELECT mlc.cmpy_seq FROM MPP_CMPY_LOC mlc WHERE mlc.loc_seq = " + loc_seq + ") ";
        }else{
            query2 += "where tsd.btry_seq IN (SELECT mlb.btry_seq FROM MPP_LOC_BTRY mlb WHERE mlb.loc_seq = " + loc_seq + ") AND tsd.cmpy_seq = (SELECT mlc.cmpy_seq FROM MPP_CMPY_LOC mlc WHERE mlc.loc_seq = " + loc_seq + ")";
        }
        //날짜 선택 여부에 따른 리스트
        if(startDate != null && startDate != '' && endDate != null && endDate != ''){
            query2 += " AND tsd.sttc_dt BETWEEN " + startDate + " AND " + endDate + " ";
        }
        query2 += "ORDER BY tsd.sttc_dt DESC ";
        query2 += "LIMIT " + paginate.limit;
    
        let [row2] = await global.mysqlPool.query(query2);
        
        let query3 = "SELECT tih.inspec_type, COUNT(*) as count FROM TBL_INSPEC_HSTY tih ";
        //설치장소, BMS 선택 여부에 따른 리스트 목록
        if((bms_seq != null && bms_seq != '') && (loc_seq != null && loc_seq != '')){
            query3 += "where tih.inspec_btry ="+bms_seq+" AND tih.cmpy_seq = (SELECT mlc.cmpy_seq FROM MPP_CMPY_LOC mlc WHERE mlc.loc_seq = " + loc_seq + ")";
        }else{
            query3 += "where tih.inspec_btry IN (SELECT mlb.btry_seq FROM MPP_LOC_BTRY mlb WHERE mlb.loc_seq = " + loc_seq + ") AND tih.cmpy_seq = (SELECT mlc.cmpy_seq FROM MPP_CMPY_LOC mlc WHERE mlc.loc_seq = " + loc_seq + ")";
        }
        //날짜 선택 여부에 따른 리스트
        if(startDate != null && startDate != '' && endDate != null && endDate != ''){
            query3 += " AND DATE_FORMAT(tih.inspec_date,'%Y%m%d') BETWEEN " + startDate + " AND " + endDate + " ";
        }
            query3+="GROUP BY tih.inspec_type ";

        let [row3] = await global.mysqlPool.query(query3);

        let query4 = "SELECT CAST(IFNULL(MAX(tpbd.volt_sys),'') AS DECIMAL(10,2)) AS max_volt, CAST(IFNULL(MIN(tpbd.volt_sys),'') AS DECIMAL(10,2)) AS min_volt, ";
            query4+= "CAST(IFNULL(MAX(tpbd.curr_sys),'') AS DECIMAL(10,2)) AS max_curr, CAST(IFNULL(MIN(tpbd.curr_sys),'') AS DECIMAL(10,2)) AS min_curr, ";
            query4+= "CAST(IFNULL(MAX(tpbd.tp_sys),'') AS DECIMAL(10,2)) AS max_tp, CAST(IFNULL(MIN(tpbd.tp_sys),'') AS DECIMAL(10,2)) AS min_tp ";
            query4+= "FROM OPENBMS.TBL_PTC_BIZ_DATA tpbd ";
        //설치장소, BMS 선택 여부에 따른 리스트 목록
        if((bms_seq != null && bms_seq != '') && (loc_seq != null && loc_seq != '')){
            query4 += "where tpbd.btry_seq ="+bms_seq+" AND tpbd.cmpy_seq (SELECT mlc.cmpy_seq FROM MPP_CMPY_LOC mlc WHERE mlc.loc_seq = " + loc_seq + ")";
        }else{
            query4 += "where tpbd.btry_seq IN (SELECT mlb.btry_seq FROM MPP_LOC_BTRY mlb WHERE mlb.loc_seq = " + loc_seq + ") AND tpbd.cmpy_seq = (SELECT mlc.cmpy_seq FROM MPP_CMPY_LOC mlc WHERE mlc.loc_seq = " + loc_seq + ")";
        }
        //날짜 선택 여부에 따른 리스트
        if(startDate != null && startDate != '' && endDate != null && endDate != ''){
            query4 += " AND DATE_FORMAT(tpbd.biz_dt,'%Y%m%d') BETWEEN " + startDate + " AND " + endDate + " ";
        }

        let [row4] = await global.mysqlPool.query(query4);

        for(var i = 0; i < row2.length; i++){

            row2[i].avg_soc = Math.round(row2[i].avg_soc * 100) / 100;
            row2[i].avg_soh = Math.round(row2[i].avg_soh * 100) / 100;

            var y = row2[i].sttc_dt.substr(0, 4);
            var m = row2[i].sttc_dt.substr(4, 2);
            var d = row2[i].sttc_dt.substr(6, 2);
            row2[i].sttc_dt = new Date(y,m-1,d).toFormat('YYYY-MM-DD');

            row2[i].ins_dttm = row2[i].ins_dttm.toFormat('YYYY-MM-DD');

            row2[i].avg_chrg_time = utiljs.minuteFormat(row2[i].avg_chrg_time);
            row2[i].avg_dischrg_time = utiljs.minuteFormat(row2[i].avg_dischrg_time);
            row2[i].avg_standby_time = utiljs.minuteFormat(row2[i].avg_standby_time);
        }

        res.send({ data: row2, inspecData : row3, maxminData : row4, liRow: paginate.pages[paginate.page - 1], pages: paginate.threePages });

    } catch (err){
        console.log(err);
        res.send({data : null, liRow : "1", pages : "1"});
    }
}


exports.postMonthlyHistory = async(req, res, next) => {
    console.log("postMonthlyHistory start");

    try{
          
        var currentPage = req.body.page;

        if (currentPage == null || currentPage == '') {
            currentPage = 1;
        }

        var loc_seq = req.body.loc_seq;
        var bms_seq = req.body.bms_seq;
        var startMonth = req.body.startMonth;
        var endMonth = req.body.endMonth;

        let query1 = "select COUNT(*) AS total_count from OPENBMS.TBL_STTC_MONTH tsm ";
        //설치장소, BMS 선택 여부에 따른 리스트 목록
        if((bms_seq != null && bms_seq != '') && (loc_seq != null && loc_seq != '')){
            query1 += "where tsm.btry_seq ="+bms_seq+" AND tsm.cmpy_seq = (SELECT mlc.cmpy_seq FROM MPP_CMPY_LOC mlc WHERE mlc.loc_seq = " + loc_seq + ") ";
        }else{
            query1 += "where tsm.btry_seq IN (SELECT mlb.btry_seq FROM MPP_LOC_BTRY mlb WHERE mlb.loc_seq = " + loc_seq + ") AND tsm.cmpy_seq = (SELECT mlc.cmpy_seq FROM MPP_CMPY_LOC mlc WHERE mlc.loc_seq = " + loc_seq + ") ";
        }
        //날짜 선택 여부에 따른 리스트
        if(startMonth != null && startMonth != '' && endMonth != null && endMonth != ''){
            query1 += " AND tsm.sttc_month BETWEEN " + startMonth + " AND " + endMonth + " ";
        }
    
        let [row1] = await global.mysqlPool.query(query1); 

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 10);
        paginate.getPages(5);

        let query2 = "select tsm.sttc_month_seq, (SELECT tb.btry_nm FROM TBL_BTRY tb WHERE tb.btry_seq = tsm.btry_seq) AS btry_nm, tsm.sttc_dt, ";
            query2+= " tsm.sttc_month, tsm.comment, tsm.avg_chrg_time, tsm.avg_dischrg_time, tsm.avg_standby_time, tsm.avg_soc, tsm.avg_soh, IFNULL(tsm.chrg_cnt,0) as chrg_cnt, ";
            query2+= " tsm.ins_nm, tsm.ins_dttm FROM OPENBMS.TBL_STTC_MONTH tsm "; 
        //설치장소, BMS 선택 여부에 따른 리스트 목록
        if((bms_seq != null && bms_seq != '') && (loc_seq != null && loc_seq != '')){
            query2 += "where tsm.btry_seq ="+bms_seq+" AND tsm.cmpy_seq = (SELECT mlc.cmpy_seq FROM MPP_CMPY_LOC mlc WHERE mlc.loc_seq = " + loc_seq + ") ";
        }else{
            query2 += "where tsm.btry_seq IN (SELECT mlb.btry_seq FROM MPP_LOC_BTRY mlb WHERE mlb.loc_seq = " + loc_seq + ") AND tsm.cmpy_seq = (SELECT mlc.cmpy_seq FROM MPP_CMPY_LOC mlc WHERE mlc.loc_seq = " + loc_seq + ") ";
        }
        //날짜 선택 여부에 따른 리스트
        if(startMonth != null && startMonth != '' && endMonth != null && endMonth != ''){
            query2 += " AND tsm.sttc_month BETWEEN " + startMonth + " AND " + endMonth + " ";
        }
        query2 += "ORDER BY tsm.sttc_month DESC ";
        query2 += "LIMIT " + paginate.limit;
    
        let [row2] = await global.mysqlPool.query(query2);  

        let query3 = "SELECT tih.inspec_type, COUNT(*) as count FROM TBL_INSPEC_HSTY tih ";
        //설치장소, BMS 선택 여부에 따른 리스트 목록
        if((bms_seq != null && bms_seq != '') && (loc_seq != null && loc_seq != '')){
            query3 += "where tih.inspec_btry ="+bms_seq+" AND tih.cmpy_seq = (SELECT mlc.cmpy_seq FROM MPP_CMPY_LOC mlc WHERE mlc.loc_seq = " + loc_seq + ") ";
        }else{
            query3 += "where tih.inspec_btry IN (SELECT mlb.btry_seq FROM MPP_LOC_BTRY mlb WHERE mlb.loc_seq = " + loc_seq + ") AND tih.cmpy_seq = (SELECT mlc.cmpy_seq FROM MPP_CMPY_LOC mlc WHERE mlc.loc_seq = " + loc_seq + ") ";
        }
        //날짜 선택 여부에 따른 리스트
        if(startMonth != null && startMonth != '' && endMonth != null && endMonth != ''){
            query3 += " AND DATE_FORMAT(tih.inspec_date,'%Y%m') BETWEEN " + startMonth + " AND " + endMonth + " ";
        }
            query3+="GROUP BY tih.inspec_type ";


        let [row3] = await global.mysqlPool.query(query3);

        let query4 = "SELECT CAST(IFNULL(MAX(tpbd.volt_sys),'') AS DECIMAL(10,2)) AS max_volt, CAST(IFNULL(MIN(tpbd.volt_sys),'') AS DECIMAL(10,2)) AS min_volt, ";
            query4+= "CAST(IFNULL(MAX(tpbd.curr_sys),'') AS DECIMAL(10,2)) AS max_curr, CAST(IFNULL(MIN(tpbd.curr_sys),'') AS DECIMAL(10,2)) AS min_curr, ";
            query4+= "CAST(IFNULL(MAX(tpbd.tp_sys),'') AS DECIMAL(10,2)) AS max_tp, CAST(IFNULL(MIN(tpbd.tp_sys),'') AS DECIMAL(10,2)) AS min_tp ";
            query4+= "FROM OPENBMS.TBL_PTC_BIZ_DATA tpbd ";
        //설치장소, BMS 선택 여부에 따른 리스트 목록
        if((bms_seq != null && bms_seq != '') && (loc_seq != null && loc_seq != '')){
            query4 += "where tpbd.btry_seq ="+bms_seq+" AND tpbd.cmpy_seq = (SELECT mlc.cmpy_seq FROM MPP_CMPY_LOC mlc WHERE mlc.loc_seq = " + loc_seq + ") ";
        }else{
            query4 += "where tpbd.btry_seq IN (SELECT mlb.btry_seq FROM MPP_LOC_BTRY mlb WHERE mlb.loc_seq = " + loc_seq + ") AND tpbd.cmpy_seq = (SELECT mlc.cmpy_seq FROM MPP_CMPY_LOC mlc WHERE mlc.loc_seq = " + loc_seq + ") ";
        }
        //날짜 선택 여부에 따른 리스트
        if(startMonth != null && startMonth != '' && endMonth != null && endMonth != ''){
            query4 += " AND DATE_FORMAT(tpbd.biz_dt,'%Y%m') BETWEEN " + startMonth + " AND " + endMonth + " ";
        }

        let [row4] = await global.mysqlPool.query(query4);

        for(var i = 0; i < row2.length; i++){

            row2[i].avg_soc = Math.round(row2[i].avg_soc * 100) / 100;
            row2[i].avg_soh = Math.round(row2[i].avg_soh * 100) / 100;

            var y = row2[i].sttc_month.substr(0, 4);
            var m = row2[i].sttc_month.substr(4, 2);
            row2[i].sttc_dt = new Date(y,m-1).toFormat('YYYY-MM');

            row2[i].ins_dttm = row2[i].ins_dttm.toFormat('YYYY-MM-DD');

            row2[i].avg_chrg_time = utiljs.minuteFormat(row2[i].avg_chrg_time);
            row2[i].avg_dischrg_time = utiljs.minuteFormat(row2[i].avg_dischrg_time);
            row2[i].avg_standby_time = utiljs.minuteFormat(row2[i].avg_standby_time);
        }

        res.send({ data: row2, inspecData : row3, maxminData: row4, liRow: paginate.pages[paginate.page - 1], pages: paginate.threePages });

    } catch (err){
        console.log(err);
        res.send({data : null, liRow : "1", pages : "1"});
    }
}

exports.postWeeklyHistory = async(req, res, next) => {
    console.log("postWeeklyHistory start");

    try{
        var bms_seq = req.body.bms_seq;

        let query2 = "select  * from OPENBMS.TBL_STTC_DAY tsd "; 
        query2 += "where tsd.btry_seq ="+bms_seq+" ";
        query2 += "ORDER BY tsd.ins_dttm "
        query2 += "LIMIT 7;";
    
        let [row2] = await global.mysqlPool.query(query2);  

        for(var i = 0; i < row2.length; i++){
            row2[i].ins_dttm = row2[i].ins_dttm.toFormat('YYYY-MM-DD');
        }

        res.send({ data: row2});
    } catch (err){
        console.log(err);
        res.send({data : null});
    }
}