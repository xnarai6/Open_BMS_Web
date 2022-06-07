// const asyncWrapper = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next());
// const form = require('../../config/form.js');
const { parseTwoDigitYear } = require("moment");
const { userInfo } = require("os");
const path = require("path");
const Pagination = require(path.join(global.appRoot,"/modules/pagination.js"));
const form = require(path.join(global.appRoot,"/modules/form.js"));
require("date-utils");


/***
 * http://localhost:8104/ccms/cart/list
 * 카트 리스트
 */
exports.getCartList = async(req, res, next) => {

    console.log("getList Start");

    sess = req.session;
    var acnt_seq = sess.acnt_seq;

    let query = "SELECT cc_seq FROM OPENBMS.TBL_CC tc ";
    query += "JOIN OPENBMS.TBL_ACNT ta ON ta.cmpy_seq = tc.cmpy_seq ";
    query += "WHERE ta.acnt_seq = " + acnt_seq + ";";
    
    let [row] = await global.mysqlPool.query(query);
    var cc_seq = row[0].cc_seq;

    //전체 카트 수, 운행중 카트, 대기중 카트, 수리중 카트 수
    let selectsql4 = " SELECT cart_stat, COUNT(*) AS cnt FROM OPENBMS.TBL_CART ";
    selectsql4 += " WHERE cc_seq = "+ cc_seq ;
    selectsql4 += " group by cart_stat ";
    let [row4] = await global.mysqlPool.query(selectsql4);
    var entire_no = 0;
    var y_no =0;
    var n_no =0;
    var c_no = 0;

    //entire_no: row1[0].entire_no, y_no: row2[0].y_no, n_no: row3[0].n_no, c_no: row4[0].c_no,
    for(var i =0; i < row4.length; i++){
        if(row4[i].cart_stat == "Y"){
            entire_no += row4[i].cnt;
            y_no = row4[i].cnt;
        }else if(row4[i].cart_stat == "I"){
            entire_no += row4[i].cnt;
            n_no = row4[i].cnt;
        }else if(row4[i].cart_stat == "W"){
            entire_no += row4[i].cnt;
            c_no = row4[i].cnt;
        }
    }

    console.log("getList end");
    res.render("ccms/cart/list", {entire_no: entire_no, y_no: y_no, n_no: n_no, c_no: c_no});
}

exports.postCartList = async(req, res, next) =>{
    try {
        var currentPage = req.body.page;
        var searchStat = req.body.searchStat;
    
        if(currentPage == null || currentPage == ''){
            currentPage = 1;
        }
    
        //카트 리스트 개수 (카트 번호, 상태, 가동 예상 시간, 충전 시간, 충전 상태)
        let sql1 = "SELECT COUNT(*) as total_count FROM (";
        sql1 += "SELECT c.cc_seq, c.cart_loc_cors, c.cart_seq, c.cart_nm, c.cart_stat,c.cart_loc_hole,"; 
        sql1 += " bs.btry_rmn_amt, bs.btry_rmn_tm, bs.btry_chrg_tm , mlb.loc_seq, ";
        sql1 += " tb.btry_seq , tb.btry_max_pwr ";
        sql1 += " FROM OPENBMS.TBL_CART AS c "; 
        sql1 += " LEFT OUTER JOIN OPENBMS.MPP_CART_BTRY mcb1 ON mcb1.cart_seq = c.cart_seq ";        
        sql1 += " LEFT OUTER JOIN OPENBMS.TBL_CART mc ON mc.cart_seq = mcb1.cart_seq "; 
        sql1 += " LEFT OUTER JOIN OPENBMS.TBL_BTRY tb ON tb.btry_seq  = mcb1.btry_seq ";
        sql1 += " LEFT OUTER JOIN OPENBMS.TBL_BTRY_STAT bs ON bs.btry_seq  = mcb1.btry_seq ";
        sql1 += " LEFT OUTER JOIN OPENBMS.MPP_LOC_BTRY mlb ON mlb.btry_seq  = mcb1.btry_seq ";
        if(searchStat != "all"){
            sql1 += " WHERE c.cart_stat = '" + searchStat + "'";  
        }
        sql1 += " GROUP BY c.cart_seq ";
        sql1 += " ORDER BY c.cart_seq ";
        sql1 += " ) main";
    
        let [row1] = await global.mysqlPool.query(sql1);
    
        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 10);
            paginate.getPages(5);
    
        //카트 리스트(카트 번호, 상태, 가동 예상 시간, 충전 시간, 충전 상태)
        let sql2 = "SELECT c.cc_seq, c.cart_loc_cors, c.cart_seq, c.cart_nm, c.cart_stat,c.cart_loc_hole,"; 
        sql2 += " bs.btry_rmn_amt, bs.btry_rmn_tm, bs.btry_chrg_tm , mlb.loc_seq, ";
        sql2 += " tb.btry_seq , tb.btry_max_pwr ";
        sql2 += " FROM OPENBMS.TBL_CART AS c "; 
        sql2 += " LEFT OUTER JOIN OPENBMS.MPP_CART_BTRY mcb1 ON mcb1.cart_seq = c.cart_seq ";        
        sql2 += " LEFT OUTER JOIN OPENBMS.TBL_CART mc ON mc.cart_seq = mcb1.cart_seq "; 
        sql2 += " LEFT OUTER JOIN OPENBMS.TBL_BTRY tb ON tb.btry_seq  = mcb1.btry_seq ";
        sql2 += " LEFT OUTER JOIN OPENBMS.TBL_BTRY_STAT bs ON bs.btry_seq  = mcb1.btry_seq ";
        sql2 += " LEFT OUTER JOIN OPENBMS.MPP_LOC_BTRY mlb ON mlb.btry_seq  = mcb1.btry_seq ";  
        if(searchStat != "all"){
            sql2 += " WHERE c.cart_stat = '" + searchStat + "'";  
        } 
        sql2 += " GROUP BY c.cart_seq ";
        sql2 += " ORDER BY c.cart_seq ";
        sql2 += " LIMIT " + paginate.limit;

        let [row2] = await global.mysqlPool.query(sql2);
    
        for(var i =0; i < row2.length; i++){
            if(row2[i].btry_rmn_tm != null) {
                var time = row2[i].btry_rmn_tm.split(":");
                row2[i].btry_rmn_tm = time[0] + "시간 " + time[1] + "분";
            }
            if(row2[i].btry_chrg_tm != null) {
                var time = row2[i].btry_chrg_tm.split(":");
                row2[i].btry_chrg_tm = time[0] + "시간 " + time[1] + "분";
            }        
        }
    
        res.send({cartList : row2, liRow : paginate.pages[paginate.page - 1], pages : paginate.threePages});
    } catch (err) {
        
        console.log(err);
        res.send({cartList : null, liRow : "1", pages : "1"});
    
    }
}
/***
 * 코스내 카트 위치
 */
exports.getCorsStat = async(req, res, next) => {
    console.log("getCorsStat Start");
    //코스
    sess = req.session;
    var acnt_seq = sess.acnt_seq;

    let query = "SELECT cc_seq FROM OPENBMS.TBL_CC tc ";
    query += "JOIN OPENBMS.TBL_ACNT ta ON ta.cmpy_seq = tc.cmpy_seq ";
    query += "WHERE ta.acnt_seq = " + acnt_seq + ";";

   // console.log("query:"+query);
    
    let [row] = await global.mysqlPool.query(query);
    var cc_seq = row[0].cc_seq;

    let query1 = "SELECT cors_seq, cc_seq, cors_group_nm, cors_nm, cors_type ";
    query1 += "FROM OPENBMS.TBL_CORS ";
    query1 += "WHERE cc_seq = " + cc_seq + " "
    query1 += "ORDER BY cors_seq ASC;"

  //  console.log("query1:"+query1);

    let [row1] = await global.mysqlPool.query(query1);

    //카트
    let query2 = "SELECT  c.cc_seq, c.cart_loc_cors, c.cors_seq, c.cart_seq,c.cart_nm, IFNULL(tcrs.cors_group_nm,'club_house') as cors_group_nm, c.cart_loc_cors, ";
    query2 += " c.cart_loc_hole, c.cart_stat, bs.btry_rmn_amt, bs.btry_seq ";
    query2 += " FROM OPENBMS.TBL_CART c ";
    query2 += " LEFT OUTER JOIN OPENBMS.MPP_CART_BTRY mpp ON mpp.cart_seq = c.cart_seq ";
    query2 += " LEFT OUTER JOIN OPENBMS.TBL_BTRY b ON b.btry_seq = mpp.btry_seq ";
    query2 += " LEFT OUTER JOIN OPENBMS.TBL_BTRY_STAT bs ON bs.btry_seq = b.btry_seq ";
    query2 += " LEFT OUTER JOIN OPENBMS.TBL_CORS tcrs ON tcrs.cors_seq = c.cors_seq ";
    query2 += " WHERE c.cart_stat = 'Y' AND c.cc_seq = " + cc_seq + " ";    
    //query2 += "GROUP BY c.cors_seq ";
    query2 += "ORDER BY c.cc_seq, c.cart_loc_cors, c.cart_loc_hole;";

  //  console.log("query2:"+query2);
    let [row2] = await global.mysqlPool.query(query2);

    var array1= new Array();
    var cors_array = new Array();

    for (var i = 0; i< row1.length; i++){
        if( i ==0 ){
            cors_array.push(row1[i]);
            continue;
        }

        if(row1[i-1].cors_group_nm == row1[i].cors_group_nm){
            cors_array.push(row1[i]);
        }else{

            var temp_array = new Array();
            temp_array = cors_array.slice();

            array1.push({
                cors_group_nm : row1[i-1].cors_group_nm,
                cors_array : temp_array
            });
            cors_array.splice(0);
            cors_array.push(row1[i]);
        }

        if(i == (row1.length - 1) ){

            var temp_array = new Array();
            temp_array = cors_array.slice();

            array1.push({
                cors_group_nm : row1[i].cors_group_nm,
                cors_array : temp_array
            });
        }
    }

    var array2= new Array();
    var cart_array = new Array();

    for (var i = 0; i< row2.length; i++){
        console.log("=============");
        console.log(row2[i].cors_group_nm);
        if( i == 0 ){
            cart_array.push(row2[i]);
            continue;
        }

        if(row2[i-1].cors_group_nm == row2[i].cors_group_nm){
            cart_array.push(row2[i]);
        }else{

            var temp_array = new Array();
            temp_array = cart_array.slice();

            array2.push({
                cors_group_nm : row2[i-1].cors_group_nm,
                cart_array : temp_array
            });
            cart_array.splice(0);
            cart_array.push(row2[i]);
        }

        if(i == (row2.length - 1) ){

            var temp_array = new Array();
            temp_array = cart_array.slice();

            array2.push({
                cors_group_nm : row2[i].cors_group_nm,
                cart_array : temp_array
            });
        }
    }

    console.log("getCorsStat end");
    res.render("ccms/cors/stat", {corsList: row1, corsGroupList: array1, cartList:row2, cartList2: array2});
}

exports.getCcList = async(req, res, next) => {   
    var currentPage = req.body.page;

    if(currentPage == null || currentPage == ''){
        currentPage = 1;
    }

    sess = req.session;
    var acnt_seq = sess.acnt_seq;

    let query = "SELECT cc_seq FROM OPENBMS.TBL_CC tc ";
    query += "JOIN OPENBMS.TBL_ACNT ta ON ta.cmpy_seq = tc.cmpy_seq ";
    query += "WHERE ta.acnt_seq = " + acnt_seq + ";";
    
    let [row] = await global.mysqlPool.query(query);
    var cc_seq = row[0].cc_seq;

    let selectsql1 = "SELECT COUNT(*) AS total_count FROM OPENBMS.TBL_CC;";

    let [row1] = await global.mysqlPool.query(selectsql1);

    // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
    let paginate = new Pagination(row1[0].total_count, currentPage, 10);
        paginate.getPages(5);

    let selectsql2 = "SELECT tc.cc_seq, tc.cc_nm, tc.cors_cnt, tc.reg_nm, tc.reg_dttm, tc.chg_nm, tc.chg_dttm ";
        selectsql2 += "FROM OPENBMS.TBL_CC tc ";
        selectsql2 += "WHERE tc.cc_seq = " + cc_seq + " ";
        selectsql1 += "ORDER BY tc.cc_nm ASC "
        selectsql2 += "LIMIT " + paginate.limit;

    let [row2] = await global.mysqlPool.query(selectsql2);

    for(var i =0; i < row2.length; i++){
        row2[i].reg_dttm = row2[i].reg_dttm.toFormat('YYYY-MM-DD');
    }
    
    res.render("ccms/cc/ccList",{ccList: row2,liRow: paginate.pages[paginate.page - 1],pages: paginate.threePages});
}

exports.getCorsList = async(req, res, next) => {   

    var currentPage = req.body.page;

    if(currentPage == null || currentPage == ''){
        currentPage = 1;
    }

    sess = req.session;
    var acnt_seq = sess.acnt_seq;

    let query = "SELECT cc_seq FROM OPENBMS.TBL_CC tc ";
    query += "JOIN OPENBMS.TBL_ACNT ta ON ta.cmpy_seq = tc.cmpy_seq ";
    query += "WHERE ta.acnt_seq = " + acnt_seq + ";";
    
    let [row] = await global.mysqlPool.query(query);
    var cc_seq = row[0].cc_seq;

    let selectsql1 = "SELECT COUNT(*) AS total_count FROM OPENBMS.TBL_CORS WHERE cc_seq = " + cc_seq + ";";

    let [row1] = await global.mysqlPool.query(selectsql1);

    // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
    let paginate = new Pagination(row1[0].total_count, currentPage, 10);
        paginate.getPages(5);

    let selectsql2 = "SELECT tcr.cors_seq, tcr.cors_nm, tcr.cors_type, tcr.reg_nm, tcr.reg_dttm, tcr.chg_nm, tcr.chg_dttm, tc.cc_nm ";
        selectsql2 += "FROM CCMS.TBL_CORS tcr ";
        selectsql2 += "LEFT JOIN CCMS.TBL_CC tc ON tcr.cc_seq = tc.cc_seq ";
        selectsql2 += "WHERE tcr.cc_seq = " + cc_seq + " ";
        selectsql2 += "ORDER BY tc.cc_nm ASC, tcr.reg_dttm DESC ";
        selectsql2 += "LIMIT " + paginate.limit;

    let [row2] = await global.mysqlPool.query(selectsql2);

    for(var i =0; i < row2.length; i++){
        row2[i].reg_dttm = row2[i].reg_dttm.toFormat('YYYY-MM-DD');
    }


    res.render("ccms/cc/corsList",{corsList: row2,liRow: paginate.pages[paginate.page - 1],pages: paginate.threePages});
}

exports.getCartdetail = async(req, res, next) => {

    console.log("cartdetail Start");
    
    var cart_seq = req.body.cart_seq;

    

    
    console.log("cartdetail end");
    res.render("ccms/cart/cartdetail");
}