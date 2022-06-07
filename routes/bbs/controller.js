// const asyncWrapper = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next());
// const form = require('../../config/form.js');
const { parseTwoDigitYear } = require("moment");
const { userInfo } = require("os");
const path = require("path");
const Pagination = require(path.join(global.appRoot,"/modules/pagination.js"));
const form = require(path.join(global.appRoot,"/modules/form.js"));
require("date-utils");

exports.getFaq = async(req, res, next) => {

    try {
        var currentPage = req.query.page;

        if(currentPage == null || currentPage == ''){
            currentPage = 1;
        }

        let sql1 = "SELECT COUNT(*) as total_count FROM OPENBMS.TBL_FAQ;";

        let [row1] = await global.mysqlPool.query(sql1);

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 10);
            paginate.getPages(5);

        //FAQ 목록
        let sql2 = "SELECT tf.faq_seq, tf.faq_qust, tf.faq_ans, tf.ins_nm, tf.ins_dttm, tf.upd_nm, tf.upd_dttm ";
            sql2+= "FROM OPENBMS.TBL_FAQ as tf ";
            sql2+= "ORDER BY tf.faq_seq ASC ";
            sql2+= "LIMIT " + paginate.limit;

        let [row2] = await global.mysqlPool.query(sql2);

        res.render("bbs/faq",{faqList : row2, liRow : paginate.pages[paginate.page - 1], pages : paginate.threePages});
    } catch (error) {
        
        console.log(error);
        res.render("bbs/faq",{faqList : null, liRow : "1", pages : "1"});

    }

}

exports.postFaqRegComplete = async(req, res, next) => {

    var today = new Date();

    let userInfo = req.session.userInfo;

    let info = {
        faq_qust: req.body.faq_qust,
        faq_ans: req.body.faq_ans,
        ins_nm: userInfo.acnt_id,
        ins_dttm: today,
        upd_nm: userInfo.acnt_id,
        upd_dttm: today
    }

    var msg = "";
    var url = "/bbs/faq";
    var status ="SUCCESS";

    try {

        let sql = "INSERT INTO OPENBMS.TBL_FAQ SET ? ";

        await global.mysqlPool.query(sql,info);

        msg="FAQ 등록 성공";
        
    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}

exports.postFaqModComplete = async(req, res, next) => {

    var today = new Date();

    let userInfo = req.session.userInfo;

    let info = {
        faq_qust: req.body.faq_qust_mod,
        faq_ans: req.body.faq_ans_mod,
        upd_nm: userInfo.acnt_id,
        upd_dttm: today
    }

    var msg = "";
    var url = "/bbs/faq";
    var status ="SUCCESS";

    try {

        let sql = "UPDATE OPENBMS.TBL_FAQ SET ? WHERE faq_seq = " + req.body.faq_seq_mod;

        await global.mysqlPool.query(sql,info);

        msg="FAQ 수정 성공";
        
    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}

exports.postFaqDeleteComplete = async(req, res, next) => {

    var today = new Date();

    let userInfo = req.session.userInfo;

    var msg = "";
    var url = "/bbs/faq";
    var status ="SUCCESS";

    try {

        let sql = "DELETE FROM OPENBMS.TBL_FAQ WHERE faq_seq = '" + req.body.faq_seq + "'";

        await global.mysqlPool.query(sql);

        msg="FAQ 삭제 성공";
        
    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}

exports.getQna = async(req, res, next) => {

    let userInfo = req.session.userInfo;

    try {
        var currentPage = req.query.page;

        if(currentPage == null || currentPage == ''){
            currentPage = 1;
        }

        let sql1 = "";

        if(userInfo.acnt_role == 'SA'){
            sql1+= "SELECT COUNT(*) AS total_count FROM( ";
            sql1+= "SELECT tq.qna_seq, tq.acnt_seq, tq.qna_title, tq.qna_content, tq.qna_stat, tq.ins_nm, tq.ins_dttm, tq.upd_nm, tq.upd_dttm, 'Q' AS QorA ";
            sql1+= "FROM OPENBMS.TBL_QNA as tq ";
            sql1+= "UNION ALL ";
            sql1+= "SELECT tqa.qna_seq, (SELECT ta.acnt_seq FROM OPENBMS.TBL_ACNT AS ta WHERE ta.acnt_id = tqa.ins_nm) AS acnt_seq, tqa.ans_title AS qna_title, tqa.ans_content AS qna_content, tqa.ans_stat AS qna_stat, tqa.ins_nm, tqa.ins_dttm, tqa.upd_nm, tqa.upd_dttm, 'A' AS QorA ";
            sql1+= "FROM OPENBMS.TBL_QNA_ANS AS tqa WHERE tqa.qna_seq IN (SELECT tq2.qna_seq FROM OPENBMS.TBL_QNA tq2) ";
            sql1+= "ORDER BY qna_seq ASC ";
            sql1+= ") AS main ";
        }else{
            sql1+= "SELECT COUNT(*) AS total_count FROM( ";
            sql1+= "SELECT tq.qna_seq, tq.acnt_seq, tq.qna_title, tq.qna_content, tq.qna_stat, tq.ins_nm, tq.ins_dttm, tq.upd_nm, tq.upd_dttm, 'Q' AS QorA ";
            sql1+= "FROM OPENBMS.TBL_QNA as tq WHERE tq.acnt_seq = " + userInfo.acnt_seq + "  ";
            sql1+= "UNION ALL ";
            sql1+= "SELECT tqa.qna_seq, (SELECT ta.acnt_seq FROM OPENBMS.TBL_ACNT AS ta WHERE ta.acnt_id = tqa.ins_nm) AS acnt_seq, tqa.ans_title AS qna_title, tqa.ans_content AS qna_content, tqa.ans_stat AS qna_stat, tqa.ins_nm, tqa.ins_dttm, tqa.upd_nm, tqa.upd_dttm, 'A' AS QorA ";
            sql1+= "FROM OPENBMS.TBL_QNA_ANS AS tqa WHERE tqa.qna_seq IN (SELECT tq2.qna_seq FROM OPENBMS.TBL_QNA tq2 WHERE tq2.acnt_seq = " + userInfo.acnt_seq + ") ";
            sql1+= "ORDER BY qna_seq ASC ";
            sql1+= ") AS main ";

        }

        let [row1] = await global.mysqlPool.query(sql1);

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 10);
            paginate.getPages(5);

        let sql2 = "";

        if(userInfo.acnt_role == 'SA'){
            sql2+= "SELECT tq.qna_seq, tq.acnt_seq, tq.qna_title, tq.qna_content, tq.qna_stat, tq.ins_nm, tq.ins_dttm, tq.upd_nm, tq.upd_dttm, 'Q' AS QorA ";
            sql2+= "FROM OPENBMS.TBL_QNA as tq ";
            sql2+= "UNION ALL ";
            sql2+= "SELECT tqa.qna_seq, (SELECT ta.acnt_seq FROM OPENBMS.TBL_ACNT AS ta WHERE ta.acnt_id = tqa.ins_nm) AS acnt_seq, tqa.ans_title AS qna_title, tqa.ans_content AS qna_content, tqa.ans_stat AS qna_stat, tqa.ins_nm, tqa.ins_dttm, tqa.upd_nm, tqa.upd_dttm, 'A' AS QorA ";
            sql2+= "FROM OPENBMS.TBL_QNA_ANS AS tqa WHERE tqa.qna_seq IN (SELECT tq2.qna_seq FROM OPENBMS.TBL_QNA tq2) ";
            sql2+= "ORDER BY qna_seq ASC ";
            sql2+= "LIMIT " + paginate.limit;
        }else{
            sql2+= "SELECT tq.qna_seq, tq.acnt_seq, tq.qna_title, tq.qna_content, tq.qna_stat, tq.ins_nm, tq.ins_dttm, tq.upd_nm, tq.upd_dttm, 'Q' AS QorA ";
            sql2+= "FROM OPENBMS.TBL_QNA as tq WHERE tq.acnt_seq = " + userInfo.acnt_seq + "  ";
            sql2+= "UNION ALL ";
            sql2+= "SELECT tqa.qna_seq, (SELECT ta.acnt_seq FROM OPENBMS.TBL_ACNT AS ta WHERE ta.acnt_id = tqa.ins_nm) AS acnt_seq, tqa.ans_title AS qna_title, tqa.ans_content AS qna_content, tqa.ans_stat AS qna_stat, tqa.ins_nm, tqa.ins_dttm, tqa.upd_nm, tqa.upd_dttm, 'A' AS QorA ";
            sql2+= "FROM OPENBMS.TBL_QNA_ANS AS tqa WHERE tqa.qna_seq IN (SELECT tq2.qna_seq FROM OPENBMS.TBL_QNA tq2 WHERE tq2.acnt_seq = " + userInfo.acnt_seq + ") ";
            sql2+= "ORDER BY qna_seq ASC ";
            sql2+= "LIMIT " + paginate.limit;

        }

        let [row2] = await global.mysqlPool.query(sql2);

        for(var i =0; i < row2.length; i++){
            row2[i].ins_dttm = row2[i].ins_dttm.toFormat('YYYY-MM-DD');
            row2[i].upd_dttm = row2[i].upd_dttm.toFormat('YYYY-MM-DD');
        }

        res.render("bbs/qna",{qnaList : row2, liRow : paginate.pages[paginate.page - 1], pages : paginate.threePages});
    } catch (error) {
        
        console.log(error);
        res.render("bbs/qna",{qnaList : null, liRow : "1", pages : "1"});

    }

}

exports.getQnaView = async(req, res, next) => {

    try {
        var qna_seq = req.query.qna_seq;

        //QNA 상세조회
        let sql1 = "SELECT tq.qna_seq, tq.acnt_seq, tq.qna_title, tq.qna_content, tq.qna_stat, tq.ins_nm, tq.ins_dttm, tq.upd_nm, tq.upd_dttm, ";
            sql1+= "tqa. ans_seq, tqa.ans_title, tqa.ans_content, tqa.ans_stat, tqa.ins_nm AS ans_ins_nm, tqa.ins_dttm AS ans_ins_dttm, tqa.upd_nm AS ans_upd_nm, tqa.upd_dttm AS ans_upd_dttm ";
            sql1+= "FROM OPENBMS.TBL_QNA as tq ";
            sql1+= "LEFT JOIN OPENBMS.TBL_QNA_ANS AS tqa ";
            sql1+= "ON tq.qna_seq = tqa.qna_seq ";
            sql1+= "WHERE tq.qna_seq = " + qna_seq;

        let [row1] = await global.mysqlPool.query(sql1);

        for(var i =0; i < row1.length; i++){
            row1[i].ins_dttm = row1[i].ins_dttm.toFormat('YYYY-MM-DD');
            row1[i].upd_dttm = row1[i].upd_dttm.toFormat('YYYY-MM-DD');
            if(row1[i].ans_ins_dttm != null) row1[i].ans_ins_dttm = row1[i].ans_ins_dttm.toFormat('YYYY-MM-DD');
            if(row1[i].ans_upd_dttm != null) row1[i].ans_upd_dttm = row1[i].ans_upd_dttm.toFormat('YYYY-MM-DD');
        }

        res.render("bbs/qnaView",{qnaView : row1});
    } catch (error) {
        
        console.log(error);
        res.status(err.status || 500);
        res.render('common/error');

    }

}

exports.getQnaReg = (req, res, next) => {
    res.render("bbs/qnaReg");
}

exports.postQnaRegComplete = async(req, res, next) => {

    var today = new Date();

    let userInfo = req.session.userInfo;

    let info = {
        acnt_seq: userInfo.acnt_seq,
        qna_title: req.body.qna_title,
        qna_content: req.body.qna_content,
        qna_stat: req.body.qna_stat,
        ins_nm: userInfo.acnt_id,
        ins_dttm: today,
        upd_nm: userInfo.acnt_id,
        upd_dttm: today
    }

    var msg = "";
    var url = "/bbs/qna";
    var status ="SUCCESS";

    try {

        let sql = "INSERT INTO OPENBMS.TBL_QNA SET ? ";

        await global.mysqlPool.query(sql,info);

        msg="QNA 등록 성공";
        
    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}

exports.postQnaModComplete = async(req, res, next) => {

    var today = new Date();

    let userInfo = req.session.userInfo;

    let info = {
        acnt_seq: userInfo.acnt_seq,
        qna_title: req.body.qna_title_mod,
        qna_content: req.body.qna_content_mod,
        qna_stat: req.body.qna_stat_mod,
        upd_nm: userInfo.acnt_id,
        upd_dttm: today
    }

    var msg = "";
    var url = "/bbs/qna/view?qna_seq=" + req.body.qna_seq;
    var status ="SUCCESS";

    try {

        let sql = "UPDATE OPENBMS.TBL_QNA SET ? WHERE qna_seq = " + req.body.qna_seq;

        await global.mysqlPool.query(sql,info);

        msg="QNA 수정 성공";
        
    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}

exports.postQnaDeleteComplete = async(req, res, next) => {

    var today = new Date();

    let userInfo = req.session.userInfo;

    var msg = "";
    var url = "/bbs/qna";
    var status ="SUCCESS";

    try {

        let sql = "DELETE FROM OPENBMS.TBL_QNA_ANS WHERE ans_seq = '" + req.body.qna_ans_seq + "'; ";
            sql+= "DELETE FROM OPENBMS.TBL_QNA WHERE qna_seq = '" + req.body.qna_seq + "'; ";
        await global.mysqlPool.query(sql);

        msg="QNA 삭제 성공";
        
    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}

exports.postQnaAnsRegComplete = async(req, res, next) => {

    var today = new Date();

    let userInfo = req.session.userInfo;

    let info = {
        qna_seq: req.body.qna_seq,
        ans_title: req.body.qna_ans_title,
        ans_content: req.body.qna_ans_content,
        ans_stat: req.body.qna_ans_stat,
        ins_nm: userInfo.acnt_id,
        ins_dttm: today,
        upd_nm: userInfo.acnt_id,
        upd_dttm: today
    }

    var msg = "";
    var url = "/bbs/qna/view?qna_seq=" + req.body.qna_seq;
    var status ="SUCCESS";

    try {

        let sql = "INSERT INTO OPENBMS.TBL_QNA_ANS SET ? ";

        await global.mysqlPool.query(sql,info);

        msg="QNA 답변 등록 성공";
        
    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}

exports.postQnaAnsModComplete = async(req, res, next) => {

    var today = new Date();

    let userInfo = req.session.userInfo;

    let info = {
        ans_title: req.body.qna_ans_title_mod,
        ans_content: req.body.qna_ans_content_mod,
        ans_stat: req.body.qna_ans_stat_mod,
        upd_nm: userInfo.acnt_id,
        upd_dttm: today
    }

    var msg = "";
    var url = "/bbs/qna/view?qna_seq=" + req.body.qna_seq;
    var status ="SUCCESS";

    try {

        let sql = "UPDATE OPENBMS.TBL_QNA_ANS SET ? WHERE ans_seq = '" + req.body.qna_ans_seq + "'";

        await global.mysqlPool.query(sql,info);

        msg="QNA 답변 수정 성공";
        
    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}

exports.postQnaAnsDeleteComplete = async(req, res, next) => {

    var today = new Date();

    let userInfo = req.session.userInfo;

    var msg = "";
    var url = "/bbs/qna/view?qna_seq=" + req.body.qna_seq;
    var status ="SUCCESS";

    try {

        let sql = "DELETE FROM OPENBMS.TBL_QNA_ANS WHERE ans_seq = '" + req.body.qna_ans_seq + "'";

        await global.mysqlPool.query(sql);

        msg="QNA 답변 삭제 성공";
        
    } catch (error) {
        msg = "서버 오류 발생";
        status = "FAIL";
        console.log(error.toString());
        
    } finally{

        res.send({msg: msg, url: url, status: status});

    }
}

exports.getPricing = (req, res, next) => {
    res.render("bbs/pricing");
}