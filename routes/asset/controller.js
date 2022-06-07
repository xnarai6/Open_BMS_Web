// const asyncWrapper = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next());
// const form = require('../../config/form.js');

const { globalAgent } = require("http");
const path = require("path");
const Pagination = require(path.join(global.appRoot,"/modules/pagination.js"));
const utiljs = require(path.join(global.appRoot,"/modules/util.js"));

exports.getAssetlocation = async(req, res, next) => {
    //자산관리 메뉴

    sess = req.session;
    var acnt_seq = sess.acnt_seq;

    var userInfo = req.session.userInfo;

    try {
        var currentPage = req.body.page;

        if(currentPage == null || currentPage == ''){
            currentPage = 1;
        }

        let query0 = "SELECT * FROM OPENBMS.MPP_ACNT_CMPY WHERE acnt_seq = " + acnt_seq + ";";

        let [row0] = await global.mysqlPool.query(query0);

        let cmpy_seq = row0[0].cmpy_seq;
    
        let query1 = "";

        if(userInfo.acnt_role == "SA"){
            query1 = "SELECT COUNT(*) AS total_count ";
            query1 += "FROM OPENBMS.TBL_LOC tl ";
        }else{
            query1 = "SELECT COUNT(*) AS total_count ";
            query1 += "FROM OPENBMS.TBL_LOC tl ";
            query1 += "LEFT OUTER JOIN MPP_CMPY_LOC mcl ON mcl.loc_seq = tl.loc_seq ";
            //회사 seq 
            query1 += "WHERE mcl.cmpy_seq = " + cmpy_seq + ";";
        }
    
        let [row1] = await global.mysqlPool.query(query1);

    
        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 5);
        paginate.getPages(5);
        
    
        let query2 = "SELECT mcl.cmpy_seq, tl.loc_seq, tl.loc_nm, tl.loc_lat, tl.ins_dttm, tl.upd_dttm, IFNULL(COUNT(tb.btry_seq),0) AS btry_cnt, IFNULL(SUM(tb.btry_max_volt),0) AS volt_sum, IFNULL(SUM(tb.btry_max_curr),0) AS curr_sum, IFNULL(SUM(tb.btry_max_pwr),0) AS btry_max_pwr ";
        query2 += "FROM OPENBMS.TBL_LOC tl ";
        query2 += "LEFT OUTER JOIN MPP_CMPY_LOC mcl ON mcl.loc_seq = tl.loc_seq ";
        query2 += "LEFT OUTER JOIN MPP_LOC_BTRY mlb ON mlb.loc_seq = tl.loc_seq ";
        query2 += "LEFT OUTER JOIN TBL_BTRY tb ON tb.btry_seq = mlb.btry_seq ";
    
        if(userInfo.acnt_role == "SA"){
            //회사 seq 
            query2 += "GROUP BY tl.loc_seq ";
            query2 += "ORDER BY tl.loc_seq ";
            query2 += "LIMIT " + paginate.limit;
        }else{
            //회사 seq 
            query2 += "WHERE mcl.cmpy_seq = " + cmpy_seq + " ";
            query2 += "GROUP BY tl.loc_seq ";
            query2 += "ORDER BY tl.loc_seq ";
            query2 += "LIMIT " + paginate.limit;
        }
    
        let [row2] = await global.mysqlPool.query(query2);


        for(var i = 0; i < row2.length; i++){
            let pwrAndUnit = utiljs.unitConvertWithComma(row2[i].btry_max_pwr);
            row2[i].btry_max_pwr = pwrAndUnit.power + pwrAndUnit.unit;
            row2[i].ins_dttm = row2[i].ins_dttm.toFormat('YYYY-MM-DD');
        }

        res.render("asset/assetlocation", {locList: row2, liRow : paginate.pages[paginate.page - 1], pages : paginate.threePages});
    } catch (err) {
        console.log(err);
        res.render("asset/assetlocation",{locList : null, liRow : "1", pages : "1"});
    }
    
}
/***
 * 화면하단 배터리 상세정보
 */
exports.postAssetlocationBtry = async(req, res, next) => {
    //장소별 bms list
    console.log("start postAssetlocationBtry");

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



        let query2 = "SELECT mlb.loc_seq , tb.btry_seq , tb.btry_nm , IFNULL(truncate(tb.btry_max_pwr,0),0) as btry_max_pwr  , tb.btry_mfctor_nm , tc.ins_dttm , IFNULL(truncate(tbcs.end_soh,0),0) as end_soh ";
        query2 += " , IFNULL(sum(tsd.chrg_cnt),0) as chrg_cnt , IFNULL(truncate(tsd.avg_soc,0),0) as avg_soc, IFNULL(tsd.avg_soh,0) as avg_soh , IFNULL(truncate(AVG(tsd.avg_chrg_time),0),0) as avg_chrg_time ";
        query2 += " FROM OPENBMS.TBL_BTRY tb "; 
        query2 += " LEFT OUTER JOIN OPENBMS.MPP_LOC_BTRY mlb ON mlb.btry_seq = tb.btry_seq ";
        query2 += " LEFT OUTER JOIN OPENBMS.MPP_CMPY_LOC mcl ON mcl.loc_seq = mlb.loc_seq ";
        query2 += "LEFT OUTER JOIN OPENBMS.TBL_CMPY tc ON tc.cmpy_seq = mcl.cmpy_seq  ";
        query2 += " LEFT OUTER JOIN OPENBMS.TBL_BTRY_CHRG_STAT tbcs ON tbcs.btry_seq = tb.btry_seq "; 
        query2 += " LEFT OUTER JOIN OPENBMS.TBL_STTC_DAY tsd ON tb.btry_seq  = tsd.btry_seq ";
        query2 += "where mlb.loc_seq = "+info.loc + " " ;        
        query2 += "group by tb.btry_seq ";
        
        query2 += "LIMIT " + paginate.limit;

        let [row2] = await global.mysqlPool.query(query2);

        var now = new Date();
        var today = new Date(now.getFullYear,now.getMonth,now.getDay)


        for(var i = 0; i < row2.length; i++){

            let pwrAndUnit = utiljs.unitConvertWithComma(row2[i].btry_max_pwr);
            console.log(row2[i].btry_max_pwr);
            row2[i].btry_max_pwr = pwrAndUnit.power + pwrAndUnit.unit;
            console.log(row2[i].btry_max_pwr);

            row2[i].ins_dttm = row2[i].ins_dttm.toFormat('YYYY-MM-DD');

           // console.log("row2[i].ins_dttm:"+row2[i].ins_dttm);
            var now1 = new Date(row2[i].ins_dttm);
            //row2[i].diff = now- now1;
            row2[i].diff = Math.ceil((now.getTime()-now1.getTime())/(1000*3600*24));
        }

        res.send({ btryList: row2, liRow: paginate.pages[paginate.page -1], pages: paginate.threePages });
    } catch (err){
        console.log(err);
        res.send({btryList : null, liRow : null, pages : null});
    }

    
}

exports.postAssetInspecHstry = async(req, res, next) => {
    //장소별 bms list
    console.log("start postAssetInspecHstry");

    try {
        var currentPage = req.body.page;

        if (currentPage == null || currentPage == '') {
            currentPage = 1;
        }

        let info = {
            btry_seq: req.body.btry_seq
        }

        let query1 = "SELECT COUNT(*) AS total_count ";
        query1 += "FROM OPENBMS.TBL_INSPEC_HSTY ";
        query1 += "WHERE inspec_btry = " + info.btry_seq + ";";

        let [row1] = await global.mysqlPool.query(query1);


        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 5);
        paginate.getPages(5);


        let query2 = "SELECT inspec_seq,inspec_btry,inspec_date, IFNULL(inspec_time,'') as inspec_time, inspec_type, inspec_stat_cd, IFNULL(inspec_rslt,'') as inspec_rslt, ";
        query2 += " ins_nm, ins_dttm, upd_nm, upd_dttm ";
        query2 += "FROM OPENBMS.TBL_INSPEC_HSTY ";
        query2 += "WHERE inspec_btry = " + info.btry_seq + " ";
        query2 += "LIMIT " + paginate.limit;

        let [row2] = await global.mysqlPool.query(query2);

        
        for(var i = 0; i < row2.length; i++){
            row2[i].inspec_date = row2[i].inspec_date.toFormat('YYYY-MM-DD HH:MM:SS');
            row2[i].ins_dttm = row2[i].ins_dttm.toFormat('YYYY-MM-DD HH:MM:SS');
            row2[i].upd_dttm = row2[i].upd_dttm.toFormat('YYYY-MM-DD HH:MM:SS');
        }

        res.send({ hstryList: row2, liRow: paginate.pages[paginate.page - 1], pages: paginate.threePages });
    } catch (err){
        console.log(err);
        res.send({hstryList : null, liRow : "1", pages : "1"});
    }

    
}

exports.getAssethistory = async(req, res, next) => {

    try{
        var currentPage = req.body.page;

        if (currentPage == null || currentPage == '') {
            currentPage = 1;
        }

        sess = req.session;
        var acnt_seq = sess.acnt_seq;

        var userInfo = req.session.userInfo;

        let query1 = "SELECT COUNT(*) AS total_count ";
        query1 += "FROM OPENBMS.TBL_LOC tl ";
        query1 += "LEFT OUTER JOIN MPP_CMPY_LOC mcl ON mcl.loc_seq = tl.loc_seq ";
        query1 += "LEFT OUTER JOIN OPENBMS.TBL_ACNT ta ON ta.cmpy_seq = mcl.cmpy_seq ";

        if(userInfo.acnt_role == "SA"){

        }else{
            //회사 seq 
            query1 += "WHERE ta.acnt_seq = " + acnt_seq + ";";
        }
    
        let [row1] = await global.mysqlPool.query(query1);

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 5);
        paginate.getPages(5);

        let query2 = "SELECT tl.loc_seq, tl.loc_nm, tl.ins_dttm, tc.cmpy_seq, tc.cmpy_nm ";
        query2 += "FROM OPENBMS.TBL_LOC tl ";
        query2 += "LEFT OUTER JOIN MPP_CMPY_LOC mcl ON mcl.loc_seq = tl.loc_seq ";
        query2 += "LEFT OUTER JOIN TBL_CMPY tc ON tc.cmpy_seq = mcl.cmpy_seq ";
        query2 += "LEFT OUTER JOIN OPENBMS.TBL_ACNT ta ON ta.cmpy_seq = mcl.cmpy_seq ";

        if(userInfo.acnt_role == "SA"){
            //회사 seq 
            query2 += "LIMIT " + paginate.limit;
        }else{
            //회사 seq 
            query2 += "WHERE ta.acnt_seq = " + acnt_seq + " ";
            query2 += "LIMIT " + paginate.limit;
        }


        let [row2] = await global.mysqlPool.query(query2);


        for(var i = 0; i < row2.length; i++){
            row2[i].ins_dttm = row2[i].ins_dttm.toFormat('YYYY-MM-DD');
        }


        res.render("asset/assethistory", {locList: row2, liRow: paginate.pages[paginate.page - 1], pages: paginate.threePages});

    }catch(err){
        console.log(err);
        res.send({locList : null, liRow : "1", pages : "1"});
    }
    
}

exports.getAssetcalandar = async(req, res, next) => {

    let info = {
        loc_seq: req.query.loc
    }

    let query1 = "SELECT loc_nm FROM TBL_LOC WHERE loc_seq = " + info.loc_seq;
    let [row1] = await global.mysqlPool.query(query1);

    let query2 = "SELECT tb.btry_seq, tb.btry_nm ";
    query2 += "FROM OPENBMS.TBL_BTRY tb ";
    query2 += "LEFT OUTER JOIN MPP_LOC_BTRY mlb ON mlb.btry_seq = tb.btry_seq ";
    query2 += "WHERE mlb.loc_seq = " + info.loc_seq + ";";


    let [row2] = await global.mysqlPool.query(query2);
    
    res.render("asset/assetcalandar", {loc_seq: info.loc_seq, loc_nm: row1[0].loc_nm, btryList: row2});
}

exports.postCalendarHistory = async(req, res, next) => {

    sess = req.session;
    var acnt_seq = sess.acnt_seq;
    
    let info = {
        loc_seq: req.body.loc_seq,
        month: req.body.month,
        year: req.body.year
    }

    //사용자 cmpy_seq
    let query0 = "SELECT * FROM OPENBMS.MPP_ACNT_CMPY WHERE acnt_seq = " + acnt_seq + ";";
    let [row0] = await global.mysqlPool.query(query0);
    let cmpy_seq = row0[0].cmpy_seq;

    //이전달 마지막 주, 다음달 첫주 데이터도 받아오게
    var now = new Date(info.year, info.month, 15);
    var oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1)).toFormat('YYYY-MM-DD');
    var oneMonthLater = new Date(now.setMonth(now.getMonth() + 2)).toFormat('YYYY-MM-DD');

    //해당 장소의 점검이력 월별로 SELECT 
    let query1 = "SELECT mlb.loc_seq, tih.inspec_time, tih.inspec_seq, tih.inspec_date, tih.inspec_rslt, tih.ins_dttm, tih.inspec_btry, tih.inspec_type ";
    query1 += "FROM OPENBMS.TBL_INSPEC_HSTY tih ";
    query1 += "LEFT OUTER JOIN MPP_LOC_BTRY mlb ON mlb.btry_seq = tih.inspec_btry ";
    query1 += "LEFT OUTER JOIN MPP_CMPY_LOC mcl ON mlb.loc_seq = mcl.loc_seq ";
    query1 += "WHERE mcl.cmpy_seq = " + cmpy_seq + " AND mlb.loc_seq = " + info.loc_seq + " AND tih.cmpy_seq = " + cmpy_seq ;
    query1 += " AND tih.inspec_date BETWEEN '" + oneMonthAgo + "' AND '" + oneMonthLater +  "';";


    let [row1] = await global.mysqlPool.query(query1);

    res.send({eventList: row1});
}

exports.postCalendarRegistComplete = async(req, res, next) => {

    console.log("postCalendarRegistComplete Start");

    let info = {
        type: req.body.type,
        btry: req.body.btry,
        date: req.body.date,
        result: req.body.result,
        seq: req.body.seq
    }
    var date = new Date(info.date).toFormat("YYYY-MM-DD HH:mm:ss");
    var hour = new Date(info.date).getHours();
    var min = new Date(info.date).getMinutes();

    if(hour/10 < 1){
        hour = "0" + hour;
    }
    
    if (min == "0"){
        var time = hour + "" + min + "0";
    } else {
        var time = hour + "" + min;
    }

    var msg = "";

    try {


        //사용자 cmpy_seq
        let query0 = "SELECT * FROM OPENBMS.MPP_ACNT_CMPY WHERE acnt_seq = " + acnt_seq + ";";
        let [row0] = await global.mysqlPool.query(query0);
        let cmpy_seq = row0[0].cmpy_seq;

        if(info.seq != ""){
            //갱신
            let query1 = "UPDATE OPENBMS.TBL_INSPEC_HSTY ";
            query1 += "SET inspec_btry = " + info.btry;
            query1 += ", inspec_date = '" + date + "'";
            query1 += ", inspec_time = '" + time + "'";
            query1 += ", inspec_type = " + info.type;
            query1 += ", inspec_rslt = '" + info.result + "'";
            query1 += ", upd_dttm = sysdate()";
            query1 += " WHERE inspec_seq = " + info.seq + ";";
            await global.mysqlPool.query(query1);
        } else {
            //삽입
            let query2 = "INSERT OPENBMS.TBL_INSPEC_HSTY(inspec_btry, cmpy_seq, inspec_date, inspec_time, inspec_type, inspec_rslt, ins_dttm, upd_dttm) ";
            query2 += "VALUES(" + info.btry + ", " + cmpy_seq + ", '"  + date + "', '" + time + "', " + info.type + ", '" + info.result + "', sysdate(), sysdate());";

            await global.mysqlPool.query(query2);
        }

        msg = "등록 성공";

    } catch(err) {
        console.log(err);
        msg = "서버 오류 발생";
    } finally {
        res.send({msg: msg, url:"/asset/assetcalandar"});
    }


}

exports.postCalendarDeleteComplete = async(req, res, next) => {

    console.log("postCalendarDeleteComplete Start")

    //점검이력 삭제
    let info = {
        seq: req.body.seq
    }
    var msg = "";

    try {

        let query1 = "DELETE FROM OPENBMS.TBL_INSPEC_HSTY ";
        query1 += "WHERE inspec_seq = " + info.seq + ";";

        await global.mysqlPool.query(query1);

        msg = "삭제 성공";

    } catch(err) {
        console.log(err);
        msg = "서버 오류 발생";
    } finally {
        res.send({msg: msg, url:"/asset/assetcalandar"});
    }


}