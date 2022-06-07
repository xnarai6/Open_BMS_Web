const https = require('https');
const axios = require('axios');
const path = require("path");
const { max } = require('moment');
const Pagination = require(path.join(global.appRoot,"/modules/pagination.js"));
const encryption = require(path.join(global.appRoot,"/modules/encryption.js"));
const utiljs = require(path.join(global.appRoot,"/modules/util.js"));



exports.getDashboard =async(req, res, next) => {
    console.log("start getDashboard");

    sess = req.session;
    var acnt_seq = sess.acnt_seq;
    var acnt_role = sess.userInfo.acnt_role;
    
    // 로그인 확인
    if(acnt_seq < 0){
        res.redirect('/account/login');
    }

    var BMS_LOCATION = new Object();
    var BMS_LIST = new Object();
 
    // 로그인 따른 BMS 설치위치

    let selectQuery = "";

    if(acnt_role == "SA"){
        selectQuery = "select tltl.loc_seq, tltl.loc_nm, tltl.loc_addr1, tltl.loc_addr2, tltl.loc_weather_code from OPENBMS.TBL_LOC tltl  ";
        selectQuery += "  where tltl.loc_seq in (select loc_seq from OPENBMS.MPP_CMPY_LOC mcl   ";
        selectQuery += " where mcl.cmpy_seq in      ";
        selectQuery += "  (select mac.cmpy_seq from OPENBMS.MPP_ACNT_CMPY mac))";
    }else{
        selectQuery = "select tltl.loc_seq, tltl.loc_nm, tltl.loc_addr1, tltl.loc_addr2, tltl.loc_weather_code from OPENBMS.TBL_LOC tltl  ";
        selectQuery += "  where tltl.loc_seq in (select loc_seq from OPENBMS.MPP_CMPY_LOC mcl   ";
        selectQuery += " where mcl.cmpy_seq =      ";
        selectQuery += "  (select mac.cmpy_seq from OPENBMS.MPP_ACNT_CMPY mac where mac.acnt_seq = "+ acnt_seq+"))";
    }


    let [mRows] = await global.mysqlPool.query(selectQuery);
    
    BMS_LOCATION = mRows;

    let wRows = new Array();
    var weatherJsonObj = "";

    for(var i in mRows){
        var checkResult = await axios.get('https://www.kma.go.kr/wid/queryDFSRSS.jsp?zone=' + mRows[i].loc_weather_code);

        var parser = require('fast-xml-parser');
        var he = require('he');

        var options = { 
            attributeNamePrefix : "@_", 
            attrNodeName: "attr", //default is 'false' 
            textNodeName : "#text", 
            ignoreAttributes : true, 
            ignoreNameSpace : false, 
            allowBooleanAttributes : false, 
            parseNodeValue : true, 
            parseAttributeValue : false, 
            trimValues: true, 
            cdataTagName: "__cdata", //default is 'false' 
            cdataPositionChar: "\\c", 
            parseTrueNumberOnly: false, 
            arrayMode: false, //"strict" 
            attrValueProcessor: (val, attrName) => he.decode(val, {isAttributeValue: true}),//default is a=>a
            tagValueProcessor : (val, tagName) => he.decode(val), //default is a=>a
            stopNodes: ["parse-me-as-string"]
        };

        if( parser.validate(checkResult.data) === true) { //optional (it'll return an object in case it's not valid) 
            var jsonObj = parser.parse(checkResult.data,options); 
            var json = JSON.stringify(jsonObj); 
            weatherJsonObj = jsonObj;
        }

        wRows.push({
            loc_nm : mRows[i].loc_nm,
            wfKor : weatherJsonObj.rss.channel.item.description.body.data[0].wfKor,
            temp : weatherJsonObj.rss.channel.item.description.body.data[0].temp,
            reh : weatherJsonObj.rss.channel.item.description.body.data[0].reh
        });
    }
    
    // 로그인 따른 BMS 리스트

    function lastWeek() {
        var d = new Date();
        var dayOfMonth = d.getDate();
        d.setDate(dayOfMonth - 7);
        return d;
    }

    var now = new Date();
    var today = now.toFormat("YYYYMMDD");
    var lastweekday = lastWeek().toFormat("YYYYMMDD");

    //사용자 cmpy_seq
    let query0 = "SELECT * FROM OPENBMS.MPP_ACNT_CMPY WHERE acnt_seq = " + acnt_seq + ";";
    let [row0] = await global.mysqlPool.query(query0);
    let cmpy_seq = row0[0].cmpy_seq;

    let selectQuery1 = "";

    if(acnt_role == "SA"){
        selectQuery1 = "SELECT * ";
        selectQuery1 += "FROM (";
        selectQuery1 += "   SELECT tb.btry_nm, tb.btry_mfctor_nm, tb.btry_max_pwr, tsd1.btry_seq, tsd1.sttc_dt, tsd1.avg_chrg_time, tsd1.avg_dischrg_time, tsd1.avg_standby_time, tsd1.avg_soc, tsd1.avg_soh, tsd1.chrg_cnt ";
        selectQuery1 += "   FROM OPENBMS.TBL_STTC_DAY tsd1 ";
        selectQuery1 += "   JOIN OPENBMS.TBL_BTRY tb ON tb.btry_seq = tsd1.btry_seq ";
        selectQuery1 += "   WHERE (tsd1.btry_seq, tsd1.sttc_dt) IN (";
        selectQuery1 += "      SELECT tsd2.btry_seq, MAX(tsd2.sttc_dt)";
        selectQuery1 += "      FROM OPENBMS.TBL_STTC_DAY tsd2";
        selectQuery1 += "      WHERE tsd2.btry_seq IN (";
        selectQuery1 += "         SELECT mlb.btry_seq";
        selectQuery1 += "         FROM OPENBMS.MPP_LOC_BTRY mlb";
        selectQuery1 += "       )";
        selectQuery1 += "      GROUP BY tsd2.btry_seq";
        selectQuery1 += "   )";
        selectQuery1 += "         AND tsd1.sttc_dt BETWEEN '"+ lastweekday + "' AND '"+ today + "'";
        //selectQuery1 += "         AND tsd1.sttc_dt BETWEEN '20210510' AND '20210517'";
        selectQuery1 += ") a ";
        selectQuery1 += "GROUP BY a.btry_seq, a.sttc_dt;";
    }else{
        selectQuery1 = "SELECT * ";
        selectQuery1 += "FROM (";
        selectQuery1 += "   SELECT tb.btry_nm, tb.btry_mfctor_nm, tb.btry_max_pwr, tsd1.btry_seq, tsd1.sttc_dt, tsd1.avg_chrg_time, tsd1.avg_dischrg_time, tsd1.avg_standby_time, tsd1.avg_soc, tsd1.avg_soh, tsd1.chrg_cnt ";
        selectQuery1 += "   FROM OPENBMS.TBL_STTC_DAY tsd1 ";
        selectQuery1 += "   JOIN OPENBMS.TBL_BTRY tb ON tb.btry_seq = tsd1.btry_seq ";
        selectQuery1 += "   WHERE (tsd1.btry_seq, tsd1.sttc_dt) IN (";
        selectQuery1 += "      SELECT tsd2.btry_seq, MAX(tsd2.sttc_dt)";
        selectQuery1 += "      FROM OPENBMS.TBL_STTC_DAY tsd2";
        selectQuery1 += "      WHERE tsd2.btry_seq IN (";
        selectQuery1 += "         SELECT mlb.btry_seq";
        selectQuery1 += "         FROM OPENBMS.MPP_LOC_BTRY mlb";
        selectQuery1 += "         WHERE mlb.loc_seq IN (";
        selectQuery1 += "				SELECT mcl.loc_seq";
        selectQuery1 += "				FROM OPENBMS.MPP_CMPY_LOC mcl";
        selectQuery1 += "				WHERE mcl.cmpy_seq IN (";
        selectQuery1 += "				SELECT mac.cmpy_seq ";
        selectQuery1 += "				FROM OPENBMS.MPP_ACNT_CMPY mac ";
        selectQuery1 += "				WHERE mac.acnt_seq = '" + acnt_seq + "')";
        selectQuery1 += "           )";
        selectQuery1 += "       )";
        selectQuery1 += "      GROUP BY tsd2.btry_seq";
        selectQuery1 += "   )";
        selectQuery1 += "         AND tsd1.cmpy_seq = " + cmpy_seq + " AND tsd1.sttc_dt BETWEEN '"+ lastweekday + "' AND '"+ today + "'";
        //selectQuery1 += "         AND tsd1.sttc_dt BETWEEN '20210510' AND '20210517'";
        selectQuery1 += ") a ";
        selectQuery1 += "GROUP BY a.btry_seq, a.sttc_dt;";
    }

    let [mRows1] = await global.mysqlPool.query(selectQuery1);

    for(var i in mRows1){
        mRows1[i].avg_chrg_time = utiljs.minuteFormat(mRows1[i].avg_chrg_time);
        mRows1[i].avg_dischrg_time = utiljs.minuteFormat(mRows1[i].avg_dischrg_time);
        mRows1[i].avg_standby_time = utiljs.minuteFormat(mRows1[i].avg_standby_time);

        let pwrAndUnit = utiljs.unitConvertWithComma(mRows1[i].btry_max_pwr);
        mRows1[i].btry_max_pwr = pwrAndUnit.power + pwrAndUnit.unit;
    }
        
    BMS_LIST = mRows1;


    //BMS SOH progress bar
    
    var now = new Date();
    var yesterday = new Date(now.setDate(now.getDate()-1)).toFormat("YYYYMMDD");

    let selectQuery2 = "SELECT AVG(avg_soh) AS soh, tsd.sttc_dt, mlb.loc_seq ";
    selectQuery2 += "FROM OPENBMS.TBL_STTC_DAY tsd ";
    selectQuery2 += "JOIN OPENBMS.MPP_LOC_BTRY mlb ON tsd.btry_seq = mlb.btry_seq ";
    selectQuery2 += "JOIN OPENBMS.MPP_CMPY_LOC mcl ON mcl.loc_seq = mlb.loc_seq ";
    selectQuery2 += "JOIN OPENBMS.MPP_ACNT_CMPY mac ON mac.cmpy_seq = mcl.cmpy_seq ";
    selectQuery2 += "WHERE tsd.cmpy_seq = " + cmpy_seq + " AND tsd.sttc_dt = '" + yesterday + "' AND mac.acnt_seq = " + acnt_seq + " ";
    //selectQuery2 += "WHERE tsd.sttc_dt = '20210318' AND mac.acnt_seq = " + acnt_seq + " ";
    selectQuery2 += "GROUP BY tsd.sttc_dt, mlb.loc_seq;";

    let [rows3] = await global.mysqlPool.query(selectQuery2);
    

    res.render("dashboard/index", {BMS_LOCATION:mRows,BMS_LIST:mRows1,WEATHER_LIST:wRows, locSOH: rows3, today: today, lastweek: lastweekday});
}

exports.getIndivBatteryLog = async(req, res, next) => {

    console.log("Start getIndivBatteryLog");

    try{

        var btry_seq = req.query.btry_seq;

        var currentPage = req.body.page;

        if (currentPage == null || currentPage == '') {
            currentPage = 1;
        }

        let query1 = "SELECT COUNT(*) AS total_count ";
        query1 += "FROM OPENBMS.TBL_LOC tl ";
        query1 += "LEFT OUTER JOIN MPP_CMPY_LOC mcl ON mcl.loc_seq = tl.loc_seq ";
        //회사 seq 
        query1 +="WHERE mcl.cmpy_seq = ";
        query1 +="(SELECT mcl2.cmpy_seq FROM OPENBMS.MPP_CMPY_LOC mcl2 WHERE mcl2.loc_seq = (SELECT mlb2.loc_seq FROM OPENBMS.MPP_LOC_BTRY mlb2 WHERE mlb2.btry_seq = " + btry_seq + ")) ";
    
        let [row1] = await global.mysqlPool.query(query1);

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 5);
        paginate.getPages(5);

        let query2 = "SELECT tl.loc_seq, tl.loc_nm, tl.ins_dttm, tc.cmpy_seq, tc.cmpy_nm ";
        query2 += "FROM OPENBMS.TBL_LOC tl ";
        query2 += "LEFT OUTER JOIN MPP_CMPY_LOC mcl ON mcl.loc_seq = tl.loc_seq ";
        query2 += "LEFT OUTER JOIN TBL_CMPY tc ON tc.cmpy_seq = mcl.cmpy_seq "
        //회사 seq 
        query2 += "WHERE mcl.cmpy_seq = ";
        query2 +="(SELECT mcl2.cmpy_seq FROM OPENBMS.MPP_CMPY_LOC mcl2 WHERE mcl2.loc_seq = (SELECT mlb2.loc_seq FROM OPENBMS.MPP_LOC_BTRY mlb2 WHERE mlb2.btry_seq = " + btry_seq + ")) ";
        query2 += "LIMIT " + paginate.limit;

        let [row2] = await global.mysqlPool.query(query2);


        //회사, 설치장소, 배터리 이름
        let query3 = "SELECT CONCAT(tc.cmpy_nm,' ',tl.loc_nm,' ',tb.btry_nm) as full_btry_nm ";
            query3 +="FROM OPENBMS.TBL_BTRY tb ";
            query3 +="LEFT JOIN OPENBMS.TBL_LOC tl ON tl.loc_seq = (SELECT mlb.loc_seq FROM OPENBMS.MPP_LOC_BTRY mlb WHERE mlb.btry_seq = " + btry_seq + ") ";
            query3 +="LEFT JOIN OPENBMS.TBL_CMPY tc ON tc.cmpy_seq = (SELECT mcb.cmpy_seq FROM OPENBMS.MPP_CMPY_BTRY mcb WHERE mcb.btry_seq = " + btry_seq + "); ";

            let [row3] = await global.mysqlPool.query(query3);

        res.render("dashboard/indivbatterylog", {locList: row2, liRow: paginate.pages[paginate.page - 1], pages: paginate.threePages, btry_seq : btry_seq, btry_info: row3});
    }catch(err) {
        console.log(err);
        res.send({locList : null, liRow : "1", pages : "1"});
    }
    
}

exports.postIndivBatteryInfo = async(req,res,next) => {
    console.log("start postIndivBatteryInfo");
    try{


        var currentPage = req.body.page;

        if (currentPage == null || currentPage == '') {
            currentPage = 1;
        }

        var loc_seq = req.body.loc_seq;
        var bms_seq = req.body.bms_seq;

        let query1 = "SELECT COUNT(*) as total_count FROM ( "
            query1 += "SELECT tb.btry_nm, (SELECT tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'btry_ty' AND tc.cd = tm.btry_ty) AS btry_ty, ";
            query1 +="tb.btry_mfctor_nm, ROUND(tb.btry_max_pwr,2) as btry_max_pwr, tm.mdl_no,  ";
            query1 +="(SELECT tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'btry_mdl_ty' AND tc.cd = tm.mdl_mftr) AS mdl_mftr, ";
            query1 +="(SELECT tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'btry_stat' AND tc.cd = ";
            query1 +="(SELECT MAX(tp.chrg_stat_cd) FROM TBL_PTC_BIZ_DATA tp WHERE tp.ins_dttm = (SELECT max(tp2.ins_dttm) FROM OPENBMS.TBL_PTC_BIZ_DATA tp2 WHERE tp2.btry_seq = " + bms_seq + "))) as chrg_stat,";
            query1 +="(SELECT SUM(tsd.chrg_cnt) FROM TBL_STTC_DAY tsd WHERE tsd.btry_seq = 1) AS total_chrg_cnt ";
            query1 +="FROM OPENBMS.TBL_BTRY tb ";
            query1 +="LEFT JOIN OPENBMS.TBL_MDL tm ON tb.mdl_seq = tm.mdl_seq ";
            query1 += "where tb.btry_seq ="+bms_seq+" ";
            query1 += ") as main"; 

        let [row1] = await global.mysqlPool.query(query1); 

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 5);
        paginate.getPages(5);

        let query2 = "SELECT tb.btry_nm, (SELECT tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'btry_ty' AND tc.cd = tm.btry_ty) AS btry_ty, ";
            query2 +="tb.btry_mfctor_nm, ROUND(tb.btry_max_pwr,2) as btry_max_pwr, tm.mdl_no,  ";
            query2 +="(SELECT tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'btry_mdl_ty' AND tc.cd = tm.mdl_mftr) AS mdl_mftr, ";
            query2 +="(SELECT tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'btry_stat' AND tc.cd = ";
            query2 +="(SELECT MAX(tp.chrg_stat_cd) FROM TBL_PTC_BIZ_DATA tp WHERE tp.ins_dttm = (SELECT max(tp2.ins_dttm) FROM OPENBMS.TBL_PTC_BIZ_DATA tp2 WHERE tp2.btry_seq = " + bms_seq + "))) as chrg_stat,";
            query2 +="(SELECT SUM(tsd.chrg_cnt) FROM TBL_STTC_DAY tsd WHERE tsd.btry_seq = 1) AS total_chrg_cnt ";
            query2 +="FROM OPENBMS.TBL_BTRY tb ";
            query2 +="LEFT JOIN OPENBMS.TBL_MDL tm ON tb.mdl_seq = tm.mdl_seq ";
            query2 += "where tb.btry_seq ="+bms_seq+" ";


        let [row2] = await global.mysqlPool.query(query2); 


        res.send({ list: row2, liRow: paginate.pages[paginate.page - 1], pages: paginate.threePages });

    }catch (err){
        console.log(err);
        res.send({data : null, liRow : "1", pages : "1"});
    }

}

//그래프
exports.postChargeGraphData =async(req, res, next) => {

    console.log("postChargeGraphData start");
    let loc_seq = req.body.loc_seq;

    sess = req.session;
    var acnt_seq = sess.acnt_seq;

    let userInfo = req.session.userInfo;

    let query1 = "";

    

    if(userInfo.acnt_role == 'SA'){
        
        query1 = "SELECT tsd.sttc_dt, tsd.btry_seq, AVG(tsd.avg_chrg_time) AS chrg, AVG(tsd.avg_dischrg_time) AS dischrg, AVG(tsd.avg_standby_time) AS standby ";
        query1 += "FROM OPENBMS.TBL_STTC_DAY tsd ";
        query1 += "WHERE tsd.btry_seq IN ( ";
        query1 += "     SELECT mlb.btry_seq ";
        query1 += "	    FROM OPENBMS.MPP_LOC_BTRY mlb) ";
        query1 += "GROUP BY tsd.sttc_dt ";
        query1 += "ORDER BY tsd.sttc_dt DESC ";
        query1 += "LIMIT 30;";

    }else{

        //사용자 cmpy_seq
        let query0 = "SELECT * FROM OPENBMS.MPP_ACNT_CMPY WHERE acnt_seq = " + acnt_seq + ";";
        let [row0] = await global.mysqlPool.query(query0);
        let cmpy_seq = row0[0].cmpy_seq;

        if(loc_seq == -1){
            let query0 = "SELECT tl.loc_seq, tl.loc_nm ";
            query0 += "FROM OPENBMS.TBL_LOC tl ";
            query0 += "JOIN OPENBMS.MPP_CMPY_LOC mcl ON mcl.loc_seq = tl.loc_seq ";
            query0 += "JOIN OPENBMS.MPP_ACNT_CMPY mac ON mac.cmpy_seq = mcl.cmpy_seq ";
            query0 += "WHERE mac.acnt_seq = " + acnt_seq + " ";
            query0 += "ORDER BY tl.loc_seq ASC;";
    
            let [rows0] = await global.mysqlPool.query(query0);
    
            loc_seq = rows0[0].loc_seq;
        }
        
        
        query1 = "SELECT tsd.sttc_dt, tsd.btry_seq, AVG(tsd.avg_chrg_time) AS chrg, AVG(tsd.avg_dischrg_time) AS dischrg, AVG(tsd.avg_standby_time) AS standby ";
        query1 += "FROM OPENBMS.TBL_STTC_DAY tsd ";
        query1 += "WHERE tsd.btry_seq IN ( ";
        query1 += "     SELECT mlb.btry_seq ";
        query1 += "	    FROM OPENBMS.MPP_LOC_BTRY mlb ";
        query1 += "	    WHERE mlb.loc_seq = " + loc_seq + " ) AND tsd.cmpy_seq = " + cmpy_seq + " ";
        query1 += "GROUP BY tsd.sttc_dt ";
        query1 += "ORDER BY tsd.sttc_dt DESC ";
        query1 += "LIMIT 30;";
        
    }

    let [rows1] = await global.mysqlPool.query(query1);

    var chrgData = [];
    var dischrgData = [];
    var standbyData = [];
    var date = [];


    for(var i = 0; i < rows1.length; i++){

        date.push(rows1[rows1.length-1-i].sttc_dt);
        chrgData.push(parseFloat(rows1[rows1.length-1-i].chrg).toFixed(2));
        dischrgData.push(parseFloat(rows1[rows1.length-1-i].dischrg).toFixed(2));
        standbyData.push(parseFloat(rows1[rows1.length-1-i].standby).toFixed(2));

        
    }

    res.send({chrgData: chrgData, dischrgData: dischrgData, standbyData: standbyData, date: date, locSeq: loc_seq})
}


exports.postSOCGraphData =async(req, res, next) => {
    console.log("postSOCGraphData start");
    let loc_seq = req.body.loc_seq;

    var nowDate = new Date();

    //현재 년, 월
    if(parseInt(nowDate.getMonth() / 10) < 1){
        var nowMonth = nowDate.getFullYear() + "0" + nowDate.getMonth();
    } else {
        var nowMonth = nowDate.getFullYear() + "" + nowDate.getMonth();
    }
    
    nowMonth = parseInt(parseInt(nowMonth) + 1);

    var nowMonth2 = nowMonth;

    //x축에 들어갈 년월 데이터(지금으로부터 12개월 전까지)
    var monthData = Array.from({length: 12}, () => 0);
    for(var i = 0; i < 12; i++){
        monthData[11 - i] = nowMonth2;
        nowMonth2 -= 1;
        if(nowMonth2 % 10 == 0){
            var lastYear = nowDate.getFullYear() - 1;
            nowMonth2 = lastYear * 100 + 12;
        }
    }


    sess = req.session;
    var acnt_seq = sess.acnt_seq;

    //사용자 cmpy_seq
    let query0 = "SELECT * FROM OPENBMS.MPP_ACNT_CMPY WHERE acnt_seq = " + acnt_seq + ";";
    let [row0] = await global.mysqlPool.query(query0);
    let cmpy_seq = row0[0].cmpy_seq;

    //개수 데이터
    var badData = Array.from({length: 12}, () => null);
    var normData = Array.from({length: 12}, () => null);
    var goodData = Array.from({length: 12}, () => null);

    //bad
    let query1 = "SELECT COUNT(*) as cnt, tsm.sttc_month ";
    query1 += "FROM OPENBMS.TBL_STTC_MONTH tsm ";
    query1 += "JOIN OPENBMS.MPP_LOC_BTRY mlb ON mlb.btry_seq = tsm.btry_seq ";
    query1 += "WHERE tsm.cmpy_seq = " + cmpy_seq + " AND tsm.avg_soh < 60  AND mlb.loc_seq = " + loc_seq + " ";
    query1 += "GROUP BY tsm.sttc_month ";
    query1 += "LIMIT 12;";

    let [rows1] = await global.mysqlPool.query(query1);

    //norm
    let query2 = "SELECT COUNT(*) as cnt, tsm.sttc_month ";
    query2 += "FROM OPENBMS.TBL_STTC_MONTH tsm ";
    query2 += "JOIN OPENBMS.MPP_LOC_BTRY mlb ON mlb.btry_seq = tsm.btry_seq ";
    query2 += "WHERE tsm.cmpy_seq = " + cmpy_seq + " AND tsm.avg_soh >= 61 AND tsm.avg_soh < 80  AND mlb.loc_seq = " + loc_seq + " ";
    query2 += "GROUP BY tsm.sttc_month ";
    query2 += "LIMIT 12;";

    let [rows2] = await global.mysqlPool.query(query2);

    //good
    let query3 = "SELECT COUNT(*) as cnt, tsm.sttc_month ";
    query3 += "FROM OPENBMS.TBL_STTC_MONTH tsm ";
    query3 += "JOIN OPENBMS.MPP_LOC_BTRY mlb ON mlb.btry_seq = tsm.btry_seq ";
    query3 += "WHERE tsm.cmpy_seq = " + cmpy_seq + " AND tsm.avg_soh >= 81 AND mlb.loc_seq = " + loc_seq + " ";
    query3 += "GROUP BY tsm.sttc_month ";
    query3 += "LIMIT 12;";

    let [rows3] = await global.mysqlPool.query(query3);


    for(var i = 0; i < rows1.length; i++){
        var month = nowMonth - parseInt(rows1[i].sttc_month);
        month =  month > 12 ? month - 88 : month;
        badData[11- month] += rows1[i].cnt;
    }

    for(var i = 0; i < rows2.length; i++){
        var month = nowMonth - parseInt(rows2[i].sttc_month);
        month =  month > 12 ? month - 88 : month;

        normData[11- month] += rows2[i].cnt;
    }
    
    for(var i = 0; i < rows3.length; i++){
        var month = nowMonth - parseInt(rows3[i].sttc_month);
        month =  month > 12 ? month - 88 : month;

        goodData[11- month] += rows3[i].cnt;
    }

    res.send({badData: badData, normData: normData, goodData: goodData, monthData: monthData})
}

exports.postDashBMSList =async(req, res, next) => {

    //장소별 bms list
    console.log("start postDashBMSList");

    try {
        var currentPage = req.body.page;

        if (currentPage == null || currentPage == '') {
            currentPage = 1;
        }

        let info = {
            loc: req.body.loc
        }

        let query1 = "SELECT COUNT(*) AS total_count ";
        query1 += "FROM OPENBMS.TBL_BTRY tb ";
        query1 += "LEFT OUTER JOIN MPP_LOC_BTRY mlb ON mlb.btry_seq = tb.btry_seq ";
        query1 += "WHERE mlb.loc_seq = " + info.loc + ";";

        let [row1] = await global.mysqlPool.query(query1);

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 5);
        paginate.getPages(5);

        function lastWeek() {
            var d = new Date();
            var dayOfMonth = d.getDate();
            d.setDate(dayOfMonth - 7);
            return d;
        }

        var now = new Date();
        var today = now.toFormat("YYYYMMDD");
        var lastweekday = lastWeek().toFormat("YYYYMMDD");

        sess = req.session;
        var acnt_seq = sess.acnt_seq;

        //사용자 cmpy_seq
        let query0 = "SELECT * FROM OPENBMS.MPP_ACNT_CMPY WHERE acnt_seq = " + acnt_seq + ";";
        let [row0] = await global.mysqlPool.query(query0);
        let cmpy_seq = row0[0].cmpy_seq;
        
        
        let query2 = "SELECT * ";
        query2 += "FROM (";
        query2 += "     SELECT tb.btry_nm, tb.btry_mfctor_nm, tb.btry_max_pwr, tsd1.btry_seq, tsd1.sttc_dt, tsd1.avg_chrg_time, tsd1.avg_dischrg_time, tsd1.avg_standby_time, tsd1.avg_soc, tsd1.avg_soh, tsd1.chrg_cnt ";
        query2 += "     FROM OPENBMS.TBL_STTC_DAY tsd1";
        query2 += "   JOIN OPENBMS.TBL_BTRY tb ON tb.btry_seq = tsd1.btry_seq "
        query2 += "     WHERE (tsd1.btry_seq, tsd1.sttc_dt) IN (";
        query2 += "         SELECT tsd2.btry_seq, MAX(tsd2.sttc_dt)";
        query2 += "         FROM OPENBMS.TBL_STTC_DAY tsd2";
        query2 += "         WHERE tsd2.btry_seq IN (";
        query2 += "             SELECT mlb.btry_seq";
        query2 += "             FROM OPENBMS.MPP_LOC_BTRY mlb";
        query2 += "             WHERE mlb.loc_seq = " + info.loc + ")";
        query2 += "         GROUP BY tsd2.btry_seq)";
        query2 += "         AND tsd1.cmpy_seq = " + cmpy_seq + " AND tsd1.sttc_dt BETWEEN '"+ lastweekday + "' AND '"+ today + "'";
        query2 += "     ) a";
        query2 += " GROUP BY a.btry_seq, a.sttc_dt";
        query2 += " LIMIT " + paginate.limit;

        
        let [row2] = await global.mysqlPool.query(query2);

        for(var i in row2){
            row2[i].avg_chrg_time = utiljs.minuteFormat(row2[i].avg_chrg_time);
            row2[i].avg_dischrg_time = utiljs.minuteFormat(row2[i].avg_dischrg_time);
            row2[i].avg_standby_time = utiljs.minuteFormat(row2[i].avg_standby_time);

            let pwrAndUnit = utiljs.unitConvertWithComma(row2[i].btry_max_pwr);
            row2[i].btry_max_pwr = pwrAndUnit.power.toString() + pwrAndUnit.unit.toString();
        }



        res.send({ btryList: row2, liRow: paginate.pages[paginate.page - 1], pages: paginate.threePages });
    } catch (err){
        console.log(err);
        res.send({btryList : null, liRow : "1", pages : "1"});
    }

}

exports.postGraphHeader =async(req, res, next) => {
    console.log("start postGraphHeader");
    let loc_seq = req.body.loc_seq;

    sess = req.session;
    var acnt_seq = sess.acnt_seq;

    let userInfo = req.session.userInfo;

    let query1 = "";

    if(userInfo.acnt_role == 'SA'){
        
        query1 = "SELECT tb.btry_seq, tb.btry_max_pwr, MAX(CONCAT(tpbd.biz_dt,tpbd.biz_h,tpbd.biz_m,'00')) AS dttm, tpbd.chrg_stat_cd ";
        query1 += "FROM OPENBMS.TBL_BTRY tb ";
        query1 += "LEFT OUTER JOIN OPENBMS.MPP_LOC_BTRY mlb ON mlb.btry_seq = tb.btry_seq ";
        query1 += "LEFT OUTER JOIN OPENBMS.TBL_PTC_BIZ_DATA tpbd ON tpbd.btry_seq = tb.btry_seq AND CONCAT(tpbd.biz_dt,tpbd.biz_h,tpbd.biz_m) = (SELECT MAX(CONCAT(tpbd2.biz_dt,tpbd2.biz_h,tpbd2.biz_m)) FROM OPENBMS.TBL_PTC_BIZ_DATA tpbd2) ";
        query1 += "WHERE mlb.loc_seq = " + loc_seq + " ";
        query1 += "GROUP BY tb.btry_seq;";
    }else{
        if(loc_seq == -1){
            let query0 = "SELECT tl.loc_seq, tl.loc_nm ";
            query0 += "FROM OPENBMS.TBL_LOC tl ";
            query0 += "JOIN OPENBMS.MPP_CMPY_LOC mcl ON mcl.loc_seq = tl.loc_seq ";
            query0 += "JOIN OPENBMS.MPP_ACNT_CMPY mac ON mac.cmpy_seq = mcl.cmpy_seq ";
            query0 += "WHERE mac.acnt_seq = " + acnt_seq + " ";
            query0 += "ORDER BY tl.loc_seq ASC;";
    
            let [rows0] = await global.mysqlPool.query(query0);
    
            loc_seq = rows0[0].loc_seq;
        }
        
        //사용자 cmpy_seq
        let query0 = "SELECT * FROM OPENBMS.MPP_ACNT_CMPY WHERE acnt_seq = " + acnt_seq + ";";
        let [row0] = await global.mysqlPool.query(query0);
        let cmpy_seq = row0[0].cmpy_seq;

        query1 = "SELECT tb.btry_seq, tb.btry_max_pwr, MAX(CONCAT(tpbd.biz_dt,tpbd.biz_h,tpbd.biz_m,'00')) AS dttm, tpbd.chrg_stat_cd ";
        query1 += "FROM OPENBMS.TBL_BTRY tb ";
        query1 += "LEFT OUTER JOIN OPENBMS.MPP_LOC_BTRY mlb ON mlb.btry_seq = tb.btry_seq ";
        query1 += "LEFT OUTER JOIN OPENBMS.TBL_PTC_BIZ_DATA tpbd ON tpbd.btry_seq = tb.btry_seq AND CONCAT(tpbd.biz_dt,tpbd.biz_h,tpbd.biz_m) = (SELECT MAX(CONCAT(tpbd2.biz_dt,tpbd2.biz_h,tpbd2.biz_m)) FROM OPENBMS.TBL_PTC_BIZ_DATA tpbd2)";
        query1 += "WHERE tpbd.cmpy_seq = " + cmpy_seq + " AND mlb.loc_seq = " + loc_seq + " ";
        query1 += "GROUP BY tb.btry_seq;";
    }

    let [rows1] = await global.mysqlPool.query(query1);

    var countY=0;
    var countC=0;
    var countN=0;
    var maxPwr = 0;
    var maxPwrUnit = "Wh";

    for(var i = 0; i < rows1.length; i++){
        if (rows1[i].dttm != null){
            var ins = new Date(rows1[i].dttm);
            var now = new Date();

            var diff = (now.getTime() - ins.getTime())/1000/60/60;

            if ( diff > 24){
                countN += 1;
            } else {
                if (rows1[i].chrg_stat_cd == 'C'){
                    countC += 1;
                    maxPwr += (rows1[i].btry_max_pwr* 1);
                } else if (rows1[i].chrg_stat_cd == 'DC'){
                    countY += 1;
                    maxPwr += (rows1[i].btry_max_pwr* 1);
                } else {
                    countN += 1;
                }
            }
        } else {
            countN +=  1;
        }

    }

    let pwrAndUnit = utiljs.unitConvertWithComma(maxPwr);
    maxPwr = pwrAndUnit.power;
    maxPwrUnit = pwrAndUnit.unit;

    res.send({countY: countY, countC: countC, countN: countN, maxPwr: maxPwr, maxPwrUnit : maxPwrUnit})
}

exports.getViewProfile =async(req, res, next) => {
    console.log("start getViewProfile");

    var userInfo = req.session.userInfo;

    var info = {
        acnt_seq : userInfo.acnt_seq
    }

    try{

        let sql = "select * from OPENBMS.TBL_ACNT where acnt_seq = " + info.acnt_seq;
        let [row] = await global.mysqlPool.query(sql);

        let sql1 = " select tc.* from OPENBMS.TBL_CD tc ";
        sql1+= "WHERE tc.gp_cd = 'cmpy_ty' ";
        sql1+= "ORDER BY tc.cd_seq ASC ";
        let [row1] = await global.mysqlPool.query(sql1);

        let sql2 = " select tc.* from OPENBMS.TBL_CD tc ";
            sql2+= "WHERE tc.gp_cd = 'role' ";
            sql2+= "ORDER BY tc.cd_seq ASC ";
        let [row2] = await global.mysqlPool.query(sql2);

        let sql3 = " select tc.* from OPENBMS.TBL_CMPY tc ";
            sql3+= "ORDER BY tc.cmpy_seq ASC ";
        let [row3] = await global.mysqlPool.query(sql3);

        res.render("dashboard/viewProfile",{acntInfo : row, cmpyTyList : row1, roleList : row2, cmpyList: row3});
    }catch (error) {
        console.log(error);
        res.render("dashboard/viewProfile",{acntInfo : null, cmpyTyList : null, roleList : null, cmpyList: null});
    }

}

exports.postCheckCurrentPw =async(req, res, next) => {

    console.log("start postCheckCurrentPw");

    try {
        var current_pw = req.body.current_pw;
        var userInfo = req.session.userInfo;

        var status = "FAIL";
        var msg= "현재 비밀번호가 일치하지 않습니다."
    
        let selectQuery1 = "select * from OPENBMS.TBL_ACNT ";
        selectQuery1 += "WHERE acnt_seq = '" + userInfo.acnt_seq + "' ";
    
        let [rows1] = await global.mysqlPool.query(selectQuery1);
    
        let hashPassword = encryption.password.validate(current_pw, rows1[0].acnt_pw_salt);
    
        // chk query
        let selectQuery2 = "select * from OPENBMS.TBL_ACNT ta ";
        selectQuery2 += "LEFT OUTER JOIN OPENBMS.TBL_CMPY tc ON ta.cmpy_seq = tc.cmpy_seq "
        selectQuery2 += " where ta.acnt_seq='" + userInfo.acnt_seq + "'";
        selectQuery2 += "  and ta.acnt_pw = '" + hashPassword + "'";
    
        let [mRows] = await global.mysqlPool.query(selectQuery2);
    
        if (mRows.length <= 0) {
            status = "FAIL";
            msg = "현재 비밀번호가 일치하지 않습니다.";
        }else{
            status = "SUCCESS";
            msg = "성공";
        }

        res.send({msg: msg, status: status});

    } catch (error) {
        console.log(error);
        res.send({msg: "서버 오류 발생", status: "FAIL"});
    }

}

exports.postPwModComplete =async(req, res, next) => {

    console.log("start postPwModComplete");

    try {
        var new_pw = req.body.new_pw;
        var userInfo = req.session.userInfo;

        var msg= "서버 오류 발생";
        var status= "FAIL";
    
        let pAndS = encryption.createPassword(new_pw);
    
        let updatequery1 = "UPDATE OPENBMS.TBL_ACNT ";
            updatequery1+= "SET acnt_pw = '" + pAndS.hashPassword + "', "; 
            updatequery1+= "acnt_pw_salt = '" + pAndS.salt + "' "; 
            updatequery1+= "WHERE acnt_seq = '" + userInfo.acnt_seq + "';";
    
        let [rows1] = await global.mysqlPool.query(updatequery1);

        if(rows1.changedRows == 1){
            msg="비밀번호가 변경되었습니다.";
            status="SUCCESS";
        }

        res.send({msg: msg, status: status});

    } catch (error) {
        console.log(error);
        res.send({msg: msg, status: status});
    }

}