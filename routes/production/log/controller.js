const path = require('path');
const moment = require('moment');
const form = require(path.join(global.appRoot, '/modules/form.js'));
const code = require(path.join(global.appRoot, '/routes/layout/code.js'));
const common = require('../common/common');
const Pagination = require(path.join(global.appRoot,"/modules/pagination.js"));
const utiljs = require(path.join(global.appRoot,"/modules/util.js"));
const viewName = 'production/log/';
require("date-utils");

//사용자 로그 페이지로 이동
exports.getUser = async(req, res, next) => {
    console.log("start getUser");
    try {
        res.render(viewName+"user");
    } catch (error) {
        console.log(error);
    }

}

exports.postAcntLogList =async(req, res, next) => {
    console.log("start postAcntLogList");

    try {
        var currentPage = req.body.page;
        if (currentPage == null || currentPage == '') {
            currentPage = 1;
        }
        var userInfo = req.session.userInfo;
        var cmpy_seq = req.body.cmpy_seq;
        var acnt_id = req.body.acnt_id;
        var acnt_nm = req.body.acnt_nm;
        var start_date = req.body.start_date;
        var end_date = req.body.end_date;

        let query = "SELECT COUNT(*) as total_count FROM ( ";
            query+= "SELECT tal.acnt_log_seq, tal.acnt_id, tal.acnt_nm, tc.cmpy_nm, tCode.cd_desc as acnt_log_type, ";
            query+= "DATE_FORMAT(tal.login_dttm,'%Y-%m-%d %H:%i:%s') as login_dttm, tal.login_ip, tal.log_content, ";
            query+= "tal.ins_nm, tal.ins_dttm, tal.upd_nm, tal.upd_dttm ";
            query+= "FROM OPENBMS.TBL_ACNT_LOG tal ";
            query+= "LEFT JOIN OPENBMS.TBL_CMPY tc ON tc.cmpy_seq = tal.cmpy_seq ";
            query+= "LEFT JOIN OPENBMS.TBL_CD tCode ON tCode.gp_cd = 'acnt_log_type' AND tCode.cd = tal.acnt_log_type_cd ";
            query+= "WHERE tal.acnt_id LIKE '%" + acnt_id + "%' ";
            query+= "AND tal.acnt_nm LIKE '%" + acnt_nm + "%' ";
            query+= "AND tal.cmpy_seq IN (" + userInfo.cmpy_seq + ") ";
            query+= "AND DATE_FORMAT(tal.login_dttm,'%Y%m%d') >= " + start_date +  " ";
            query+= "AND DATE_FORMAT(tal.login_dttm,'%Y%m%d') <= " + end_date +  " ";
            query+=") as main";

        let [row1] = await global.mysqlPool.query(query);


        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 5);
        paginate.getPages(5);


        let query2 = "SELECT tal.acnt_log_seq, tal.acnt_id, tal.acnt_nm, tc.cmpy_nm, tCode.cd_desc as acnt_log_type, ";
            query2+= "DATE_FORMAT(tal.login_dttm,'%Y-%m-%d %H:%i:%s') as login_dttm, tal.login_ip, tal.log_content, ";
            query2+= "tal.ins_nm, tal.ins_dttm, tal.upd_nm, tal.upd_dttm ";
            query2+= "FROM OPENBMS.TBL_ACNT_LOG tal ";
            query2+= "LEFT JOIN OPENBMS.TBL_CMPY tc ON tc.cmpy_seq = tal.cmpy_seq ";
            query2+= "LEFT JOIN OPENBMS.TBL_CD tCode ON tCode.gp_cd = 'acnt_log_type' AND tCode.cd = tal.acnt_log_type_cd ";
            query2+= "WHERE tal.acnt_id LIKE '%" + acnt_id + "%' ";
            query2+= "AND tal.acnt_nm LIKE '%" + acnt_nm + "%' ";
            query2+= "AND tal.cmpy_seq IN (" + userInfo.cmpy_seq + ") ";
            query2+= "AND DATE_FORMAT(tal.login_dttm,'%Y%m%d') >= " + start_date +  " ";
            query2+= "AND DATE_FORMAT(tal.login_dttm,'%Y%m%d') <= " + end_date +  " ";
            query2+= "ORDER BY tal.login_dttm DESC ";
            query2 += "LIMIT " + paginate.limit;

        let [row2] = await global.mysqlPool.query(query2);

        res.send({logList: row2, liRow: paginate.pages[paginate.page - 1], pages: paginate.threePages });

    } catch (error) {
        console.log(error);
    }

}

//알람 로그 페이지로 이동
exports.getAlarm = async(req, res, next) => {
    console.log("start getAlarm");
    try {
        res.render(viewName+"alarm");
    } catch (error) {
        console.log(error);
    }

}

exports.postAlarmLogList =async(req, res, next) => {
    console.log("start postAlarmLogList");

    try {
        var currentPage = req.body.page;
        if (currentPage == null || currentPage == '') {
            currentPage = 1;
        }
        var cmpy_seq = req.body.cmpy_seq;
        var start_date = req.body.start_date;
        var end_date = req.body.end_date;

        let query = "SELECT COUNT(*) as total_count FROM ( ";
            query+= "SELECT tc.cmpy_nm, tb.btry_nm, ta.acnt_id, tas.alm_set_nm, tal.alm_set_code, tal.alm_set_comment, ";
            query+= "DATE_FORMAT(tal.alm_log_dttm,'%Y-%m-%d %H:%i:%s') AS alm_log_dttm ";
            query+= "FROM OPENBMS.TBL_ALM_LOG tal ";
            query+= "LEFT JOIN OPENBMS.TBL_ACNT ta ON ta.acnt_seq = tal.alm_log_acnt_seq ";
            query+= "LEFT JOIN OPENBMS.TBL_CMPY tc ON tc.cmpy_seq = tal.cmpy_seq ";
            query+= "LEFT JOIN OPENBMS.TBL_BTRY tb ON tb.btry_seq = tal.btry_seq ";
            query+= "LEFT JOIN OPENBMS.TBL_ALM_SET tas ON tas.alm_set_seq = tal.alm_set_seq ";
            query+= "WHERE tal.cmpy_seq IN (" + cmpy_seq + ") ";
            query+= "AND DATE_FORMAT(tal.alm_log_dttm,'%Y%m%d') >= " + start_date + " ";
            query+= "AND DATE_FORMAT(tal.alm_log_dttm,'%Y%m%d') <= " + end_date + " ";
            query+=") as main";

        let [row1] = await global.mysqlPool.query(query);


        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 5);
        paginate.getPages(5);


        let query2 = "SELECT tc.cmpy_nm, tb.btry_nm, ta.acnt_id, tas.alm_set_nm, tal.alm_set_code, tal.alm_set_comment, ";
            query2+= "DATE_FORMAT(tal.alm_log_dttm,'%Y-%m-%d %H:%i:%s') AS alm_log_dttm ";
            query2+= "FROM OPENBMS.TBL_ALM_LOG tal ";
            query2+= "LEFT JOIN OPENBMS.TBL_ACNT ta ON ta.acnt_seq = tal.alm_log_acnt_seq ";
            query2+= "LEFT JOIN OPENBMS.TBL_CMPY tc ON tc.cmpy_seq = tal.cmpy_seq ";
            query2+= "LEFT JOIN OPENBMS.TBL_BTRY tb ON tb.btry_seq = tal.btry_seq ";
            query2+= "LEFT JOIN OPENBMS.TBL_ALM_SET tas ON tas.alm_set_seq = tal.alm_set_seq ";
            query2+= "WHERE tal.cmpy_seq IN (" + cmpy_seq + ") ";
            query2+= "AND DATE_FORMAT(tal.alm_log_dttm,'%Y%m%d') >= " + start_date + " ";
            query2+= "AND DATE_FORMAT(tal.alm_log_dttm,'%Y%m%d') <= " + end_date + " ";
            query2+= "ORDER BY tal.alm_log_dttm DESC ";
            query2+= "LIMIT " + paginate.limit;

        let [row2] = await global.mysqlPool.query(query2);

        res.send({logList: row2, liRow: paginate.pages[paginate.page - 1], pages: paginate.threePages,query2 : query2 });

    } catch (error) {
        console.log(error);
    }

}

/*로그인한 제조업체 사용자의 제조업체 회사가 제조한 배터리를 사용하는 수요업체 리스트 */
exports.postOperCmpyList = async(req, res, next) => {
    console.log("postOperCmpyList start");
    var userInfo = req.session.userInfo;

    let cmpyList = await common.getBtryGroupByCmpy(userInfo.cmpy_seq);


    res.send({cmpy_list : cmpyList});

}