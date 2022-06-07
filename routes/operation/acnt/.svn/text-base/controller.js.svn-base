const https = require('https');
const path = require("path");
const Pagination = require(path.join(global.appRoot,"/modules/pagination.js"));
const encryption = require(path.join(global.appRoot,"/modules/encryption.js"));
const utiljs = require(path.join(global.appRoot,"/modules/util.js"));
const viewName = 'operation/mng/acnt/';

exports.getAcntList = async(req, res, next) => {
    console.log("start getAcntList");
    res.render(viewName + "acntList");
}   

exports.postAcntList = async(req, res, next) => {

    try {
        
        console.log("start postAcntList");

        sess = req.session;
        var acnt_seq = sess.acnt_seq;
        var userInfo = sess.userInfo;

        var currentPage = req.query.page;

        var search_select = req.body.search_select;
        var search_input = req.body.search_input;
        var startDate = req.body.startDate;
        var endDate = req.body.endDate;

        if(currentPage == null || currentPage == ''){
            currentPage = 1;
        }

        //페이지네이션을 위한 전체 카운트
        let sql1 = "SELECT COUNT(*) AS total_count FROM( ";
            sql1+= " select ta.* from OPENBMS.TBL_ACNT ta WHERE ta.acnt_delete_yn = 'N'";
            sql1+= " AND ta.cmpy_seq = (select ta2.cmpy_seq FROM TBL_ACNT ta2 WHERE ta2.acnt_seq = " + userInfo.acnt_seq + ") ";
            //검색조건
            if(search_select == "acnt_id"){
                sql1 += "AND ta.acnt_id like '%" + search_input + "%' ";
            }else if(search_select == "acnt_nm"){
                sql1 += "AND ta.acnt_nm like '%" + search_input + "%' ";
            }
            //날짜 선택 여부에 따른 리스트
            if(startDate != null && startDate != '' && endDate != null && endDate != ''){
                sql1 += " AND DATE_FORMAT(ta.ins_dttm,'%Y%m%d') BETWEEN " + startDate + " AND " + endDate + " ";
            }
            sql1+= ") AS main ";

        let [row1] = await global.mysqlPool.query(sql1);

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 10);
        paginate.getPages(5);
        
        // 로그인 따른 BMS 리스트
        let sql2 = " select ta.* from OPENBMS.TBL_ACNT ta WHERE ta.acnt_delete_yn = 'N' ";
            sql2+= " AND ta.cmpy_seq = (select ta2.cmpy_seq FROM TBL_ACNT ta2 WHERE ta2.acnt_seq = " + userInfo.acnt_seq + ") ";
            //검색조건
            if(search_select == "acnt_id"){
                sql2 += "AND ta.acnt_id like '%" + search_input + "%' ";
            }else if(search_select == "acnt_nm"){
                sql2 += "AND ta.acnt_nm like '%" + search_input + "%' ";
            }
            //날짜 선택 여부에 따른 리스트
            if(startDate != null && startDate != '' && endDate != null && endDate != ''){
                sql2 += " AND DATE_FORMAT(ta.ins_dttm,'%Y%m%d') BETWEEN " + startDate + " AND " + endDate + " ";
            }
            sql2+= "ORDER BY ta.acnt_seq ASC ";
            sql2+= "LIMIT " + paginate.limit;

        let [row2] = await global.mysqlPool.query(sql2);

        for(var i =0; i < row2.length; i++){
            row2[i].ins_dttm = row2[i].ins_dttm.toFormat('YYYY-MM-DD');
            row2[i].upd_dttm = row2[i].upd_dttm.toFormat('YYYY-MM-DD');
        }
        
            res.send({acntList : row2, liRow : paginate.pages[paginate.page - 1], pages : paginate.threePages});
    } catch (error) {
        
        console.log(error);
        res.send({msg : "서버 오류 발생"});

    }
   
}

exports.getAcntReg = async(req, res, next) => {
    console.log("start getAcntReg");
    sess = req.session;

    try{
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

        res.render(viewName + "acntReg",{cmpyTyList : row1, roleList : row2, cmpyList: row3});
    }catch (error) {
        console.log(error);
        res.render(viewName + "acntReg",{cmpyTyList : null, roleList : null, cmpyList: null});
    }
}