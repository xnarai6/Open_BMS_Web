// const asyncWrapper = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next());
// const form = require('../../config/form.js');
var http = require("http");
var https = require('https');
const request = require('request');
const path = require("path");
const Pagination = require(path.join(global.appRoot,"/modules/pagination.js"));


exports.getDash = async(req, res, next) => {
    console.log("getDash start");
    res.render("common/dash");

}

exports.getAllCompanylist = async(req, res, next) => {
    console.log("getAllCompanylist start");
    sess = req.session;
    var acnt_seq = sess.acnt_seq;
    
    // 로그인 확인
    if(acnt_seq < 0){
        res.redirect('/account/login');
    }
 
     let selectQuery = "select * from OPENBMS.MPP_ACNT_CMPY mac ";

    let [mRows] = await global.mysqlPool.query(selectQuery);
    
    if(mRows.length <= 0) {
        res.send("No data");
    }else{
        res.send(mRows);
    }
}
/****
 * ID 별로 모든 설치장소 조회
 */
exports.postIDtoLocationlist = async(req, res, next) => {
    console.log("postIDtoLocationlist start");
    sess = req.session;
    var acnt_seq = sess.acnt_seq;

    var userInfo = req.session.userInfo;

    
    // 로그인 확인
    if(acnt_seq < 0){
        res.redirect('/account/login');
    }

    let selectQuery = "";
    
    // 로그인 따른 BMS 설치위치
    if(userInfo.acnt_role == "SA"){
        selectQuery += "select * from OPENBMS.TBL_LOC tltl  ";
    }else{
        selectQuery += "select * from OPENBMS.TBL_LOC tltl  ";
        selectQuery += "  where tltl.loc_seq in (select loc_seq from OPENBMS.MPP_CMPY_LOC mcl   ";
        selectQuery += " where mcl.cmpy_seq =      ";
        selectQuery += "  (select mac.cmpy_seq from OPENBMS.MPP_ACNT_CMPY mac where mac.acnt_seq = "+ acnt_seq+"))";
    }


    let [mRows] = await global.mysqlPool.query(selectQuery);

    res.send(mRows);

}


exports.getAllLocationlist = async(req, res, next) => {
    console.log("getAllLocationlist start");
    let selectsql1 = "select * from OPENBMS.TBL_LOC ";
    let [row1] = await global.mysqlPool.query(selectsql1);    
    
    if(row1.length <= 0) {
        res.send("No data");
    }else{
        res.send(row1);
    }
}
exports.getIDtoBtrylist = async(req, res, next) => {
    console.log("getIDtoBtrylist start");
    sess = req.session;
    var acnt_seq = sess.acnt_seq;

    var userInfo = req.session.userInfo;
    
    // 로그인 확인
    if(acnt_seq < 0){
        res.redirect('/account/login');
    }

    let selectQuery1 = "";

    // 로그인 따른 BMS 리스트
    if(userInfo.acnt_role == "SA"){
        selectQuery1 = " select  * from OPENBMS.TBL_BTRY tb   ";
    }else{
        selectQuery1 = " select  * from OPENBMS.TBL_BTRY tb   ";
        selectQuery1 += "  where tb.btry_seq in (select btry_seq from OPENBMS.MPP_LOC_BTRY mlb      ";
        selectQuery1 += "   where mlb.loc_seq = "+ acnt_seq+")";
    }
    
    let [row1] = await global.mysqlPool.query(selectQuery1);    

    if(row1.length <= 0) {
        res.send("No data");
    }else{
        res.send(row1);
    }

}
exports.getAllBtrylist = async(req, res, next) => {
    console.log("getAllBtrylist start");
    let selectsql1 = "select * from OPENBMS.TBL_BTRY tb ";

    let [row1] = await global.mysqlPool.query(selectsql1);
    
    
    if(row1.length <= 0) {
        res.send("No data");
    }else{
        res.send(row1);

    }
    
}

exports.postLOCtoBtrylist = async(req, res, next) => {
    console.log("postLOCtoBtrylist start");

    var loc_seq = req.body.loc_seq;
    var currentPage = req.body.page;

        if (currentPage == null || currentPage == '') {
            currentPage = 1;
        }

    let selectsql1 = "select  COUNT(*) AS total_count FROM ( "; 
    selectsql1 += "select  * from OPENBMS.TBL_BTRY tb "; 
    selectsql1 += "where tb.btry_seq in (select btry_seq from OPENBMS.MPP_LOC_BTRY mlb    ";     
    selectsql1 += "    where mlb.loc_seq =  "+loc_seq+") ";
    selectsql1 += " ) total_table";

    let [row1] = await global.mysqlPool.query(selectsql1);

    // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
    let paginate = new Pagination(row1[0].total_count, currentPage, 10);
    paginate.getPages(5);

    let selectsql2 = "select  * from OPENBMS.TBL_BTRY tb "; 
    selectsql2 += "where tb.btry_seq in (select btry_seq from OPENBMS.MPP_LOC_BTRY mlb    ";     
    selectsql2 += "    where mlb.loc_seq =  "+loc_seq+") ";
    selectsql2 += " LIMIT " + paginate.limit;

    let [row2] = await global.mysqlPool.query(selectsql2);

    res.send({data : row2, liRow: paginate.pages[paginate.page - 1], pages: paginate.threePages });

}

exports.getRoleUrl = async(req, res, next) => {
    console.log("getRoleUrl start");

    try {

        sess = req.session;
        var acnt_role = sess.userInfo.acnt_role;
        var cmpy_biz_type = sess.userInfo.cmpy_biz_type;

        var roleUrl = "";

        switch(acnt_role){
            case "DA" : roleUrl = "operation"; break;
            case "DC" : roleUrl = "operation"; break;
            case "MA" : roleUrl = "production"; break;
            case "MC" : roleUrl = "production"; break;
            case "SA" : roleUrl = "system"; break;
        }

        if(cmpy_biz_type == "50"){
            roleUrl = "golf";
        }

        res.send({roleUrl : roleUrl});
        
    } catch (error) {
        console.log(error);
    }
    
}
