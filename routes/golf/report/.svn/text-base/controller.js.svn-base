// const asyncWrapper = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next());
// const form = require('../../config/form.js');
const path = require('path');
const moment = require('moment');
const form = require(path.join(global.appRoot, '/modules/form.js'));
const code = require(path.join(global.appRoot, '/routes/layout/code.js'));
const common = require('../common/common');
const Pagination = require(path.join(global.appRoot,"/modules/pagination.js"));
const utiljs = require(path.join(global.appRoot,"/modules/util.js"));
const viewName = 'golf/report/';
require("date-utils");

exports.getDaily = async(req, res, next) => {
    console.log("start getDaily");
    try {
        res.render(viewName+"day");
    } catch (error) {
        console.log(error);
    }

}

exports.postDailyHistory = async(req, res, next) => {
    console.log("postDailyHistory start");

    try{
        var currentPage = req.body.page;

        if (currentPage == null || currentPage == '') {
            currentPage = 1;
        }

        var sort_by = req.body.sort_by;
        var cmpy_seq = req.session.userInfo.cmpy_seq
        var btry_seq = req.body.btry_seq;
        var startDate = req.body.startDate;
        var endDate = req.body.endDate;

        let query1 = "";
        let query2 = "";

        if(sort_by == "sort_day"){
            query1 += "select COUNT(*) AS total_count from OPENBMS.TBL_STTC_DAY tsd ";
            query1 += "where tsd.btry_seq IN(" + btry_seq + ") AND tsd.cmpy_seq = " + cmpy_seq + " ";
            query1 += " AND DATE_FORMAT(tsd.sttc_dt, '%Y%m%d') BETWEEN " + startDate + " AND " + endDate + " ";
        }else if(sort_by == "sort_month"){
            query1 += "select COUNT(*) AS total_count from OPENBMS.TBL_STTC_MONTH tsm ";
            query1 += "where tsm.btry_seq IN (" + btry_seq + ") AND tsm.cmpy_seq =" + cmpy_seq + " ";
            query1 += " AND tsm.sttc_month BETWEEN " + startDate + " AND " + endDate + " ";
        }

        let [row1] = await global.mysqlPool.query(query1); 

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 5);
        paginate.getPages(5);

        if(sort_by == "sort_day"){
            query2+= "select tsd.sttc_day_seq, (SELECT tb.btry_nm FROM TBL_BTRY tb WHERE tb.btry_seq = tsd.btry_seq) AS btry_nm, DATE_FORMAT(tsd.sttc_dt,'%Y-%m-%d') as sttc_date,";
            query2+= " tsd.sttc_dayweek, IFNULL(tsd.comment,'') as comment, tsd.avg_chrg_time, tsd.avg_dischrg_time, tsd.avg_standby_time, tsd.avg_soc, tsd.avg_soh, IFNULL(tsd.chrg_cnt,0) as chrg_cnt, ";
            query2+= " tsd.ins_nm, tsd.ins_dttm FROM OPENBMS.TBL_STTC_DAY tsd ";
            query2+= "where tsd.btry_seq IN(" + btry_seq + ") AND tsd.cmpy_seq = " + cmpy_seq + " ";
            query2+= " AND DATE_FORMAT(tsd.sttc_dt, '%Y%m%d') BETWEEN " + startDate + " AND " + endDate + " ";
            query2+= "ORDER BY tsd.sttc_dt DESC ";
            query2+= "LIMIT " + paginate.limit;
        }else if(sort_by == "sort_month"){
            query2 = "select tsm.sttc_month_seq, (SELECT tb.btry_nm FROM TBL_BTRY tb WHERE tb.btry_seq = tsm.btry_seq) AS btry_nm, tsm.sttc_dt, ";
            query2+= "CONCAT(SUBSTR(tsm.sttc_month,1,4),'-',SUBSTR(tsm.sttc_month,5,2)) as sttc_date, tsm.comment, tsm.avg_chrg_time, tsm.avg_dischrg_time, tsm.avg_standby_time, tsm.avg_soc, tsm.avg_soh, IFNULL(tsm.chrg_cnt,0) as chrg_cnt, ";
            query2+= " tsm.ins_nm, tsm.ins_dttm FROM OPENBMS.TBL_STTC_MONTH tsm "; 
            query2 += "where tsm.btry_seq IN (" + btry_seq + ") AND tsm.cmpy_seq =" + cmpy_seq + " ";
            query2 += " AND tsm.sttc_month BETWEEN " + startDate + " AND " + endDate + " ";
            query2 += "GROUP BY tsm.sttc_month ";
            query2 += "ORDER BY tsm.sttc_month DESC ";
            query2 += "LIMIT " + paginate.limit;
        }
    
        let [row2] = await global.mysqlPool.query(query2);
        
        let query3 = "SELECT tih.inspec_type, COUNT(*) as count FROM TBL_INSPEC_HSTY tih ";
            query3 += "where tih.inspec_btry IN (" + btry_seq + ") AND tih.cmpy_seq = " + cmpy_seq + " ";
            query3 += " AND DATE_FORMAT(tih.inspec_date,'%Y%m%d') BETWEEN " + startDate + " AND " + endDate + " ";
            query3+="GROUP BY tih.inspec_type ";

        let [row3] = await global.mysqlPool.query(query3);

        let query4 = 'SELECT';
			query4 += ' CAST(IFNULL(MAX(TSD.max_volt), "") AS DECIMAL(10,2)) AS max_volt,';
			query4 += ' CAST(IFNULL(MIN(TSD.min_volt), "") AS DECIMAL(10,2)) AS min_volt,';
			query4 += ' CAST(IFNULL(MAX(TSD.max_curr), "") AS DECIMAL(10,2)) AS max_curr,';
			query4 += ' CAST(IFNULL(MIN(TSD.min_curr), "") AS DECIMAL(10,2)) AS min_curr,';
			query4 += ' CAST(IFNULL(MAX(TSD.max_tp), "") AS DECIMAL(10,2)) AS max_tp,';
			query4 += ' CAST(IFNULL(MIN(TSD.min_tp), "") AS DECIMAL(10,2)) AS min_tp';
			query4 += ' FROM OPENBMS.TBL_STTC_DAY TSD';
			query4 += ' WHERE TSD.btry_seq = "' + btry_seq + '"';
			query4 += ' AND TSD.cmpy_seq = "' + cmpy_seq + '"';
			query4 += ' AND DATE_FORMAT(TSD.sttc_dt, "%Y%m%d") BETWEEN "' + startDate + '" AND "' + endDate + '"';
			
        let [row4] = await global.mysqlPool.query(query4);

        for(var i = 0; i < row2.length; i++){

            row2[i].avg_soc = Math.round(row2[i].avg_soc * 100) / 100;
            row2[i].avg_soh = Math.round(row2[i].avg_soh * 100) / 100;

            row2[i].avg_chrg_time = utiljs.minuteFormat(row2[i].avg_chrg_time);
            row2[i].avg_dischrg_time = utiljs.minuteFormat(row2[i].avg_dischrg_time);
            row2[i].avg_standby_time = utiljs.minuteFormat(row2[i].avg_standby_time);
        }

        res.send({ data: row2, inspecData : row3, maxminData : row4, liRow: paginate.pages[paginate.page - 1], pages: paginate.threePages });

    } catch (err){
        console.log(err);
        res.send({data : null, liRow : null, pages : null});
    }
}

exports.postDailyHistoryForGraph = async(req, res, next) => {
    console.log("postDailyHistoryForGraph start");

    try{

        var sort_by = req.body.sort_by;

        var cmpy_seq = req.session.userInfo.cmpy_seq;
        var btry_seq = req.body.btry_seq;
        var startDate = req.body.startDate;
        var endDate = req.body.endDate;

        let query2ForGraph = "";

        if(sort_by == null || sort_by == "" || sort_by == "sort_day"){

            query2ForGraph+= "select tsd.sttc_day_seq, (SELECT tb.btry_nm FROM TBL_BTRY tb WHERE tb.btry_seq = tsd.btry_seq) AS btry_nm,  ";
            query2ForGraph+= "DATE_FORMAT(tsd.sttc_dt,'%Y-%m-%d') AS sttc_dt, tsd.sttc_dayweek, tsd.avg_chrg_time, tsd.avg_dischrg_time, tsd.avg_standby_time,  ";
            query2ForGraph+= "ROUND(tsd.avg_soc,2) AS avg_soc, ROUND(tsd.avg_soh,2) AS avg_soh,  ";
            query2ForGraph+= "IFNULL(tsd.chrg_cnt,0) as chrg_cnt ";
            query2ForGraph+= "FROM OPENBMS.TBL_STTC_DAY tsd  ";
            query2ForGraph+= "where tsd.btry_seq IN(" + btry_seq + ") AND tsd.cmpy_seq = " + cmpy_seq + " ";
            query2ForGraph+= "AND DATE_FORMAT(tsd.sttc_dt, '%Y%m%d') BETWEEN " + startDate + " AND " + endDate + " ";
            query2ForGraph+= "ORDER BY tsd.sttc_dt ASC ";

        } else if(sort_by == "sort_week"){

            query2ForGraph+= "select tsd.sttc_day_seq, (SELECT tb.btry_nm FROM TBL_BTRY tb WHERE tb.btry_seq = tsd.btry_seq) AS btry_nm,  ";
            query2ForGraph+= "DATE_FORMAT(tsd.sttc_dt,'%Y-%m') AS sttc_dt,  ";
            query2ForGraph+= "tsd.sttc_dayweek, ";
            query2ForGraph+= "SUM(tsd.avg_chrg_time) AS avg_chrg_time,  ";
            query2ForGraph+= "SUM(tsd.avg_dischrg_time) AS avg_dischrg_time,  ";
            query2ForGraph+= "SUM(tsd.avg_standby_time) AS avg_standby_time,  ";
            query2ForGraph+= "ROUND(AVG(tsd.avg_soc),2) AS avg_soc,  ";
            query2ForGraph+= "ROUND(AVG(tsd.avg_soh),2) AS avg_soh,  ";
            query2ForGraph+= "SUM(IFNULL(tsd.chrg_cnt,0)) as chrg_cnt ";
            query2ForGraph+= "FROM OPENBMS.TBL_STTC_DAY tsd  ";
            query2ForGraph+= "where tsd.btry_seq IN(" + btry_seq + ") AND tsd.cmpy_seq = " + cmpy_seq + " ";
            query2ForGraph+= "AND DATE_FORMAT(tsd.sttc_dt, '%Y%m%d') BETWEEN " + startDate + " AND " + endDate + " ";
            query2ForGraph+= "GROUP BY DATE_FORMAT(tsd.sttc_dt,'%Y%m'), tsd.sttc_dayweek ";
            query2ForGraph+= "ORDER BY tsd.sttc_dt ASC ";

        } else if(sort_by == "sort_month"){

            query2ForGraph+= "select tsm.sttc_month_seq, (SELECT tb.btry_nm FROM TBL_BTRY tb WHERE tb.btry_seq = tsm.btry_seq) AS btry_nm,  ";
            query2ForGraph+= "DATE_FORMAT(tsm.sttc_dt,'%Y-%m') AS sttc_dt2,  ";
            query2ForGraph+= "tsm.sttc_month AS sttc_dt,  ";
            query2ForGraph+= "SUM(tsm.avg_chrg_time) AS avg_chrg_time,  ";
            query2ForGraph+= "SUM(tsm.avg_dischrg_time) AS avg_dischrg_time,  ";
            query2ForGraph+= "SUM(tsm.avg_standby_time) AS avg_standby_time,  ";
            query2ForGraph+= "ROUND(AVG(tsm.avg_soc),2) AS avg_soc,  ";
            query2ForGraph+= "ROUND(AVG(tsm.avg_soh),2) AS avg_soh,  ";
            query2ForGraph+= "SUM(IFNULL(tsm.chrg_cnt,0)) as chrg_cnt ";
            query2ForGraph+= "FROM OPENBMS.TBL_STTC_MONTH tsm  ";
            query2ForGraph+= "where tsm.btry_seq IN(" + btry_seq + ") AND tsm.cmpy_seq = " + cmpy_seq + " ";
            query2ForGraph+= "AND DATE_FORMAT(tsm.sttc_dt, '%Y%m%d') BETWEEN " + startDate + " AND " + endDate + " ";
            query2ForGraph+= "GROUP BY tsm.sttc_month ";
            query2ForGraph+= "ORDER BY tsm.sttc_month ASC  ";

        }
    
        let [row2ForGraph] = await global.mysqlPool.query(query2ForGraph);

        //그래프 데이터
        let xRow = [];
        let chrgTimeRow = [];
        let disChrgTimeRow = [];
        let socRow = [];

        for(var i = 0; i < row2ForGraph.length; i++){
            xRow.push(row2ForGraph[i].sttc_dt);
            chrgTimeRow.push(row2ForGraph[i].avg_chrg_time);
            disChrgTimeRow.push(row2ForGraph[i].avg_dischrg_time);
            socRow.push(row2ForGraph[i].avg_soc);
        }

        res.send({xRow : xRow, chrgTimeRow : chrgTimeRow, disChrgTimeRow : disChrgTimeRow, socRow : socRow});

    } catch (err){
        console.log(err);
        res.send({xRow : null, chrgTimeRow : null, disChrgTimeRow : null, socRow : null});
    }
}

exports.getMonthly = (req, res, next) => {
    console.log("start getMonthly");
    try {
        res.render(viewName+"month");
    } catch (error) {
        console.log(error);
    }
}

exports.postMonthlyHistory = async(req, res, next) => {
    console.log("postMonthlyHistory start");

    try{
          
        var currentPage = req.body.page;

        if (currentPage == null || currentPage == '') {
            currentPage = 1;
        }

        var cmpy_seq = req.session.userInfo.cmpy_seq;
        var btry_seq = req.body.btry_seq;
        var startMonth = req.body.startMonth;
        var endMonth = req.body.endMonth;

        let query1 = "select COUNT(*) AS total_count from OPENBMS.TBL_STTC_MONTH tsm ";
            query1 += "where tsm.btry_seq IN (" + btry_seq + ") AND tsm.cmpy_seq =" + cmpy_seq + " ";
            query1 += " AND tsm.sttc_month BETWEEN " + startMonth + " AND " + endMonth + " ";
    
        let [row1] = await global.mysqlPool.query(query1); 

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 10);
        paginate.getPages(5);

        let query2 = "select tsm.sttc_month_seq, (SELECT tb.btry_nm FROM TBL_BTRY tb WHERE tb.btry_seq = tsm.btry_seq) AS btry_nm, tsm.sttc_dt, ";
            query2+= " tsm.sttc_month, tsm.comment, tsm.avg_chrg_time, tsm.avg_dischrg_time, tsm.avg_standby_time, tsm.avg_soc, tsm.avg_soh, IFNULL(tsm.chrg_cnt,0) as chrg_cnt, ";
            query2+= " tsm.ins_nm, tsm.ins_dttm FROM OPENBMS.TBL_STTC_MONTH tsm "; 
            query2 += "where tsm.btry_seq IN (" + btry_seq + ") AND tsm.cmpy_seq =" + cmpy_seq + " ";
            query2 += " AND tsm.sttc_month BETWEEN " + startMonth + " AND " + endMonth + " ";
            query2 += "ORDER BY tsm.sttc_month DESC ";
            query2 += "LIMIT " + paginate.limit;
    
        let [row2] = await global.mysqlPool.query(query2);  

        let query3 = "SELECT tih.inspec_type, COUNT(*) as count FROM TBL_INSPEC_HSTY tih ";
            query3 +="where tih.inspec_btry IN ("+btry_seq+") AND tih.cmpy_seq = " + cmpy_seq + " ";
            query3 +="AND DATE_FORMAT(tih.inspec_date,'%Y%m') BETWEEN " + startMonth + " AND " + endMonth + " ";
            query3 +="GROUP BY tih.inspec_type ";


        let [row3] = await global.mysqlPool.query(query3);

        let query4 = "SELECT CAST(IFNULL(MAX(tpbd.volt_sys),'') AS DECIMAL(10,2)) AS max_volt, CAST(IFNULL(MIN(tpbd.volt_sys),'') AS DECIMAL(10,2)) AS min_volt, ";
            query4+= "CAST(IFNULL(MAX(tpbd.curr_sys),'') AS DECIMAL(10,2)) AS max_curr, CAST(IFNULL(MIN(tpbd.curr_sys),'') AS DECIMAL(10,2)) AS min_curr, ";
            query4+= "CAST(IFNULL(MAX(tpbd.tp_sys),'') AS DECIMAL(10,2)) AS max_tp, CAST(IFNULL(MIN(tpbd.tp_sys),'') AS DECIMAL(10,2)) AS min_tp ";
            query4+= "FROM OPENBMS.TBL_PTC_BIZ_DATA tpbd ";
            query4 += "where tpbd.btry_seq IN("+btry_seq+") AND tpbd.cmpy_seq = " + cmpy_seq + " ";
            query4 += " AND DATE_FORMAT(tpbd.biz_dt,'%Y%m') BETWEEN " + startMonth + " AND " + endMonth + " ";

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

exports.postLocListByCmpy = async(req, res, next) => {
    //장소별 bms list
    console.log("start postLocListByCmpy");
    try {

        //본인회사의 설치장소만
        var cmpy_seq = req.session.userInfo.cmpy_seq;

        let query = "SELECT tl.loc_seq, tl.loc_nm FROM TBL_LOC tl ";
            query+= "WHERE tl.loc_seq IN (SELECT mcl.loc_seq FROM MPP_CMPY_LOC mcl WHERE mcl.cmpy_seq IN (" + cmpy_seq + "))";
        let [rows] = await global.mysqlPool.query(query);

        // var allLoc = "";

        // for(var i in rows){
        //     if(i==(rows.length-1)){
        //         allLoc += rows[i].loc_seq;
        //         break;
        //     }
        //     allLoc += rows[i].loc_seq + ",";
        // }

        // if(rows != null && rows.length != 0){
        //     rows.unshift({
        //         loc_seq: allLoc,
        //         loc_nm: "전체"
        //     });
        // }

        res.send({loc_list : rows});

    } catch (err){
        console.log(err);
    }
}

exports.postBtryListByLoc = async(req, res, next) => {
    //장소별 bms list
    console.log("start postBtryListByLoc");
    try {

        //본인회사의 설치장소만
        var loc_seq = req.body.loc_seq;

        let query = "SELECT tb.btry_seq, tb.btry_nm FROM OPENBMS.TBL_BTRY tb ";
            query+= "WHERE tb.btry_seq IN (SELECT mlb.btry_seq FROM MPP_LOC_BTRY mlb WHERE mlb.loc_seq IN (" + loc_seq + "))";

        let [rows] = await global.mysqlPool.query(query);

        // var allBtry = "";

        // for(var i in rows){
        //     if(i==(rows.length-1)){
        //         allBtry += rows[i].btry_seq;
        //         break;
        //     }
        //     allBtry += rows[i].btry_seq + ",";
        // }

        // if(rows != null && rows.length != 0){
        //     rows.unshift({
        //         btry_seq: allBtry,
        //         btry_nm: "전체"
        //     });
        // }

        res.send({btry_list : rows});

    } catch (err){
        console.log(err);
    }
}