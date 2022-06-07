// const asyncWrapper = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next());
// const form = require('../../config/form.js');

const { globalAgent } = require("http");
const path = require("path");
const Pagination = require(path.join(global.appRoot,"/modules/pagination.js"));
const utiljs = require(path.join(global.appRoot,"/modules/util.js"));
const viewName = 'operation/';

exports.getAnalytics = (req, res, next) => {
    res.render(viewName+"analytics/analytics");
}

exports.getHealth = async(req, res, next) => {
    console.log("getHealth start");

    sess = req.session;
    var acnt_seq = sess.acnt_seq;

    var userInfo = req.session.userInfo;

    try {
        var currentPage = req.body.page;

        if(currentPage == null || currentPage == ''){
            currentPage = 1;
        }

        let query0 = "";

        if(userInfo.acnt_role == "SA"){
            query0 = "SELECT * FROM OPENBMS.MPP_ACNT_CMPY;";
        }else{
            query0 = "SELECT * FROM OPENBMS.MPP_ACNT_CMPY WHERE acnt_seq = " + acnt_seq + ";";
        }

        let [row0] = await global.mysqlPool.query(query0);

        let cmpy_seq = row0[0].cmpy_seq;

        let query1 = "";
    
        if(userInfo.acnt_role == "SA"){
            query1 += "SELECT COUNT(*) AS total_count ";
            query1 += "FROM OPENBMS.TBL_LOC tl ";
            query1 += "LEFT OUTER JOIN OPENBMS.MPP_CMPY_LOC mcl ON mcl.loc_seq = tl.loc_seq ";
        }else{
            query1 += "SELECT COUNT(*) AS total_count ";
            query1 += "FROM OPENBMS.TBL_LOC tl ";
            query1 += "LEFT OUTER JOIN OPENBMS.MPP_CMPY_LOC mcl ON mcl.loc_seq = tl.loc_seq ";
            //회사 seq 
            query1 += "WHERE mcl.cmpy_seq = " + cmpy_seq + ";";
        }
    
        let [row1] = await global.mysqlPool.query(query1);

       // console.log(row1)
    
        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 5);
        paginate.getPages(5);
        
    
        let query2 = "SELECT tl.loc_seq, tl.loc_nm, tl.ins_dttm, tc.cmpy_seq, tc.cmpy_nm  , truncate(sum(tb.btry_max_pwr),0) as btry_max_pwr ";
        query2 += " FROM OPENBMS.TBL_LOC tl ";
        query2 += " LEFT OUTER JOIN OPENBMS.MPP_CMPY_LOC mcl ON mcl.loc_seq = tl.loc_seq ";
        query2 += " LEFT OUTER JOIN OPENBMS.TBL_CMPY tc ON tc.cmpy_seq = mcl.cmpy_seq ";
        query2 += " LEFT OUTER JOIN OPENBMS.TBL_ACNT ta ON ta.cmpy_seq = mcl.cmpy_seq ";
        query2 += " LEFT OUTER JOIN OPENBMS.MPP_LOC_BTRY  mcb ON tl.loc_seq = mcb.loc_seq"; 
        query2 += " LEFT OUTER JOIN OPENBMS.TBL_BTRY tb ON tb.btry_seq = mcb.btry_seq ";    
        //회사 seq 
        query2 += "WHERE ta.cmpy_seq = " + cmpy_seq + " ";
        query2 += "GROUP BY tl.loc_seq ";
        query2 += "ORDER BY tl.loc_seq ";
        query2 += "LIMIT " + paginate.limit;
        
       // console.log("query2:"+query2)

        let [row2] = await global.mysqlPool.query(query2);

        for(var i = 0; i < row2.length; i++){
            let pwrAndUnit = utiljs.unitConvertWithComma(row2[i].btry_max_pwr);
            row2[i].btry_max_pwr = pwrAndUnit.power + pwrAndUnit.unit;
            row2[i].ins_dttm = row2[i].ins_dttm.toFormat('YYYY-MM-DD');
        }
        console.log("getHealth end");
        res.render(viewName+"analytics/health", {locList: row2, liRow : paginate.pages[paginate.page - 1], pages : paginate.threePages});
    } catch (err) {
        console.log(err);
        res.render(viewName+"analytics/health",{locList : null, liRow : "1", pages : "1"});
    }
}

/***
 * http://localhost:8104/analytics/health
 * 하단 배터리 상세정보 목록
 * Ajax
 */
exports.postbtryDetailList = async(req, res, next) => {
    //장소별 bms list
    console.log("postbtryDetailList start");

    let info = {
        loc: req.body.loc_seq
    }

    try{
        var currentPage = req.body.page;

        if (currentPage == null || currentPage == '') {
            currentPage = 1;
        }

        sess = req.session;
        var acnt_seq = sess.acnt_seq;

        let query1 = "SELECT COUNT(*) AS total_count ";
        query1 += "FROM OPENBMS.TBL_LOC tl ";
        query1 += "LEFT OUTER JOIN MPP_CMPY_LOC mcl ON mcl.loc_seq = tl.loc_seq ";
        query1 += "LEFT OUTER JOIN OPENBMS.TBL_ACNT ta ON ta.cmpy_seq = mcl.cmpy_seq "
        //회사 seq 
        query1 += "WHERE ta.acnt_seq = " + acnt_seq + ";";
    
        let [row1] = await global.mysqlPool.query(query1);

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 5);
        paginate.getPages(5);

        let query2 = "SELECT mlb.loc_seq , tb.btry_seq , tb.btry_nm , truncate(tb.btry_max_pwr,0) as  btry_max_pwr , tb.btry_mfctor_nm , tc.ins_dttm , IFNULL(truncate(tbcs.end_soh,0),0) as  end_soh , IFNULL(DATE_FORMAT(tbcs.start_dttm ,'%Y-%m-%d %T'),'없음') as last_dttm";
        query2 += " , IFNULL(truncate(sum(tsd.chrg_cnt),0),0) as chrg_cnt , truncate(tsd.avg_soc,0) as avg_soc, truncate(tsd.avg_soh,0) as avg_soh ,IFNULL(truncate(AVG(tsd.avg_chrg_time),0),0) as avg_chrg_time ";
        query2 += " FROM OPENBMS.TBL_BTRY tb "; 
        query2 += " LEFT OUTER JOIN OPENBMS.MPP_LOC_BTRY mlb ON mlb.btry_seq = tb.btry_seq ";
        query2 += " LEFT OUTER JOIN OPENBMS.MPP_CMPY_LOC mcl ON mcl.loc_seq = mlb.loc_seq ";
        query2 += "LEFT OUTER JOIN OPENBMS.TBL_CMPY tc ON tc.cmpy_seq = mcl.cmpy_seq  ";
        query2 += " LEFT OUTER JOIN OPENBMS.TBL_BTRY_CHRG_STAT tbcs ON tbcs.btry_seq = tb.btry_seq "; 
        query2 += " LEFT OUTER JOIN OPENBMS.TBL_STTC_DAY tsd ON tb.btry_seq  = tsd.btry_seq ";
        query2 += "where mlb.loc_seq = "+info.loc + " " ;        
        query2 += "group by tb.btry_seq ";
        
        query2 += "LIMIT " + paginate.limit;

       // console.log("query2:"+query2)


        let [row2] = await global.mysqlPool.query(query2);


        for(var i = 0; i < row2.length; i++){
            let pwrAndUnit = utiljs.unitConvertWithComma(row2[i].btry_max_pwr);
            row2[i].btry_max_pwr = pwrAndUnit.power + pwrAndUnit.unit;
            row2[i].ins_dttm = row2[i].ins_dttm.toFormat('YYYY-MM-DD');
        }

       // console.log(row2);        
       console.log("postbtryDetailList end");
        res.send({ BtryDetailList: row2, liRow: paginate.pages[paginate.page - 1], pages: paginate.threePages });

    }catch(err){
        console.log(err);
        res.send({BtryDetailList : null, liRow : "1", pages : "1"});
    }

}
/***
 * 개별 BMS 기기별 건강상태분석
 * http://localhost:8104/analytics/health
 * 
 */
exports.postbtryDetail = async(req, res, next) => {
    //장소별 bms list
    console.log("postbtryDetail start");

    try{
        var currentPage = req.body.page;

        if (currentPage == null || currentPage == '') {
            currentPage = 1;
        }
        let info = {
            btry_seq: req.body.btry_seq
        }
        sess = req.session;
        var acnt_seq = sess.acnt_seq;

        let query2 = "SELECT mlb.loc_seq , tb.btry_seq , tb.btry_nm , truncate(tb.btry_max_pwr,0) as  btry_max_pwr , tb.btry_mfctor_nm , tc.ins_dttm , IFNULL(truncate(tbcs.end_soh,0),0) as  end_soh , IFNULL(DATE_FORMAT(tbcs.start_dttm ,'%Y-%m-%d %T'),'없음') as last_dttm";
        query2 += " , IFNULL(truncate(sum(tsd.chrg_cnt),0),0) as chrg_cnt , truncate(tsd.avg_soc,0) as avg_soc, truncate(tsd.avg_soh,0) as avg_soh ,IFNULL(truncate(AVG(tsd.avg_chrg_time),0),0) as avg_chrg_time ";
        query2 += " FROM OPENBMS.TBL_BTRY tb "; 
        query2 += " LEFT OUTER JOIN OPENBMS.MPP_LOC_BTRY mlb ON mlb.btry_seq = tb.btry_seq ";
        query2 += " LEFT OUTER JOIN OPENBMS.MPP_CMPY_LOC mcl ON mcl.loc_seq = mlb.loc_seq ";
        query2 += "LEFT OUTER JOIN OPENBMS.TBL_CMPY tc ON tc.cmpy_seq = mcl.cmpy_seq  ";
        query2 += " LEFT OUTER JOIN OPENBMS.TBL_BTRY_CHRG_STAT tbcs ON tbcs.btry_seq = tb.btry_seq "; 
        query2 += " LEFT OUTER JOIN OPENBMS.TBL_STTC_DAY tsd ON tb.btry_seq  = tsd.btry_seq ";
        query2 += "WHERE tb.btry_seq = " + info.btry_seq + " ";

        //console.log("query2:"+query2)


        let [row2] = await global.mysqlPool.query(query2);

        var now = new Date();
        var today = new Date(now.getFullYear,now.getMonth,now.getDay)
        
        let pwrAndUnit = utiljs.unitConvertWithComma(row2[0].btry_max_pwr);
        row2[0].btry_max_pwr = pwrAndUnit.power + pwrAndUnit.unit;
        row2[0].ins_dttm = row2[0].ins_dttm.toFormat('YYYY-MM-DD');
        var now1 = new Date(row2[0].ins_dttm);
        
        row2[0].diff = Math.ceil((now.getTime()-now1.getTime())/(1000*3600*24));
       // console.log("row2[i].diff:"+row2[0].diff);

       // console.log(row2);
       console.log("postbtryDetail end");
        res.send({BMSInfo : row2});
       
    }catch(err){
        console.log(err);
        res.send({BMSInfo : null});
    }

}



exports.postFirstLiveData = async(req, res, next) => {
    console.log("postFirstLiveData start");

    var btry_seq = req.body.bms_seq;
    

    //그래프 처음 10개 데이터

    let query1 = "SELECT volt_sys as volt, curr_sys as curr, soc, soh, ins_dttm FROM OPENBMS.TBL_PTC_BIZ_DATA ";
    query1 += "WHERE btry_seq = " + btry_seq + " ";
    query1 += "ORDER BY ins_dttm DESC ";
    query1 += "LIMIT 10";
    
    //console.log(query1);

    let [rows1] = await global.mysqlPool.query(query1);
   // console.log(rows1);

    var currData = [];
    var voltData = [];
    var socData = [];
    var sohData = [];
    var xData = [];


    for(var i = 0; i < rows1.length; i++){

        xData.push(rows1[9-i].ins_dttm)
        currData.push(parseFloat(rows1[9-i].curr).toFixed(2));
        voltData.push(parseFloat(rows1[9-i].volt).toFixed(2));
        socData.push(parseFloat(rows1[9-i].soc).toFixed(2));
        sohData.push(parseFloat(rows1[9-i].soh).toFixed(2));
    }

    //SOC 계산할 최대 전압
    let query2 = "SELECT btry_max_volt, btry_min_volt, btry_rat_volt, btry_rat_curr, btry_max_curr, btry_min_curr FROM OPENBMS.TBL_BTRY WHERE btry_seq = " + btry_seq + ";";

    let [rows2] = await global.mysqlPool.query(query2);
    //console.log(rows2);
    console.log("postFirstLiveData end");

    res.send({currData: currData, voltData: voltData, socData: socData, sohData: sohData, btry_info: rows2[0], xData: xData});
    
}
/***
 * http://localhost:8104/analytics/analytics
 * 이전데이터분석 화면 
 */

exports.postAnalyticsFirstLiveData = async(req, res, next) => {
   // var loc_seq = req.body.loc_seq;
   // var btry_seq = req.body.bms_seq;
    //var searchtype = req.body.searchtype;
    console.log("postAnalyticsFirstLiveData start");
    let info = {
        loc_seq : req.body.loc_seq,
        btry_seq : req.body.btry_seq,
        searchtype : req.body.searchtype
    }

    //console.log("info.searchtype:"+info.searchtype);
    //console.log("info.loc_seq:"+info.loc_seq);
    //console.log("info.btry_seq:"+info.btry_seq);

    //그래프 처음 10개 데이터
    let query1 = "";
    if(info.searchtype == "1"){
         // 장소별 조회
        // 충전횟수, 충전시간, SOH
        query1 = "select AVG(tsd.avg_chrg_time) as avg_chrg_time,  AVG(tsd.chrg_cnt)  as chrg_cnt, ";
        query1 += " tsd.sttc_dt as sttc_dt, AVG(tsd.avg_soh) as avg_soh  ";
        query1 += " from OPENBMS.TBL_STTC_DAY tsd ";
        query1 += " where  tsd.btry_seq in (select btry_seq from OPENBMS.MPP_LOC_BTRY mcl where loc_seq = "+info.loc_seq+")";  
        query1 += " group by tsd.sttc_dt ";
        query1 += " ORDER BY  tsd.sttc_dt  desc LIMIT 10";
    }else  if(info.searchtype == "2"){
        // 배터리별 조회
        // 충전횟수, 충전시간, SOH
        query1 = "select tsd.btry_seq, tsd.avg_chrg_time as avg_chrg_time, ";
        query1 += " (tsd.chrg_cnt)  as chrg_cnt, tsd.sttc_dt as sttc_dt, (tsd.avg_soh) as avg_soh ";
        query1 += " from OPENBMS.TBL_STTC_DAY tsd ";
        query1 += " where  tsd.btry_seq = "+info.btry_seq ;
        query1 += " ORDER BY  tsd.sttc_dt  desc LIMIT 10";
    }

    let [rows1] = await global.mysqlPool.query(query1);
  //  console.log(rows1);

    var avg_chrg_time = [];
    var chrg_cnt = []; 
    var sttc_dt = [];
    var avg_soh = [];
   
    var len = rows1.length;
   // console.log("rows1.length:"+rows1.length);

    for(var i = 0; i < rows1.length; i++){

        sttc_dt.push(rows1[i].sttc_dt)
        chrg_cnt.push(parseFloat(rows1[i].chrg_cnt).toFixed(2));
        avg_chrg_time.push(parseFloat(rows1[i].avg_chrg_time).toFixed(2));   
        avg_soh.push(parseFloat(rows1[i].avg_soh).toFixed(2));    
             
    }

    console.log("postAnalyticsFirstLiveData end");
    
    res.send({avg_soh: avg_soh, avg_chrg_time: avg_chrg_time, chrg_cnt: chrg_cnt, sttc_dt: sttc_dt, len:rows1.length});
    
}