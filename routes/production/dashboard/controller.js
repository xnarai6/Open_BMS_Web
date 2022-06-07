const https = require('https');
const axios = require('axios');
const path = require("path");
const { max } = require('moment');
const common = require('../common/common');
const Pagination = require(path.join(global.appRoot,"/modules/pagination.js"));
const viewName = 'production/dashboard/';


exports.getDashboard =async(req, res, next) => {
    console.log("start getDashboard in Production");

    try{

    sess = req.session;
    var acnt_seq = sess.acnt_seq;
    var cmpy_seq = sess.userInfo.cmpy_seq;
    
    // 로그인 확인
    if(acnt_seq < 0 || acnt_seq == null || acnt_seq == undefined){
        res.redirect('/account/login');
    }
    
    var now = new Date();
    var yesterday = new Date(now.setDate(now.getDate()-1)).toFormat("YYYYMMDD");

    let query1 = "SELECT tc.cd as btry_type_cd, tc.cd_desc as btry_type,NULL AS btry_charging, ";
        query1+= "NULL AS btry_discharging, ";
        query1+= "NULL AS btry_waiting, ";   
        query1+= "NULL AS btry_total ";  
        query1+= "FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'btry_ty'";

    let [row1] = await global.mysqlPool.query(query1);
        
    let row2 = await common.getBtryGroupByCmpy(cmpy_seq);

    res.render(viewName+"dashboard", {btry_ty_list : row1, cmpy_list : row2});

}catch (error) {
    console.log(error);
}
    
}

exports.postBtryListByBtryType = async(req, res, next) => {
    console.log("start postBtryListByBtryType in Production");
    try {

        var btry_type = req.body.btry_type;
        sess = req.session;
        var cmpy_seq = sess.userInfo.cmpy_seq;

        let query1 = "SELECT tc.cd as btry_type_cd, tc.cd_desc as btry_type,'0' AS btry_charging, ";
        query1+= "0 AS btry_discharging, ";
        query1+= "0 AS btry_waiting, ";   
        query1+= "0 AS btry_total ";  
        query1+= "FROM OPENBMS.TBL_CD tc WHERE tc.gp_cd = 'btry_ty' ";
        if(btry_type != null && btry_type != 'all' && btry_type != ''){
            query1+= "AND tc.cd = '" + btry_type + "' ";
        }

        let [row1] = await global.mysqlPool.query(query1);

        let row2 = await common.getBtryStatusByBtryType(cmpy_seq,btry_type);

        //if(row2.length <= 0) res.send({btry_list_by_btry_type : null});

        var btry_list_by_btry_type = new Array();
        btry_list_by_btry_type = row1.slice();

        //배터리 상태에 따라서 수 계산
        for(var i in row2){
            for(var j in btry_list_by_btry_type){
                if(btry_list_by_btry_type[j].btry_type_cd == row2[i].btry_ty){
                    if(row2[i].btry_stat == "C"){
                        btry_list_by_btry_type[j].btry_charging +=1;
                    }else if(row2[i].btry_stat == "DC"){
                        btry_list_by_btry_type[j].btry_discharging +=1;
                    }else if(row2[i].btry_stat == "W"){
                        btry_list_by_btry_type[j].btry_waiting +=1;
                    }else{
                        btry_list_by_btry_type[j].btry_waiting +=1;
                    }
                }
            }
        }

        //각 row별 합계 구하기
        for(var i =0; i < btry_list_by_btry_type.length; i++){
            btry_list_by_btry_type[i].btry_total = parseInt(btry_list_by_btry_type[i].btry_charging) + parseInt(btry_list_by_btry_type[i].btry_discharging) + parseInt(btry_list_by_btry_type[i].btry_waiting);

            if(btry_list_by_btry_type[i].btry_total == null || btry_list_by_btry_type[i].btry_total == ""){
                //해당 배터리 종류에 배터리가 존재하지 않을 경우 array에서 삭제
                btry_list_by_btry_type.splice(i,1);
                i = i - 1;
                //btry_list_by_btry_type[i].btry_total = 0 ;
            }
        }
        res.send({btry_list_by_btry_type : btry_list_by_btry_type});

    } catch (error) {
        console.log(error);
        res.send({btry_list_by_btry_type : null});
    }
}

exports.postBtryListByBtryCmpy = async(req, res, next) => {
    console.log("start postBtryListByBtryCmpy in Production");
    try {

        var cmpy_seq = req.body.cmpy_seq;
        var btry_seq_group = req.body.btry_seq_group;
        sess = req.session;

        let query1 = "SELECT tc.cmpy_seq,tc.cmpy_nm, 0 AS btry_charging, ";
        query1+= "0 AS btry_discharging, ";
        query1+= "0 AS btry_waiting, ";   
        query1+= "0 AS btry_total ";  
        query1+= "FROM OPENBMS.TBL_CMPY tc ";
        query1+= "WHERE tc.cmpy_seq IN (" + cmpy_seq + ") ";


        let [row1] = await global.mysqlPool.query(query1);

        let row2 = await common.getBtryStatusByCmpy(cmpy_seq,btry_seq_group);

        //if(row2.length <= 0) res.send({btry_list_by_btry_cmpy : null});

        var btry_list_by_btry_cmpy = new Array();
        btry_list_by_btry_cmpy = row1.slice();

        //배터리 상태에 따라서 수 계산
        for(var i in row2){
            for(var j in btry_list_by_btry_cmpy){
                if(btry_list_by_btry_cmpy[j].cmpy_nm == row2[i].cmpy_nm){
                    if(row2[i].btry_stat == "C"){
                        btry_list_by_btry_cmpy[j].btry_charging += 1;
                    }else if(row2[i].btry_stat == "DC"){
                        btry_list_by_btry_cmpy[j].btry_discharging += 1;
                    }else if(row2[i].btry_stat == "W"){
                        btry_list_by_btry_cmpy[j].btry_waiting += 1;
                    }else{
                        btry_list_by_btry_cmpy[j].btry_waiting += 1;
                    }
                }
            }
        }

        //각 row별 합계 구하기
        for(var i in btry_list_by_btry_cmpy){
            btry_list_by_btry_cmpy[i].btry_total = parseInt(btry_list_by_btry_cmpy[i].btry_charging) + parseInt(btry_list_by_btry_cmpy[i].btry_discharging) + parseInt(btry_list_by_btry_cmpy[i].btry_waiting);

            if(btry_list_by_btry_cmpy[i].btry_total == null || btry_list_by_btry_cmpy[i].btry_total == ""){
                btry_list_by_btry_cmpy[i].btry_total = 0 ;
            }
        }

        res.send({btry_list_by_btry_cmpy : btry_list_by_btry_cmpy});

    } catch (error) {
        console.log(error);
        res.send({btry_list_by_btry_cmpy : null});
    }
}

exports.postAlarmHstyList = async(req, res, next) => {
    console.log("start postAlarmHstyList in Production");
    try {
        var currentPage = req.body.page;
        if (currentPage == null || currentPage == '') {
            currentPage = 1;
        }

        var cmpy_seq = req.session.userInfo.cmpy_seq;
        let rows = await common.getBtryGroupByCmpy(cmpy_seq);
        var all_cmpy_seq = "-1";

        for(var i in rows){
            if(rows[i].cmpy_nm == "전체"){
                all_cmpy_seq = rows[i].cmpy_seq;
                break;
            }
        }

        let query = "SELECT COUNT(*) as total_count FROM ( ";
            query+= "SELECT tb.btry_nm, tc.cmpy_nm, tah.alm_hsty_seq, tah.alm_set_nm, tah.alm_hsty_comment, ";
            query+= "DATE_FORMAT(tah.alm_hsty_dttm,'%Y-%m-%d') AS alm_hsty_date, DATE_FORMAT(tah.alm_hsty_dttm,'%H:%i:%s') AS alm_hsty_time ";
            query+= "FROM TBL_ALM_HSTY tah ";
            query+= "LEFT JOIN TBL_CMPY tc ON tc.cmpy_seq = tah.cmpy_seq ";
            query+= "LEFT JOIN TBL_BTRY tb ON tb.btry_seq = tah.btry_seq ";
            query+= "LEFT JOIN TBL_ALM_SET tas ON tas.alm_set_seq = tah.alm_set_seq ";
            query+= "WHERE tah.cmpy_seq IN (" + all_cmpy_seq + ") ";
            query+= "ORDER BY tah.alm_hsty_dttm DESC";
            query+=") as main";

        let [row1] = await global.mysqlPool.query(query);

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 5);
        paginate.getPages(5);

        let query2= "SELECT tb.btry_nm, tc.cmpy_nm, tah.alm_hsty_seq, tah.alm_set_nm, tah.alm_hsty_comment, ";
            query2+= "DATE_FORMAT(tah.alm_hsty_dttm,'%Y-%m-%d') AS alm_hsty_date, DATE_FORMAT(tah.alm_hsty_dttm,'%H:%i:%s') AS alm_hsty_time ";
            query2+= "FROM TBL_ALM_HSTY tah ";
            query2+= "LEFT JOIN TBL_CMPY tc ON tc.cmpy_seq = tah.cmpy_seq ";
            query2+= "LEFT JOIN TBL_BTRY tb ON tb.btry_seq = tah.btry_seq ";
            query2+= "LEFT JOIN TBL_ALM_SET tas ON tas.alm_set_seq = tah.alm_set_seq ";
            query2+= "WHERE tah.cmpy_seq IN (" + all_cmpy_seq + ") ";
            query2+= "ORDER BY tah.alm_hsty_dttm DESC ";
            query2 += "LIMIT " + paginate.limit;

        let [row2] = await global.mysqlPool.query(query2);

        res.send({hstryList: row2, liRow: paginate.pages[paginate.page - 1], pages: paginate.threePages });

    } catch (error) {
        console.log(error);
    }
}