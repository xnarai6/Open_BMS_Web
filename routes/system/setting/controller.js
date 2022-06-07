// const asyncWrapper = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next());
// const form = require('../../config/form.js');
const path = require("path");
const proj4 = require("proj4");
const Pagination = require(path.join(global.appRoot,"/modules/pagination.js"));
const encryption = require(path.join(global.appRoot,"/modules/encryption.js"));
const axios = require('axios');
const utiljs = require(path.join(global.appRoot,"/modules/util.js"));
const viewName = 'system/';
require("date-utils");

exports.getAlarmsetup = async(req, res, next) => {
    sess = req.session;
    var acnt_seq = sess.acnt_seq;
    
    // 로그인 확인
    if(acnt_seq < 0){
        res.redirect('/account/login');
    }

    res.render(viewName+"setting/alarmsetup");
}
exports.getAcnt = async(req, res, next) => {

    try {
        sess = req.session;
        var acnt_seq = sess.acnt_seq;

        var currentPage = req.query.page;

        if(currentPage == null || currentPage == ''){
            currentPage = 1;
        }

        //페이지네이션을 위한 전체 카운트
        let sql1 = "SELECT COUNT(*) AS total_count FROM( ";
            sql1+= " select tb.* from OPENBMS.TBL_ACNT tb WHERE tb.acnt_delete_yn = 'N'";
            sql1+= ") AS main ";

        let [row1] = await global.mysqlPool.query(sql1);

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 10);
        paginate.getPages(5);
        
        // 로그인 따른 BMS 리스트
        let sql2 = " select tb.* from OPENBMS.TBL_ACNT tb WHERE tb.acnt_delete_yn = 'N'";
            sql2+= "ORDER BY tb.acnt_seq ASC ";
            sql2+= "LIMIT " + paginate.limit;

        let [row2] = await global.mysqlPool.query(sql2);

        for(var i =0; i < row2.length; i++){
            row2[i].ins_dttm = row2[i].ins_dttm.toFormat('YYYY-MM-DD');
            row2[i].upd_dttm = row2[i].upd_dttm.toFormat('YYYY-MM-DD');
        }
        
        if(row2.length <= 0) {

        }else{
            res.render(viewName+"setting/acnt",{ACNT_LIST : row2, liRow : paginate.pages[paginate.page - 1], pages : paginate.threePages});
        }
    } catch (error) {
        
        console.log(error);

    }
   
}
exports.getAcntReg = async(req, res, next) => {
    sess = req.session;
    var acnt_seq = sess.acnt_seq;

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

        res.render(viewName+"setting/acntReg",{cmpyTyList : row1, roleList : row2, cmpyList: row3});
    }catch (error) {
        console.log(error);
        res.render(viewName+"setting/acntReg",{cmpyTyList : null, roleList : null, cmpyList: null});
    }

}
exports.postDupCheck = async(req, res, next) => {
    let info = {
        acnt_id: req.body.acnt_id
    }

    try {

        let sql1 = "SELECT  * FROM OPENBMS.TBL_ACNT WHERE acnt_id = '" + info.acnt_id + "'";

        let [row1] = await global.mysqlPool.query(sql1);

        var msg = "사용가능한 아이디입니다.";
        var check = 1;

        if(row1.length > 0){
            msg = "동일한 아이디가 존재합니다.";
            check = -1;
        }

        res.send({msg: msg, check: check});
        
    } catch (error) {
        res.send({msg: "서버 오류 발생",check: -1});
    }
}
exports.postAcntRoleListByCmpy = async(req, res, next) => {
    
    let info = {
        cmpy_ty_cd: req.body.cmpy_ty_cd
    }

    try {

        let sql1 = "SELECT * FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'role'";
        let sql2 = "";

        switch (info.cmpy_ty_cd) {
            case 'D': sql2 = " AND tc.cd IN ('DA','DC')"; break;
            case 'M': sql2 = " AND tc.cd IN ('MA','MC')"; break;
            case 'S': sql2 = " AND tc.cd = 'SA'"; break;
            default: break;
        }

        let sql = sql1 + sql2;

        let [row] = await global.mysqlPool.query(sql);

        res.send({postAcntRoleList : row});

    } catch (error) {

        console.log(error);
        
    }

}
exports.postAcntRegComplete = async(req, res, next) => {

    var today = new Date();

    let userInfo = req.session.userInfo;

    let info = {
        acnt_id: req.body.acnt_id,
        acnt_nm: req.body.acnt_nm,
        acnt_pw: req.body.acnt_pw,
        cmpy_ty_cd: req.body.cmpy_ty_cd,
        acnt_role: req.body.acnt_role,
        cmpy_seq: req.body.cmpy_seq,
        acnt_stat_cd: req.body.acnt_stat_cd,
        ins_nm: userInfo.acnt_id,
        ins_dttm: today,
        upd_nm: userInfo.acnt_id,
        upd_dttm: today
    }

    var msg = "";
    var url = "/setting/acnt";
    var status ="SUCCESS";

    try {

        let pAndS = encryption.createPassword(info.acnt_pw);

        let params = [info.acnt_id, pAndS.hashPassword, pAndS.salt, info.acnt_nm, info.acnt_stat_cd, info.ins_nm, info.ins_dttm, info.upd_nm, info.upd_dttm, info.acnt_role, info.cmpy_seq, info.cmpy_seq, info.cmpy_ty_cd];

        let sql1 = "INSERT INTO OPENBMS.TBL_ACNT(acnt_id, acnt_pw, acnt_pw_salt, acnt_nm, acnt_stat_cd, ins_nm, ins_dttm, upd_nm, upd_dttm, acnt_role, cmpy_seq, cmpy_nm, cmpy_ty_cd) ";
            sql1 +="VALUES(?,?,?,?,?,?,?,?,?,?,?,(SELECT tc.cmpy_nm FROM OPENBMS.TBL_CMPY tc WHERE tc.cmpy_seq = ?),?) ";

        let [row1] = await global.mysqlPool.query(sql1,params);

        

        let info2 = {
            acnt_seq: row1.insertId,
            cmpy_seq: info.cmpy_seq
        }

        let sql2 = "INSERT INTO OPENBMS.MPP_ACNT_CMPY SET ?";

        await global.mysqlPool.query(sql2,info2);

        msg="회원 등록 성공";
        
    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}
exports.getAcntMod = async(req, res, next) => {
    sess = req.session;
    var acnt_seq = sess.acnt_seq;

    var info = {
        acnt_seq : req.query.acnt_seq
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

        for(var i =0; i < row.length; i++){
            row[i].ins_dttm = row[i].ins_dttm.toFormat('YYYY-MM-DD HH:MM:SS');
            row[i].upd_dttm = row[i].upd_dttm.toFormat('YYYY-MM-DD HH:MM:SS');
        }

        res.render(viewName+"setting/acntMod",{acntInfo : row, cmpyTyList : row1, roleList : row2, cmpyList: row3});
    }catch (error) {
        console.log(error);
        res.render(viewName+"setting/acntMod",{acntInfo : null, cmpyTyList : null, roleList : null, cmpyList: null});
    }

}
exports.postAcntModComplete = async(req, res, next) => {

    var today = new Date();

    let userInfo = req.session.userInfo;

    let info = {
        acnt_nm: req.body.acnt_nm,
        cmpy_ty_cd: req.body.cmpy_ty_cd,
        acnt_role: req.body.acnt_role,
        cmpy_seq: req.body.cmpy_seq,
        cmpy_nm: '',
        acnt_stat_cd: req.body.acnt_stat_cd,
        upd_nm: userInfo.acnt_id,
        upd_dttm: today
    }

    var msg = "";
    var url = "/setting/acnt";
    var status ="SUCCESS";

    try {

        let sql = "SELECT cmpy_nm FROM OPENBMS.TBL_CMPY WHERE cmpy_seq = " + info.cmpy_seq;

        let[row] = await global.mysqlPool.query(sql);

        info.cmpy_nm = row[0].cmpy_nm;

        let sql1 = "UPDATE OPENBMS.TBL_ACNT ";
            sql1 +="SET ? WHERE acnt_seq = " + req.body.acnt_seq;

        let [row1] = await global.mysqlPool.query(sql1,info);

        let info2 = {
            cmpy_seq: info.cmpy_seq
        }

        let sql2 = "UPDATE OPENBMS.MPP_ACNT_CMPY SET ? WHERE acnt_seq = " + req.body.acnt_seq;

        await global.mysqlPool.query(sql2,info2);

        msg="회원 수정 성공";
        
    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}
exports.postAcntDeleteComplete = async(req, res, next) => {

    var msg = "";
    var url = "/setting/acnt";
    var status ="SUCCESS";

    try {

        let info = {
            acnt_seq : req.body.acnt_seq
        }
    
        let sql = "UPDATE OPENBMS.TBL_ACNT SET acnt_delete_yn = 'Y' WHERE acnt_seq = " + info.acnt_seq + "; ";
        sql += "DELETE FROM OPENBMS.MPP_ACNT_CMPY WHERE acnt_seq = " + info.acnt_seq + "; ";

        await global.mysqlPool.query(sql);

        msg="회원 삭제 성공";

    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}
exports.getCmpy = async(req, res, next) => {

    try {
        sess = req.session;
        var cmpy_seq = sess.cmpy_seq;

        var currentPage = req.query.page;

        if(currentPage == null || currentPage == ''){
            currentPage = 1;
        }

        //페이지네이션을 위한 전체 카운트
        let sql1 = "SELECT COUNT(*) AS total_count FROM( ";
            sql1+= " select tc.* from OPENBMS.TBL_CMPY tc ";
            sql1+= ") AS main ";

        let [row1] = await global.mysqlPool.query(sql1);

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 10);
        paginate.getPages(5);
        
        // 로그인 따른 BMS 리스트
        let sql2 = " select tc.*, (SELECT tc2.cd_desc FROM TBL_CD tc2 WHERE tc2.gp_cd = 'cmpy_ty' AND tc2.cd = tc.cmpy_ty_cd) AS cmpy_ty_cd_nm,"; 
            sql2+= " (SELECT tc2.cd_desc FROM TBL_CD tc2 WHERE tc2.gp_cd = 'cmpy_biz_type' AND tc2.cd = tc.cmpy_biz_type) AS cmpy_biz_type_nm FROM OPENBMS.TBL_CMPY tc ";
            sql2+= "ORDER BY tc.cmpy_seq ASC ";
            sql2+= "LIMIT " + paginate.limit;

        let [row2] = await global.mysqlPool.query(sql2);

        for(var i =0; i < row2.length; i++){
            row2[i].ins_dttm = row2[i].ins_dttm.toFormat('YYYY-MM-DD');
            row2[i].upd_dttm = row2[i].upd_dttm.toFormat('YYYY-MM-DD');
        }
        
        if(row2.length <= 0) {

        }else{
            res.render(viewName+"setting/cmpy",{CMPY_LIST : row2, liRow : paginate.pages[paginate.page - 1], pages : paginate.threePages});
        }
    } catch (error) {
        
        console.log(error);

    }
   
}
exports.getCmpyReg = async(req, res, next) => {

    try {

        let sql1 = "SELECT tc.gp_cd, tc.cd, tc.cd_desc FROM TBL_CD tc WHERE tc.gp_cd = 'cmpy_ty';";
        let [row1] = await global.mysqlPool.query(sql1);

        let sql2 = "SELECT tc.gp_cd, tc.cd, tc.cd_desc FROM TBL_CD tc WHERE tc.gp_cd = 'cmpy_div';";
        let [row2] = await global.mysqlPool.query(sql2);

        let sql3 = "SELECT tc.gp_cd, tc.cd, tc.cd_desc FROM TBL_CD tc WHERE tc.gp_cd = 'cmpy_biz_type';";
        let [row3] = await global.mysqlPool.query(sql3);

        let sql4 = "SELECT ta.acnt_seq, ta.acnt_id FROM OPENBMS.TBL_ACNT ta WHERE ta.acnt_delete_yn = 'N' AND ta.acnt_seq NOT IN (SELECT mac.acnt_seq FROM OPENBMS.MPP_ACNT_CMPY mac);";
        let [row4] = await global.mysqlPool.query(sql4);

        let sql5 = "SELECT tb.btry_seq, tb.btry_nm FROM OPENBMS.TBL_BTRY tb WHERE tb.btry_delete_yn = 'N' AND tb.btry_seq NOT IN (SELECT mcb.btry_seq FROM OPENBMS.MPP_CMPY_BTRY mcb);";
        let [row5] = await global.mysqlPool.query(sql5);

        let sql6 = "SELECT tl.loc_seq, tl.loc_nm FROM OPENBMS.TBL_LOC tl WHERE tl.loc_delete_yn = 'N' AND tl.loc_seq NOT IN (SELECT mcl.loc_seq FROM OPENBMS.MPP_CMPY_LOC mcl);";
        let [row6] = await global.mysqlPool.query(sql6);

        res.render(viewName+"setting/cmpyReg", {cmpy_ty_list : row1, cmpy_div_list : row2, cmpy_biz_type_list : row3, acnt_list : row4, btry_list : row5, loc_list : row6});

    } catch (error) {
        console.log(error);
    }
}
exports.postCmpyRegComplete = async(req,res,next) => {
    var today = new Date();

    let userInfo = req.session.userInfo;

    let info = {
        cmpy_nm: req.body.cmpy_nm,
        cmpy_biz_type: req.body.cmpy_biz_type,
        cmpy_ty_cd: req.body.cmpy_ty_cd,
        cmpy_div_cd: req.body.cmpy_div_cd,
        cmpy_biz_num: req.body.cmpy_biz_num,
        cmpy_addr1: req.body.cmpy_addr1,
        cmpy_addr2: req.body.cmpy_addr2,
        cmpy_chrg_nm: req.body.cmpy_chrg_nm,
        cmpy_chrg_mail: req.body.cmpy_chrg_mail,
        cmpy_chrg_tel: req.body.cmpy_chrg_tel,
        ins_nm: userInfo.acnt_id,
        ins_dttm: today,
        upd_nm: userInfo.acnt_id,
        upd_dttm: today
    }

    var msg = "";
    var url = "/setting/cmpy";
    var status ="SUCCESS";

    try {

        let sql1 = "INSERT INTO OPENBMS.TBL_CMPY SET ?";

        let [row1] = await global.mysqlPool.query(sql1,info);

        msg="회사 등록 성공";
        
    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}
exports.getCmpyMod = async(req, res, next) => {

    let info = {
        cmpy_seq : req.query.cmpy_seq
    }

    try {

        let sql = "SELECT tc.* FROM OPENBMS.TBL_CMPY tc WHERE tc.cmpy_seq = " + info.cmpy_seq + ";";
        let [row] = await global.mysqlPool.query(sql);

        let sql1 = "SELECT tc.gp_cd, tc.cd, tc.cd_desc FROM TBL_CD tc WHERE tc.gp_cd = 'cmpy_ty';";
        let [row1] = await global.mysqlPool.query(sql1);

        let sql2 = "SELECT tc.gp_cd, tc.cd, tc.cd_desc FROM TBL_CD tc WHERE tc.gp_cd = 'cmpy_div';";
        let [row2] = await global.mysqlPool.query(sql2);

        let sql3 = "SELECT tc.gp_cd, tc.cd, tc.cd_desc FROM TBL_CD tc WHERE tc.gp_cd = 'cmpy_biz_type';";
        let [row3] = await global.mysqlPool.query(sql3);

        let sql4 = "SELECT ta.acnt_seq, ta.acnt_id FROM OPENBMS.TBL_ACNT ta WHERE ta.acnt_delete_yn = 'N' AND ta.acnt_seq NOT IN (SELECT mac.acnt_seq FROM OPENBMS.MPP_ACNT_CMPY mac);";
        let [row4] = await global.mysqlPool.query(sql4);

        let sql4_selected = "SELECT ta.acnt_seq, ta.acnt_id FROM OPENBMS.TBL_ACNT ta WHERE ta.acnt_delete_yn = 'N' AND ta.acnt_seq IN (SELECT mac.acnt_seq FROM OPENBMS.MPP_ACNT_CMPY mac WHERE mac.cmpy_seq = " + info.cmpy_seq + ");";
        let [row4_selected] = await global.mysqlPool.query(sql4_selected);

        let sql5 = "SELECT tb.btry_seq, tb.btry_nm FROM OPENBMS.TBL_BTRY tb WHERE tb.btry_delete_yn = 'N' AND tb.btry_seq NOT IN (SELECT mcb.btry_seq FROM OPENBMS.MPP_CMPY_BTRY mcb);";
        let [row5] = await global.mysqlPool.query(sql5);

        let sql5_selected = "SELECT tb.btry_seq, tb.btry_nm FROM OPENBMS.TBL_BTRY tb WHERE tb.btry_delete_yn = 'N' AND tb.btry_seq IN (SELECT mcb.btry_seq FROM OPENBMS.MPP_CMPY_BTRY mcb WHERE mcb.cmpy_seq = " + info.cmpy_seq + ");";
        let [row5_selected] = await global.mysqlPool.query(sql5_selected);

        let sql6 = "SELECT tl.loc_seq, tl.loc_nm FROM OPENBMS.TBL_LOC tl WHERE tl.loc_delete_yn = 'N' AND tl.loc_seq NOT IN (SELECT mcl.loc_seq FROM OPENBMS.MPP_CMPY_LOC mcl);";
        let [row6] = await global.mysqlPool.query(sql6);

        let sql6_selected = "SELECT tl.loc_seq, tl.loc_nm FROM OPENBMS.TBL_LOC tl WHERE tl.loc_delete_yn = 'N' AND tl.loc_seq IN (SELECT mcl.loc_seq FROM OPENBMS.MPP_CMPY_LOC mcl WHERE mcl.cmpy_seq = " + info.cmpy_seq + ");";
        let [row6_selected] = await global.mysqlPool.query(sql6_selected);

        for(var i =0; i < row.length; i++){
            row[i].ins_dttm = row[i].ins_dttm.toFormat('YYYY-MM-DD HH:MM:SS');
            row[i].upd_dttm = row[i].upd_dttm.toFormat('YYYY-MM-DD HH:MM:SS');
        }

        res.render(viewName+"setting/cmpyMod", {cmpyInfo : row, cmpy_ty_list : row1, cmpy_div_list : row2, cmpy_biz_type_list : row3, acnt_list : row4, cmpy_acnt_list : row4_selected, btry_list : row5, cmpy_btry_list : row5_selected, loc_list : row6, cmpy_loc_list :row6_selected});

    } catch (error) {
        console.log(error);
    }
}
exports.postCmpyModComplete = async(req, res, next) => {
    var today = new Date();

    let userInfo = req.session.userInfo;

    let info = {
        cmpy_nm: req.body.cmpy_nm,
        cmpy_biz_type: req.body.cmpy_biz_type,
        cmpy_ty_cd: req.body.cmpy_ty_cd,
        cmpy_div_cd: req.body.cmpy_div_cd,
        cmpy_biz_num: req.body.cmpy_biz_num,
        cmpy_addr1: req.body.cmpy_addr1,
        cmpy_addr2: req.body.cmpy_addr2,
        cmpy_chrg_nm: req.body.cmpy_chrg_nm,
        cmpy_chrg_mail: req.body.cmpy_chrg_mail,
        cmpy_chrg_tel: req.body.cmpy_chrg_tel,
        upd_nm: userInfo.acnt_id,
        upd_dttm: today
    }

    var msg = "";
    var url = "/setting/cmpy";
    var status ="SUCCESS";

    try {

        let sql1 = "UPDATE OPENBMS.TBL_CMPY SET ? WHERE cmpy_seq = " + req.body.cmpy_seq + ";";

        let [row1] = await global.mysqlPool.query(sql1,info);

        msg="회사 수정 성공";
        
    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}
exports.getMgtlocation = async(req, res, next) => {
    try {
        sess = req.session;
        var acnt_seq = sess.acnt_seq;

        var currentPage = req.query.page;

        if(currentPage == null || currentPage == ''){
            currentPage = 1;
        }

        //페이지네이션을 위한 전체 카운트
        let sql1 = "SELECT COUNT(*) AS total_count FROM( ";
            sql1+= " select tl.* from OPENBMS.TBL_LOC tl WHERE tl.loc_delete_yn='N'";
            sql1+= ") AS main ";

        let [row1] = await global.mysqlPool.query(sql1);

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 10);
        paginate.getPages(5);
        
        // 로그인 따른 BMS 리스트
        let sql2 = " select tl.* from OPENBMS.TBL_LOC tl WHERE tl.loc_delete_yn='N' ";
            sql2+= "ORDER BY tl.loc_seq ASC ";
            sql2+= "LIMIT " + paginate.limit;

        let [row2] = await global.mysqlPool.query(sql2);

        for(var i =0; i < row2.length; i++){
            row2[i].ins_dttm = row2[i].ins_dttm.toFormat('YYYY-MM-DD');
            row2[i].upd_dttm = row2[i].upd_dttm.toFormat('YYYY-MM-DD');
        }
        
        if(row2.length <= 0) {

        }else{
            res.render(viewName+"setting/mgtlocation",{LOC_LIST : row2, liRow : paginate.pages[paginate.page - 1], pages : paginate.threePages});
        }
    } catch (error) {
        console.log(error);
    }
}
exports.getMgtlocationReg = async(req, res, next) => {

    try {

        let sql1 = "SELECT cmpy_seq, cmpy_nm FROM OPENBMS.TBL_CMPY";
        let [row1] = await global.mysqlPool.query(sql1);

        let sql2 = "SELECT tb.btry_seq, tb.btry_nm FROM OPENBMS.TBL_BTRY tb WHERE tb.btry_delete_yn = 'N' AND tb.btry_seq NOT IN (SELECT mlb.btry_seq FROM OPENBMS.MPP_LOC_BTRY mlb);";
        let [row2] = await global.mysqlPool.query(sql2);

        res.render(viewName+"setting/mgtlocationReg", {cmpy_list : row1, btry_list : row2});

    } catch (error) {
        console.log(error);
    }
}
exports.postMgtlocationRegComplete = async(req, res, next) => {
    var today = new Date();
    let userInfo = req.session.userInfo;
    let post_btry_seq_arr = req.body.post_btry_seq_arr;
    let btry_seq_arr = JSON.parse(post_btry_seq_arr);
    var siNm = req.body.siNm;
    var sggNm = req.body.sggNm;
    var emdNm = req.body.emdNm;

    var msg = "";
    var url = "/setting/mgtlocation";
    var status ="SUCCESS";

    try {

        //loc_weather_code 구하기
        var cityCode = "";
        var sggCode = "";
		
		switch (siNm) {
			case "서울특별시" : cityCode = "11"; break;
			case "부산광역시" : cityCode = "26"; break;
			case "대구광역시" : cityCode = "27"; break;
			case "인천광역시" : cityCode = "28"; break;
			case "광주광역시" : cityCode = "29"; break;
			case "대전광역시" : cityCode = "30"; break;
			case "울산광역시" : cityCode = "31"; break;
			case "경기도" : cityCode = "41"; break;
			case "강원도" : cityCode = "42"; break;
			case "충청북도" : cityCode = "43"; break;
			case "충청남도" : cityCode = "44"; break;
			case "전라북도" : cityCode = "45"; break;
			case "전라남도" : cityCode = "46"; break;
			case "경상북도" : cityCode = "47"; break;
			case "경상남도" : cityCode = "48"; break;
			case "제주특별자치도" : cityCode = "50"; break;
			default: cityCode = "11"; break;
		}

		let sggNmResult = await axios.get('https://www.kma.go.kr/DFSROOT/POINT/DATA/mdl.' + cityCode + '.json.txt');

        for(var index in sggNmResult.data){
            if(sggNmResult.data[index].value == sggNm){
                sggCode = sggNmResult.data[index].code;
            }
        }

        let emdNmResult = await axios.get('https://www.kma.go.kr/DFSROOT/POINT/DATA/leaf.' + sggCode + '.json.txt');

        for(var index in emdNmResult.data){
            var emdNmWithoutNum = emdNmResult.data[index].value.replace(/[0-9]/g,"");
            if(emdNmWithoutNum == emdNm){
                emnCode = emdNmResult.data[index].code;
            }
        }

        let info = {
            loc_nm: req.body.loc_nm,
            loc_addr1: req.body.loc_addr1,
            loc_addr2: req.body.loc_addr2,
            loc_lon: req.body.loc_lon,
            loc_lat: req.body.loc_lat,
            loc_weather_code : emnCode,
            loc_delete_yn : 'N',
            ins_nm: userInfo.acnt_id,
            ins_dttm: today,
            upd_nm: userInfo.acnt_id,
            upd_dttm: today
        }

        let sql1 = "INSERT INTO OPENBMS.TBL_LOC SET ?";

        let [row1] = await global.mysqlPool.query(sql1,info);

        let info2 = {
            cmpy_seq: req.body.cmpy_seq,
            loc_seq: row1.insertId
        }

        let sql2 = "INSERT INTO OPENBMS.MPP_CMPY_LOC SET ?";

        await global.mysqlPool.query(sql2,info2);

        let sql3 = "";

        if(btry_seq_arr.length > 0){
            for(var i in btry_seq_arr){
                sql3 += "INSERT INTO OPENBMS.MPP_LOC_BTRY SET loc_seq = " + row1.insertId + ", btry_seq = " + btry_seq_arr[i] + "; ";
                sql3 += "INSERT INTO OPENBMS.MPP_CMPY_BTRY SET cmpy_seq = " + req.body.cmpy_seq + ", btry_seq = " + btry_seq_arr[i] + "; ";
            }

            await global.mysqlPool.query(sql3);
        }

        msg="설치장소 등록 성공";
        
    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}
exports.getMgtlocationMod = async(req, res, next) => {

    let info = {
        loc_seq : req.query.loc_seq
    }

    try {

        let sql = "SELECT loc_seq,loc_nm,loc_lon,loc_lat,loc_addr1,loc_addr2,ins_nm,ins_dttm,upd_nm,upd_dttm, "
            sql+= "(SELECT cmpy_seq FROM MPP_CMPY_LOC WHERE loc_seq = " + info.loc_seq + ") as cmpy_seq FROM OPENBMS.TBL_LOC WHERE loc_delete_yn = 'N' AND loc_seq = " + info.loc_seq;
        let [row] = await global.mysqlPool.query(sql);
        
        let sql1 = "SELECT cmpy_seq, cmpy_nm FROM OPENBMS.TBL_CMPY";
        let [row1] = await global.mysqlPool.query(sql1);

        let sql2 = "SELECT tb.btry_seq, tb.btry_nm FROM OPENBMS.TBL_BTRY tb WHERE tb.btry_delete_yn = 'N' AND tb.btry_seq NOT IN (SELECT mlb.btry_seq FROM OPENBMS.MPP_LOC_BTRY mlb);";
        let [row2] = await global.mysqlPool.query(sql2);

        let sql3 = "SELECT tb.btry_seq, tb.btry_nm FROM OPENBMS.TBL_BTRY tb WHERE tb.btry_delete_yn = 'N' AND tb.btry_seq IN (SELECT mlb.btry_seq FROM OPENBMS.MPP_LOC_BTRY mlb WHERE mlb.loc_seq = " + info.loc_seq + ")";
        let [row3] = await global.mysqlPool.query(sql3);

        for(var i =0; i < row.length; i++){
            row[i].ins_dttm = row[i].ins_dttm.toFormat('YYYY-MM-DD HH:MM:SS');
            row[i].upd_dttm = row[i].upd_dttm.toFormat('YYYY-MM-DD HH:MM:SS');
        }

        res.render(viewName+"setting/mgtlocationMod",{locInfo : row, cmpy_list : row1, btry_list : row2, loc_btry_list : row3});

    } catch (error) {
        console.log(error);
    }
}
exports.postMgtlocationModComplete = async(req, res, next) => {
    var today = new Date();
    let userInfo = req.session.userInfo;
    let post_btry_seq_arr = req.body.post_btry_seq_arr;
    var btry_seq_arr = JSON.parse(post_btry_seq_arr);
    var siNm = req.body.siNm;
    var sggNm = req.body.sggNm;
    var emdNm = req.body.emdNm;

    var msg = "";
    var url = "/setting/mgtlocation";
    var status ="SUCCESS";

    try {

        //loc_weather_code 구하기

        var loc_weather_code = req.body.loc_weather_code;

        if(loc_weather_code == null || loc_weather_code == ''){
            var cityCode = "";
            var sggCode = "";
            
            switch (siNm) {
                case "서울특별시" : cityCode = "11"; break;
                case "부산광역시" : cityCode = "26"; break;
                case "대구광역시" : cityCode = "27"; break;
                case "인천광역시" : cityCode = "28"; break;
                case "광주광역시" : cityCode = "29"; break;
                case "대전광역시" : cityCode = "30"; break;
                case "울산광역시" : cityCode = "31"; break;
                case "경기도" : cityCode = "41"; break;
                case "강원도" : cityCode = "42"; break;
                case "충청북도" : cityCode = "43"; break;
                case "충청남도" : cityCode = "44"; break;
                case "전라북도" : cityCode = "45"; break;
                case "전라남도" : cityCode = "46"; break;
                case "경상북도" : cityCode = "47"; break;
                case "경상남도" : cityCode = "48"; break;
                case "제주특별자치도" : cityCode = "50"; break;
                default: cityCode = "11"; break;
            }

            let sggNmResult = await axios.get('https://www.kma.go.kr/DFSROOT/POINT/DATA/mdl.' + cityCode + '.json.txt');

            for(var index in sggNmResult.data){
                if(sggNmResult.data[index].value == sggNm){
                    loc_weather_code = sggNmResult.data[index].code;
                }
            }

            let emdNmResult = await axios.get('https://www.kma.go.kr/DFSROOT/POINT/DATA/leaf.' + loc_weather_code + '.json.txt');

            for(var index in emdNmResult.data){
                var emdNmWithoutNum = emdNmResult.data[index].value.replace(/[0-9]/g,"");
                if(emdNmWithoutNum == emdNm){
                    loc_weather_code = emdNmResult.data[index].code;
                }
            }
        }

        let info = {
            loc_nm: req.body.loc_nm,
            loc_addr1: req.body.loc_addr1,
            loc_addr2: req.body.loc_addr2,
            loc_lon: req.body.loc_lon,
            loc_lat: req.body.loc_lat,
            loc_weather_code : loc_weather_code,
            loc_delete_yn : 'N',
            upd_nm: userInfo.acnt_id,
            upd_dttm: today
        }

        let sql1 = "UPDATE OPENBMS.TBL_LOC ";
            sql1 +="SET ? WHERE loc_seq = " + req.body.loc_seq;

        let [row1] = await global.mysqlPool.query(sql1,info);

        let sql2 = "DELETE FROM OPENBMS.MPP_LOC_BTRY WHERE loc_seq = " + req.body.loc_seq + "; ";
        
        if(btry_seq_arr.length > 0){
            for(var i in btry_seq_arr){
                sql2 += "INSERT INTO OPENBMS.MPP_LOC_BTRY SET loc_seq = " + req.body.loc_seq + ", btry_seq = " + btry_seq_arr[i] + "; ";
            }
            await global.mysqlPool.query(sql2);
        }


        msg="설치장소 수정 성공";
        
    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}
exports.postMgtlocationDeleteComplete = async(req, res, next) => {
    var msg = "";
    var url = "/setting/mgtlocation";
    var status ="SUCCESS";

    try {

        let info = {
            loc_seq : req.body.loc_seq
        }
    
        let sql = "UPDATE OPENBMS.TBL_LOC SET loc_delete_yn = 'Y' WHERE loc_seq = " + info.loc_seq + "; ";
        sql += "DELETE FROM OPENBMS.MPP_CMPY_LOC WHERE loc_seq = " + info.loc_seq + "; ";
        sql += "DELETE FROM OPENBMS.MPP_LOC_BTRY WHERE loc_seq = " + info.loc_seq + "; ";

        await global.mysqlPool.query(sql);

        msg="설치장소 삭제 성공";

    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}
exports.getJusoPopup = async(req, res, next) => {

    try {

        res.render(viewName+"setting/jusoPopup");

    } catch (error) {
        console.log(error);
    }
}
exports.postConvertLonAndLat = async(req, res, next) => {
    try {

        var entX = req.body.entX;
        var entY = req.body.entY;

        proj4.defs["EPSG:5179"] = "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs";//제공되는 좌표 

        var grs80 = proj4.Proj(proj4.defs["EPSG:5179"]) 
        var wgs84 = proj4.Proj(proj4.defs["EPSG:4326"]); //경위도 

        var p = proj4.toPoint( [ Math.round(entX * 10000000000) / 10000000000, Math.round(entY * 10000000000) / 10000000000, 0] );//한국지역정보개발원 좌표 
        p = proj4.transform( grs80, wgs84, p); 

        p.x = Math.round(p.x * 10000) / 10000;
        p.y = Math.round(p.y * 10000) / 10000;

        res.send({entX : p.x, entY : p.y});
    } catch (error) {
        console.log(error);
    }
}
exports.getMgtmodule = async(req, res, next) => {
    try {
        sess = req.session;
        var acnt_seq = sess.acnt_seq;

        var currentPage = req.query.page;

        if(currentPage == null || currentPage == ''){
            currentPage = 1;
        }

        //페이지네이션을 위한 전체 카운트
        let sql1 = "SELECT COUNT(*) AS total_count FROM( ";
            sql1+= " select tm.* from OPENBMS.TBL_MDL tm WHERE tm.mdl_delete_yn = 'N'";
            sql1+= ") AS main ";

        let [row1] = await global.mysqlPool.query(sql1);

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 10);
        paginate.getPages(5);
        
        // 로그인 따른 BMS 리스트
        let sql2 = " select tm.mdl_seq, tm.mdl_no, tm.mdl_ty, tm.mdl_wh, tm.ins_nm, tm.ins_dttm, tm.upd_nm, tm.upd_dttm, "
            sql2+= " (SELECT tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'btry_mdl_ty' AND tc.cd = tm.mdl_mftr) as mdl_mftr FROM OPENBMS.TBL_MDL tm WHERE tm.mdl_delete_yn = 'N'";
            sql2+= " ORDER BY tm.mdl_seq ASC ";
            sql2+= " LIMIT " + paginate.limit;

        let [row2] = await global.mysqlPool.query(sql2);

        for(var i =0; i < row2.length; i++){
            let pwrAndUnit = utiljs.unitConvertWithComma(row2[i].mdl_wh);
            row2[i].mdl_wh = pwrAndUnit.power + pwrAndUnit.unit;
            row2[i].ins_dttm = row2[i].ins_dttm.toFormat('YYYY-MM-DD');
            row2[i].upd_dttm = row2[i].upd_dttm.toFormat('YYYY-MM-DD');
        }
        
        if(row2.length <= 0) {

        }else{
            res.render(viewName+"setting/mgtmodule",{MDL_LIST : row2, liRow : paginate.pages[paginate.page - 1], pages : paginate.threePages});
        }
    } catch (error) {
        console.log(error);
    }
}
exports.getMgtmoduleReg = async(req, res, next) => {
    try {
        
        let sql1 = "SELECT tc.cd_seq, tc.gp_cd, tc.gp_cd_desc, tc.cd, tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'mdl_ty'";
        let [row1] = await global.mysqlPool.query(sql1);

        let sql2 = "SELECT tc.cd_seq, tc.gp_cd, tc.gp_cd_desc, tc.cd, tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'btry_mdl_ty'";
        let [row2] = await global.mysqlPool.query(sql2);

        let sql3 = "SELECT tc.cd_seq, tc.gp_cd, tc.gp_cd_desc, tc.cd, tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'btry_ty'";
        let [row3] = await global.mysqlPool.query(sql3);

        res.render(viewName+"setting/mgtmoduleReg",{mdl_ty_list : row1, btry_mdl_ty_list : row2, btry_ty_list : row3});

    } catch (error) {
        console.log(error);
    }
}
exports.postMgtmoduleRegComplete = async(req, res, next) => {

    var today = new Date();

    let userInfo = req.session.userInfo;

    let info = {
        mdl_no: req.body.mdl_no,
        mdl_ty: req.body.mdl_ty,
        btry_ty: req.body.btry_ty,
        rated_voltage: req.body.rated_voltage,
        mdl_min_volt: req.body.mdl_min_volt,
        mdl_max_volt: req.body.mdl_max_volt,
        mdl_charge_min_tp: req.body.mdl_charge_min_tp,
        mdl_charge_max_tp: req.body.mdl_charge_max_tp,
        mdl_decharge_min_tp: req.body.mdl_decharge_min_tp,
        mdl_decharge_max_tp: req.body.mdl_decharge_max_tp,
        mdl_normal_min_tp: req.body.mdl_normal_min_tp,
        mdl_normal_max_tp: req.body.mdl_normal_max_tp,
        mdl_wh: req.body.mdl_wh,
        mdl_Ah: req.body.mdl_Ah,
        mdl_mftr: req.body.mdl_mftr,
        ins_nm: userInfo.acnt_id,
        ins_dttm: today,
        upd_nm: userInfo.acnt_id,
        upd_dttm: today
    }

    var msg = "";
    var url = "/setting/mgtmodule";
    var status ="SUCCESS";

    try {

        let sql1 = "INSERT INTO OPENBMS.TBL_MDL SET ?";

        let [row1] = await global.mysqlPool.query(sql1,info);

        msg="모듈 등록 성공";
        
    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}
exports.getMgtmoduleMod = async(req, res, next) => {
    try {

        let sql = "SELECT * FROM OPENBMS.TBL_MDL WHERE mdl_delete_yn = 'N' AND mdl_seq =" + req.query.mdl_seq;
        let [row] = await global.mysqlPool.query(sql);
        
        let sql1 = "SELECT tc.cd_seq, tc.gp_cd, tc.gp_cd_desc, tc.cd, tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'mdl_ty'";
        let [row1] = await global.mysqlPool.query(sql1);

        let sql2 = "SELECT tc.cd_seq, tc.gp_cd, tc.gp_cd_desc, tc.cd, tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'btry_mdl_ty'";
        let [row2] = await global.mysqlPool.query(sql2);

        let sql3 = "SELECT tc.cd_seq, tc.gp_cd, tc.gp_cd_desc, tc.cd, tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'btry_ty'";
        let [row3] = await global.mysqlPool.query(sql3);

        for(var i =0; i < row.length; i++){
            row[i].ins_dttm = row[i].ins_dttm.toFormat('YYYY-MM-DD HH:MM:SS');
            row[i].upd_dttm = row[i].upd_dttm.toFormat('YYYY-MM-DD HH:MM:SS');
        }

        res.render(viewName+"setting/mgtmoduleMod",{mdl_ty_list : row1, btry_mdl_ty_list : row2, btry_ty_list : row3, mdlInfo : row});

    } catch (error) {
        console.log(error);
    }
}
exports.postMgtmoduleModComplete = async(req, res, next) => {

    var today = new Date();

    let userInfo = req.session.userInfo;

    let info = {
        mdl_no: req.body.mdl_no,
        mdl_ty: req.body.mdl_ty,
        btry_ty: req.body.btry_ty,
        rated_voltage: req.body.rated_voltage,
        mdl_min_volt: req.body.mdl_min_volt,
        mdl_max_volt: req.body.mdl_max_volt,
        mdl_charge_min_tp: req.body.mdl_charge_min_tp,
        mdl_charge_max_tp: req.body.mdl_charge_max_tp,
        mdl_decharge_min_tp: req.body.mdl_decharge_min_tp,
        mdl_decharge_max_tp: req.body.mdl_decharge_max_tp,
        mdl_normal_min_tp: req.body.mdl_normal_min_tp,
        mdl_normal_max_tp: req.body.mdl_normal_max_tp,
        mdl_wh: req.body.mdl_wh,
        mdl_Ah: req.body.mdl_Ah,
        mdl_mftr: req.body.mdl_mftr,
        ins_nm: userInfo.acnt_id,
        ins_dttm: today,
        upd_nm: userInfo.acnt_id,
        upd_dttm: today
    }

    var msg = "";
    var url = "/setting/mgtmodule";
    var status ="SUCCESS";

    try {

        let sql1 = "UPDATE OPENBMS.TBL_MDL ";
            sql1 +="SET ? WHERE mdl_seq = " + req.body.mdl_seq;

        let [row1] = await global.mysqlPool.query(sql1,info);

        msg="모듈 수정 성공";
        
    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }

}
exports.postMgtmoduleDeleteComplete = async(req, res, next) => {
    var msg = "";
    var url = "/setting/mgtmodule";
    var status ="SUCCESS";

    try {

        let info = {
            mdl_seq : req.body.mdl_seq
        }
    
        let sql = "UPDATE OPENBMS.TBL_MDL SET mdl_delete_yn = 'Y' WHERE mdl_seq = " + info.mdl_seq + "; ";
        sql += "UPDATE OPENBMS.TBL_BTRY SET btry_delete_yn = 'Y' WHERE mdl_seq = " + info.mdl_seq + "; ";
        sql += "DELETE FROM OPENBMS.MPP_BTRY_MDL WHERE mdl_seq = " + info.mdl_seq + "; ";

        await global.mysqlPool.query(sql);

        msg="모듈 삭제 성공";

    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}
exports.getMgtbattery = async(req, res, next) => {

    try {
        sess = req.session;
        var acnt_seq = sess.acnt_seq;

        var currentPage = req.query.page;

        if(currentPage == null || currentPage == ''){
            currentPage = 1;
        }

        //페이지네이션을 위한 전체 카운트
        let sql1 = "SELECT COUNT(*) AS total_count FROM( ";
            sql1+= " select tb.* from OPENBMS.TBL_BTRY tb WHERE tb.btry_delete_yn = 'N'";
            sql1+= ") AS main ";

        let [row1] = await global.mysqlPool.query(sql1);

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 10);
        paginate.getPages(5);
        
        // 로그인 따른 BMS 리스트
        let sql2  = " SELECT tb.*, ";
            sql2 += "(SELECT tm.mdl_no FROM OPENBMS.TBL_MDL tm WHERE tm.mdl_delete_yn = 'N' AND tm.mdl_seq = tb.mdl_seq) as mdl_no, "; 
            sql2 += "       (SELECT tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.cd =  "; 
            sql2 += "        (SELECT tm.btry_ty FROM OPENBMS.TBL_MDL tm WHERE tb.mdl_seq = tm.mdl_seq) AND tc.gp_cd = 'btry_ty') as btry_ty, "; 
            sql2 += "        (SELECT tc.cmpy_nm FROM OPENBMS.TBL_CMPY tc  "; 
            sql2 += "        WHERE tc.cmpy_seq IN "; 
            sql2 += "        (SELECT mcb.cmpy_seq FROM OPENBMS.MPP_CMPY_BTRY mcb WHERE mcb.btry_seq = tb.btry_seq) "; 
            sql2 += "        AND tc.cmpy_ty_cd = 'D') as cmpy_nm  "; 
            sql2 += "    FROM OPENBMS.TBL_BTRY tb WHERE tb.btry_delete_yn = 'N'  "; 
            sql2 += "    ORDER BY tb.btry_seq ASC  "; 
            sql2 += "LIMIT " + paginate.limit;

        let [row2] = await global.mysqlPool.query(sql2);

        for(var i =0; i < row2.length; i++){
            let pwrAndUnit = utiljs.unitConvertWithComma(row2[i].btry_max_pwr);
            row2[i].btry_max_pwr = pwrAndUnit.power + pwrAndUnit.unit;
            row2[i].ins_dttm = row2[i].ins_dttm.toFormat('YYYY-MM-DD');
            row2[i].upd_dttm = row2[i].upd_dttm.toFormat('YYYY-MM-DD');
        }

        if(row2.length <= 0) {

        }else{
            res.render(viewName+"setting/mgtbattery",{BMS_LIST : row2, liRow : paginate.pages[paginate.page - 1], pages : paginate.threePages});
        }
    } catch (error) {
        
        console.log(error);

    }

}

exports.getMgtbatteryReg = async(req, res, next) => {

    try {

        let sql2 = "SELECT tc.cd_seq, tc.gp_cd, tc.gp_cd_desc, tc.cd, tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'btry_mdl_ty'";
        let [row2] = await global.mysqlPool.query(sql2);

        let sql3_1 = "SELECT tc.cd_seq, tc.gp_cd, tc.gp_cd_desc, tc.cd, tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'btry_stat'";
        let [row3_1] = await global.mysqlPool.query(sql3_1);

        let sql3_2 = "SELECT tc.cd_seq, tc.gp_cd, tc.gp_cd_desc, tc.cd, tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'btry_mng_stat'";
        let [row3_2] = await global.mysqlPool.query(sql3_2);

        let sql4 = "SELECT tc.cmpy_seq, tc.cmpy_ty_cd, tc.cmpy_nm, tc.cmpy_biz_type FROM OPENBMS.TBL_CMPY tc WHERE tc.cmpy_ty_cd = 'M' AND tc.cmpy_biz_type = '10'";
        let [row4] = await global.mysqlPool.query(sql4);

        let sql5 = "SELECT mdl_seq, mdl_no FROM OPENBMS.TBL_MDL WHERE mdl_delete_yn = 'N'";
        let [row5] = await global.mysqlPool.query(sql5);

        let sql6 = "SELECT loc_seq, loc_nm FROM OPENBMS.TBL_LOC WHERE loc_delete_yn = 'N'";
        let [row6] = await global.mysqlPool.query(sql6);

        res.render(viewName+"setting/mgtbatteryReg",{btry_mdl_ty_list : row2, btry_stat_list : row3_1, btry_mng_stat_list : row3_2, cmpy_list : row4, mdl_list : row5, loc_list : row6});

    } catch (error) {
        console.log(error);
    }
}

exports.postMgtbatteryRegComplete = async(req, res, next) => {

    var today = new Date();

    let userInfo = req.session.userInfo;

    var loc_seq = req.body.loc_seq;

    let info = {
        btry_nm: req.body.btry_nm,
        btry_mdl_ty_cd: req.body.btry_mdl_ty_cd,
        btry_min_volt: req.body.btry_min_volt,
        btry_max_volt: req.body.btry_max_volt,
        btry_min_curr: req.body.btry_min_curr,
        btry_max_curr: req.body.btry_max_curr,
        btry_min_tp: req.body.btry_min_tp,
        btry_max_tp: req.body.btry_max_tp,
        btry_max_pwr: req.body.btry_max_pwr,
        btry_mng_stat: req.body.btry_mng_stat,
        mdl_seq: req.body.mdl_seq,
        btry_mfctor_nm: req.body.btry_mfctor_nm,
        ins_nm: userInfo.acnt_id,
        ins_dttm: today,
        upd_nm: userInfo.acnt_id,
        upd_dttm: today
    }

    var msg = "";
    var url = "/setting/mgtbattery";
    var status ="SUCCESS";

    try {

        let sql1 = "INSERT INTO OPENBMS.TBL_BTRY SET ?";

        let [row1] = await global.mysqlPool.query(sql1,info);

        let info2 = {
            cmpy_seq: req.body.cmpy_seq,
            btry_seq: row1.insertId
        }

        let sql2 = "INSERT INTO OPENBMS.MPP_CMPY_BTRY SET ?";

        await global.mysqlPool.query(sql2,info2);

        let sql3 = "INSERT INTO OPENBMS.MPP_BTRY_MDL SET ?";

        let info3 = {
            mdl_seq: req.body.mdl_seq,
            btry_seq: row1.insertId
        }

        await global.mysqlPool.query(sql3,info3);

        let sql4 = "INSERT INTO OPENBMS.MPP_LOC_BTRY SET ?";

        let info4 = {
            btry_seq : row1.insertId,
            loc_seq : loc_seq
        }

        await global.mysqlPool.query(sql4,info4);

        //배터리 등록시 알람 등록, 기본 값 모두 0
        let sql5 = "INSERT INTO OPENBMS.TBL_ALM SET ?";

        let info5 = {
            btry_seq : row1.insertId,
            alm_min_volt : 0,
            alm_max_volt : 0,
            alm_min_curr : 0,
            alm_max_curr : 0,
            alm_min_tp : 0,
            alm_max_tp : 0,
            alm_min_harmony : 0,
            alm_sms : 0,
            stop_pwr : 0,
            ins_nm: userInfo.acnt_id,
            ins_dttm: today,
            upd_nm: userInfo.acnt_id,
            upd_dttm: today

        }

        await global.mysqlPool.query(sql5,info5);

        msg="배터리 등록 성공";
        
    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}

exports.getMgtbatteryMod = async(req, res, next) => {

    var info = {
        btry_seq : req.query.btry_seq
    }

    try {

        let sql = "SELECT tb.*,(SELECT mlb.loc_seq FROM OPENBMS.MPP_LOC_BTRY mlb WHERE mlb.btry_seq = tb.btry_seq) as loc_seq, ";
            sql+= " (SELECT tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd ='btry_mdl_ty' AND tc.cd = (SELECT tm.mdl_mftr FROM OPENBMS.TBL_MDL tm WHERE tm.mdl_delete_yn = 'N' AND tm.mdl_seq = tb.mdl_seq) ) as btry_mdl_ty, "; 
            sql+= " (SELECT tc.cmpy_nm FROM OPENBMS.TBL_CMPY tc WHERE tc.cmpy_seq = (SELECT mcl.cmpy_seq FROM OPENBMS.MPP_CMPY_LOC mcl WHERE mcl.loc_seq = (SELECT mlb.loc_seq FROM OPENBMS.MPP_LOC_BTRY mlb WHERE mlb.btry_seq = tb.btry_seq))) as cmpy_nm, ";
            sql+= " (SELECT tc.cmpy_seq FROM OPENBMS.TBL_CMPY tc WHERE tc.cmpy_seq = (SELECT mcl.cmpy_seq FROM OPENBMS.MPP_CMPY_LOC mcl WHERE mcl.loc_seq = (SELECT mlb.loc_seq FROM OPENBMS.MPP_LOC_BTRY mlb WHERE mlb.btry_seq = tb.btry_seq))) as cmpy_seq "; 
            sql+= " FROM OPENBMS.TBL_BTRY tb WHERE tb.btry_delete_yn = 'N' AND tb.btry_seq = " + info.btry_seq;
        let [row] = await global.mysqlPool.query(sql);

        let sql2 = "SELECT tc.cd_seq, tc.gp_cd, tc.gp_cd_desc, tc.cd, tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'btry_mdl_ty'";
        let [row2] = await global.mysqlPool.query(sql2);

        let sql3_1 = "SELECT tc.cd_seq, tc.gp_cd, tc.gp_cd_desc, tc.cd, tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'btry_stat'";
        let [row3_1] = await global.mysqlPool.query(sql3_1);

        let sql3_2 = "SELECT tc.cd_seq, tc.gp_cd, tc.gp_cd_desc, tc.cd, tc.cd_desc FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'btry_mng_stat'";
        let [row3_2] = await global.mysqlPool.query(sql3_2);

        let sql4 = "SELECT tc.cmpy_seq, tc.cmpy_ty_cd, tc.cmpy_nm, tc.cmpy_biz_type FROM OPENBMS.TBL_CMPY tc WHERE tc.cmpy_ty_cd = 'M' AND tc.cmpy_biz_type = '10'";
        let [row4] = await global.mysqlPool.query(sql4);

        let sql5 = "SELECT mdl_seq, mdl_no FROM OPENBMS.TBL_MDL WHERE mdl_delete_yn = 'N'";
        let [row5] = await global.mysqlPool.query(sql5);

        let sql6 = "SELECT tl.loc_seq, tl.loc_nm, mcl.cmpy_seq FROM OPENBMS.TBL_LOC tl  ";
            sql6 +="LEFT OUTER JOIN OPENBMS.MPP_CMPY_LOC mcl ON mcl.loc_seq = tl.loc_seq  ";
            sql6 +="WHERE tl.loc_delete_yn = 'N'  ";
        let [row6] = await global.mysqlPool.query(sql6);

        for(var i =0; i < row.length; i++){
            row[i].ins_dttm = row[i].ins_dttm.toFormat('YYYY-MM-DD HH:MM:SS');
            row[i].upd_dttm = row[i].upd_dttm.toFormat('YYYY-MM-DD HH:MM:SS');
        }

        res.render(viewName+"setting/mgtbatteryMod",{btryInfo : row, btry_mdl_ty_list : row2, btry_stat_list : row3_1, btry_mng_stat_list: row3_2, cmpy_list : row4, mdl_list : row5, loc_list : row6});

    } catch (error) {
        console.log(error);
    }
}
exports.postMdlMftrByMdlSeq = async(req, res, next) => {

    try {
        let info = {
            mdl_seq : req.body.mdl_seq
        }
    
        let sql1 = "SELECT tc.cd as btry_mdl_ty_cd, tc.cd_desc as btry_mdl_ty FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'btry_mdl_ty' AND tc.cd = (SELECT tm.mdl_mftr FROM OPENBMS.TBL_MDL tm WHERE tm.mdl_delete_yn='N' AND tm.mdl_seq = " + info.mdl_seq + ")";
    
        let [row1] = await global.mysqlPool.query(sql1);
    
        res.send({mdlInfo : row1});   
    } catch (error) {
        console.log(error);
    }

}

exports.postCmpyNmByLocSeq = async(req, res, next) => {

    try {
        let info = {
            loc_seq : req.body.loc_seq
        }
    
        let sql1 = "SELECT tc.cmpy_seq, tc.cmpy_nm FROM OPENBMS.TBL_CMPY tc WHERE tc.cmpy_seq = (SELECT mcl.cmpy_seq FROM OPENBMS.MPP_CMPY_LOC mcl WHERE mcl.loc_seq = " + info.loc_seq + ")";
    
        let [row1] = await global.mysqlPool.query(sql1);
    
        res.send({cmpyInfo : row1});   
    } catch (error) {
        console.log(error);
    }

}
exports.postMgtbatteryModComplete = async(req, res, next) => {

    var today = new Date();

    let userInfo = req.session.userInfo;

    var loc_seq = req.body.loc_seq;

    let info = {
        btry_nm: req.body.btry_nm,
        btry_mdl_ty_cd: req.body.btry_mdl_ty_cd,
        btry_min_volt: req.body.btry_min_volt,
        btry_max_volt: req.body.btry_max_volt,
        btry_min_curr: req.body.btry_min_curr,
        btry_max_curr: req.body.btry_max_curr,
        btry_min_tp: req.body.btry_min_tp,
        btry_max_tp: req.body.btry_max_tp,
        btry_max_pwr: req.body.btry_max_pwr,
        btry_mng_stat : req.body.btry_mng_stat,
        mdl_seq: req.body.mdl_seq,
        btry_mfctor_nm: req.body.btry_mfctor_nm,
        upd_nm: userInfo.acnt_id,
        upd_dttm: today
    }

    var msg = "";
    var url = "/setting/mgtbattery";
    var status ="SUCCESS";

    try {

        let sql1 = "UPDATE OPENBMS.TBL_BTRY SET ? WHERE btry_seq = " + req.body.btry_seq;

        let [row1] = await global.mysqlPool.query(sql1,info);

        let sql2 = "UPDATE OPENBMS.MPP_CMPY_BTRY SET cmpy_seq=" + req.body.cmpy_seq + " WHERE btry_seq = " + req.body.btry_seq;

        await global.mysqlPool.query(sql2);

        let sql3 = "UPDATE OPENBMS.MPP_BTRY_MDL SET mdl_seq=" + req.body.mdl_seq + " WHERE btry_seq = " + req.body.btry_seq;

        await global.mysqlPool.query(sql3);

        let sql4 = "UPDATE OPENBMS.MPP_LOC_BTRY SET loc_seq=" + loc_seq + " WHERE btry_seq = " + req.body.btry_seq;

        let [result4] = await global.mysqlPool.query(sql4);

        if(result4.affectedRows <= 0){
            
            let info5 = {
                loc_seq : loc_seq,
                btry_seq : req.body.btry_seq
            }


            let sql5 = "INSERT INTO OPENBMS.MPP_LOC_BTRY SET ?";
            await global.mysqlPool.query(sql5, info5);

        }

        msg="배터리 수정 성공";
        
    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }

}
exports.postMgtbatteryDeleteComplete = async(req, res, next) => {
    
    var msg = "";
    var url = "/setting/mgtbattery";
    var status ="SUCCESS";

    try {

        let info = {
            btry_seq : req.body.btry_seq
        }
    
        let sql = "UPDATE OPENBMS.TBL_BTRY SET btry_delete_yn = 'Y' WHERE btry_seq = " + info.btry_seq + "; ";
        sql += "UPDATE OPENBMS.TBL_ALM SET alm_delete_yn = 'Y' WHERE btry_seq = " + info.btry_seq + "; ";
        sql += "DELETE FROM OPENBMS.MPP_CMPY_BTRY WHERE btry_seq = " + info.btry_seq + "; ";
        sql += "DELETE FROM OPENBMS.MPP_LOC_BTRY WHERE btry_seq = " + info.btry_seq + "; ";
        sql += "DELETE FROM OPENBMS.MPP_BTRY_MDL WHERE btry_seq = " + info.btry_seq + "; ";

        await global.mysqlPool.query(sql);

        msg="배터리 삭제 성공";

    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}
exports.getMgtalarm = async(req, res, next) => {

    try {
        sess = req.session;
        var acnt_seq = sess.acnt_seq;
        var userInfo = req.session.userInfo;

        var currentPage = req.query.page;

        if(currentPage == null || currentPage == ''){
            currentPage = 1;
        }

        //페이지네이션을 위한 전체 카운트
        let sql1 = "SELECT COUNT(*) AS total_count FROM( ";
            sql1 += " select ta.alm_seq, ta.btry_seq, ";
            sql1 +=" tb2.btry_nm,ta.alm_min_volt,  ta.alm_max_volt, ta.alm_min_curr, ta.alm_max_curr, ta.alm_min_tp, ta.alm_max_tp, ta.alm_min_harmony,  ";
            sql1 +=" ta.ins_nm, ta.ins_dttm, ta.upd_nm, ta.upd_dttm, ta.stop_pwr ";
            sql1 +=" FROM OPENBMS.TBL_ALM ta  ";
            sql1 +=" LEFT OUTER JOIN OPENBMS.TBL_BTRY tb2 ON tb2.btry_seq = ta.btry_seq ";
            sql1 +=" ORDER BY ta.alm_seq ASC ";
            sql1 += ") AS main ";

        let [row1] = await global.mysqlPool.query(sql1);

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 10);
        paginate.getPages(5);
        
        // 로그인 따른 BMS 리스트
        let sql2 = " select ta.alm_seq, ta.btry_seq, ";
        sql2 +="tb2.btry_nm,ta.alm_min_volt,  ta.alm_max_volt, ta.alm_min_curr, ta.alm_max_curr, ta.alm_min_tp, ta.alm_max_tp, ta.alm_min_harmony,  ";
        sql2 +=" ta.ins_nm, ta.ins_dttm, ta.upd_nm, ta.upd_dttm, ta.stop_pwr ";
        sql2 +=" FROM OPENBMS.TBL_ALM ta  ";
        sql2 +=" LEFT OUTER JOIN OPENBMS.TBL_BTRY tb2 ON tb2.btry_seq = ta.btry_seq ";
        sql2 +=" ORDER BY ta.alm_seq ASC ";
        sql2+= "LIMIT " + paginate.limit;

        let [row2] = await global.mysqlPool.query(sql2);

        for(var i =0; i < row2.length; i++){
            row2[i].ins_dttm = row2[i].ins_dttm.toFormat('YYYY-MM-DD');
            row2[i].upd_dttm = row2[i].upd_dttm.toFormat('YYYY-MM-DD');
        }
        
        res.render(viewName+"setting/mgtalarm",{ALM_LIST : row2, liRow : paginate.pages[paginate.page - 1], pages : paginate.threePages});

    } catch (error) {
        
        console.log(error);

    }
   
}
exports.getMgtalarmReg = async(req, res, next) => {
    try {
        
        let sql1 = "SELECT * FROM OPENBMS.TBL_BTRY WHERE btry_delete_yn = 'N';";
        let [row1] = await global.mysqlPool.query(sql1);

        res.render(viewName+"setting/mgtalarmReg",{btry_list : row1});

    } catch (error) {
        console.log(error);
    }
}
exports.postMgtalarmRegComplete = async(req, res, next) => {
    var today = new Date();

    let userInfo = req.session.userInfo;

    let info = {
        btry_seq: req.body.btry_seq,
        alm_min_volt: req.body.alm_min_volt,
        alm_max_volt: req.body.alm_max_volt,
        alm_min_curr: req.body.alm_min_curr,
        alm_max_curr: req.body.alm_max_curr,
        alm_min_tp: req.body.alm_min_tp,
        alm_max_tp: req.body.alm_max_tp,
        alm_min_harmony: req.body.alm_min_harmony,
        alm_sms: req.body.alm_sms,
        stop_pwr: req.body.stop_pwr,
        ins_nm: userInfo.acnt_id,
        ins_dttm: today,
        upd_nm: userInfo.acnt_id,
        upd_dttm: today
    }

    var msg = "";
    var url = "/setting/mgtalarm";
    var status ="SUCCESS";

    try {

        let sql1 = "INSERT INTO OPENBMS.TBL_ALM SET ?";

        let [row1] = await global.mysqlPool.query(sql1,info);

        msg="알람 등록 성공";
        
    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}
exports.getMgtalarmMod = async(req, res, next) => {

    let info = {
        alm_seq : req.query.alm_seq
    }

    try {

        let sql = "SELECT ta.*,(SELECT tb.btry_nm FROM TBL_BTRY tb WHERE ta.btry_seq = tb.btry_seq) as btry_nm FROM OPENBMS.TBL_ALM ta WHERE  ta.alm_seq = " + info.alm_seq;
        let [row] = await global.mysqlPool.query(sql);
        
        let sql1 = "SELECT * FROM OPENBMS.TBL_BTRY;";
        let [row1] = await global.mysqlPool.query(sql1);


        for(var i =0; i < row.length; i++){
            row[i].ins_dttm = row[i].ins_dttm.toFormat('YYYY-MM-DD HH:MM:SS');
            row[i].upd_dttm = row[i].upd_dttm.toFormat('YYYY-MM-DD HH:MM:SS');
        }

        res.render(viewName+"setting/mgtalarmMod",{ALM_INFO : row, btry_list : row1});

    } catch (error) {
        console.log(error);
    }
}
exports.postMgtalarmModComplete = async(req, res, next) => {
    var today = new Date();

    let userInfo = req.session.userInfo;

    let info = {
        btry_seq: req.body.btry_seq,
        alm_min_volt: req.body.alm_min_volt,
        alm_max_volt: req.body.alm_max_volt,
        alm_min_curr: req.body.alm_min_curr,
        alm_max_curr: req.body.alm_max_curr,
        alm_min_tp: req.body.alm_min_tp,
        alm_max_tp: req.body.alm_max_tp,
        alm_min_harmony: req.body.alm_min_harmony,
        alm_sms: req.body.alm_sms,
        stop_pwr: req.body.stop_pwr,
        upd_nm: userInfo.acnt_id,
        upd_dttm: today
    }

    var msg = "";
    var url = "/setting/mgtalarm";
    var status ="SUCCESS";

    try {

        let sql1 = "UPDATE OPENBMS.TBL_ALM ";
            sql1 +="SET ? WHERE alm_seq = " + req.body.alm_seq;

        let [row1] = await global.mysqlPool.query(sql1,info);

        msg="알람 수정 성공";
        
    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}
/**
 * 각 모듈별 알람설정
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

exports.getArmdataList = async(req, res, next) => {
    console.log("getArmdataList start");
    sess = req.session;
    var acnt_seq = sess.acnt_seq;

    // 로그인 확인
    if(acnt_seq < 0){
        res.redirect('/account/login');
    }
    let info = {
        btry_seq : req.body.btry_seq
    }


    let selectQuery = "SELECT * from OPENBMS.TBL_ALM ";   
    //selectQuery += "where btry_seq = "+req.body.btry_seq;
    selectQuery += "WHERE alm_delete_yn = 'N' AND btry_seq = "+info.btry_seq;

    let [mRows] = await global.mysqlPool.query(selectQuery);
    
    if(mRows.length <= 0) {
        res.send("No data");
    }else{        
        res.send({ data: mRows});
    }
    
}
exports.getAlarmReg = async(req, res, next) => {
    sess = req.session;
    var acnt_seq = sess.acnt_seq;
    
    // 로그인 확인
    if(acnt_seq < 0){
        res.redirect('/account/login');
    } 
    var info = {
        btry_seq : req.query.btry_seq
    }
  


    res.render(viewName+"setting/alarmReg", {btry_seq:info.btry_seq});
}

exports.postsetArmdataList = async(req, res, next) => {
    
    var msg = "";
    var url = "/setting/postsetArmdataList";
    var status ="SUCCESS";

    try {

        let info = {
            btry_seq : req.body.btry_seq,
            min_volt : req.body.min_volt,
            max_volt : req.body.max_volt,
            min_curr : req.body.min_curr,
            max_curr : req.body.max_curr,
            min_temp : req.body.min_temp,
            max_temp : req.body.max_temp,
            harmony : req.body.harmony,
            sms : req.body.sms,
            pwd_control : req.body.pwd_control
        }
    
        let sql = "UPDATE OPENBMS.TBL_ALM SET ";
        sql += " alm_min_volt = " + info.min_volt;
        sql += ", alm_max_volt = " + info.max_volt;
        sql += ", alm_min_curr = " + info.min_curr;
        sql += ", alm_max_curr = " + info.max_curr;
        sql += ", alm_min_tp = " + info.min_temp;
        sql += ", alm_max_tp = " + info.max_temp;
        sql += ", alm_min_harmony = " + info.harmony;
        sql += ", alm_sms = " + info.sms;
        sql += ", stop_pwr = '" + info.pwd_control +"'";
        
        sql += " where btry_seq = " + info.btry_seq;

        await global.mysqlPool.query(sql);

        msg="변경 성공";

    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}


