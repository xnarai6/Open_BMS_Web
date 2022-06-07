const https = require('https');
const axios = require('axios');
const path = require("path");
const { max } = require('moment');
const Pagination = require(path.join(global.appRoot,"/modules/pagination.js"));
const encryption = require(path.join(global.appRoot,"/modules/encryption.js"));
const utiljs = require(path.join(global.appRoot,"/modules/util.js"));
const viewName = 'operation/dashboard/';


exports.getDashboard =async(req, res, next) => {
    console.log("start getDashboard in Operation");

    try{

    sess = req.session;
    var acnt_seq = sess.acnt_seq;
    
    // 로그인 확인
    if(acnt_seq < 0 || acnt_seq == null || acnt_seq == undefined){
        res.redirect('/account/login');
    }

    var acnt_role = sess.userInfo.acnt_role;

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

    res.render(viewName + "index", {BMS_LOCATION:mRows,BMS_LIST:mRows1,WEATHER_LIST:wRows, locSOH: rows3, today: today, lastweek: lastweekday});

}catch (error) {
    console.log(error);
}
    
}
