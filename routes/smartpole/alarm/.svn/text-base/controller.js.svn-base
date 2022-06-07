const path = require('path');
const moment = require('moment');
const form = require(path.join(global.appRoot, '/modules/form.js'));
const code = require(path.join(global.appRoot, '/routes/layout/code.js'));
const Pagination = require(path.join(global.appRoot,"/modules/pagination.js"));
const utiljs = require(path.join(global.appRoot,"/modules/util.js"));
const viewName = 'smartpole/alarm/alarm';
require("date-utils");

exports.getAlarm = async(req, res, next) => {

    console.log("start getAlarm");

    var cmpy_seq = req.session.userInfo.cmpy_seq;

    let sql = "SELECT ";
        sql+= "(SELECT tc.cmpy_nm FROM TBL_CMPY tc WHERE ta.cmpy_seq = tc.cmpy_seq) AS cmpy_nm,  ";
        sql+= "ta.alm_seq, ta.alm_min_soc, ta.alm_max_soc, ta.alm_cycle, ";
        sql+= "ta.alm_alert_time, ta.alm_use_yn ";
        sql+= "FROM OPENBMS.TBL_ALM ta WHERE ta.cmpy_seq = " + cmpy_seq + " ";

    let row;

    try {
        [row] = await global.mysqlPool.query(sql);
    } catch (error) {
        console.log(error);
        return form.result(res, req.method, 'FAIL', null, '서버 오류 발생', null, '/smartpole/dashboard');
    }

    if(row[0].alm_alert_time!=null && row[0].alm_alert_time !=''){

        var jsonTimeData = JSON.parse(row[0].alm_alert_time);

        if(jsonTimeData == null){
            row[0].start_time1 = null;
            row[0].end_time1 = null;
            row[0].time_on_off1 = "N";
            row[0].start_time2 = null;
            row[0].end_time2 = null;
            row[0].time_on_off2 = "N";
            row[0].start_time3 = null;
            row[0].end_time3 = null;
            row[0].time_on_off3 = "N";
            row[0].start_time4 = null;
            row[0].end_time4 = null;
            row[0].time_on_off4 = "N";
        }else{
            row[0].start_time1 = jsonTimeData.start_time1;
            row[0].end_time1 = jsonTimeData.end_time1;
            row[0].time_on_off1 = jsonTimeData.time_on_off1;
            row[0].start_time2 = jsonTimeData.start_time2;
            row[0].end_time2 = jsonTimeData.end_time2;
            row[0].time_on_off2 = jsonTimeData.time_on_off2;
            row[0].start_time3 = jsonTimeData.start_time3;
            row[0].end_time3 = jsonTimeData.end_time3;
            row[0].time_on_off3 = jsonTimeData.time_on_off3;
            row[0].start_time4 = jsonTimeData.start_time4;
            row[0].end_time4 = jsonTimeData.end_time4;
            row[0].time_on_off4 = jsonTimeData.time_on_off4;
        }   
    }else{
        row[0].start_time1 = null;
        row[0].end_time1 = null;
        row[0].time_on_off1 = "N";
        row[0].start_time2 = null;
        row[0].end_time2 = null;
        row[0].time_on_off2 = "N";
        row[0].start_time3 = null;
        row[0].end_time3 = null;
        row[0].time_on_off3 = "N";
        row[0].start_time4 = null;
        row[0].end_time4 = null;
        row[0].time_on_off4 = "N";
    }

    res.render(viewName,{ALM_INFO : row});
}

exports.postSetAlarm = async(req, res, next) => {

    console.log("start postSetAlarm");

    var userInfo = req.session.userInfo;

    var alm_seq = req.body.alm_seq;
    var range_soc = req.body.range_soc;
    var alm_use_yn = req.body.alm_use_yn;
    var cycle = req.body.cycle;
    var start_time1 = req.body.start_time1;
    var end_time1 = req.body.end_time1;
    var time_on_off1 = req.body.time_on_off1;
    var start_time2 = req.body.start_time2;
    var end_time2 = req.body.end_time2;
    var time_on_off2 = req.body.time_on_off2;
    var start_time3 = req.body.start_time3;
    var end_time3 = req.body.end_time3;
    var time_on_off3 = req.body.time_on_off3;
    var start_time4 = req.body.start_time4;
    var end_time4 = req.body.end_time4;
    var time_on_off4 = req.body.time_on_off4;

    var post_time_data = new Object();

    post_time_data.start_time1 = start_time1;
    post_time_data.end_time1 = end_time1;
    post_time_data.time_on_off1 = time_on_off1;
    post_time_data.start_time2 = start_time2;
    post_time_data.end_time2 = end_time2;
    post_time_data.time_on_off2 = time_on_off2;
    post_time_data.start_time3 = start_time3;
    post_time_data.end_time3 = end_time3;
    post_time_data.time_on_off3 = time_on_off3;
    post_time_data.start_time4 = start_time4;
    post_time_data.end_time4 = end_time4;
    post_time_data.time_on_off4 = time_on_off4;

    var jsonTimeData = JSON.stringify(post_time_data);
    var range_soc_array = range_soc.split(',');
    var now = new Date();

    let updateData = {
        alm_min_soc : range_soc_array[0],
        alm_max_soc : range_soc_array[1],
        alm_use_yn : alm_use_yn,
        alm_cycle : cycle,
        alm_alert_time : jsonTimeData,
        upd_nm : userInfo.acnt_id,
        upd_dttm : now
    }

    let sql = "UPDATE OPENBMS.TBL_ALM SET ? WHERE alm_seq = " + alm_seq + " AND cmpy_seq = " + userInfo.cmpy_seq + " ";

    let resultRow;

    try {
        [resultRow] = await global.mysqlPool.query(sql,updateData);
    } catch (error) {
        console.log(error);
        return form.result(res, req.method, 'FAIL', null, '서버 오류 발생', null, '/smartpole/dashboard');
    }

    return form.result(res, req.method, 'SUCCESS', null, '알람을 설정하였습니다.', null, '/smartpole/alarm');
}

exports.sendingMailTest = async(req, res, next) => {
    console.log("start sendingMailTest");
    mail.sendEmail("leeeonho99@hivvlab.co.kr","이것은 테스트용 이메일이다.","이것은 테스트이다. 이것은 테스트 이다. 이것은 ?@#ㅛ(*#$(*)(*ㅓㅗ야ㅒㄹㅇㄹ45456955```&nbsp");
    mail.sendEmail("88gkswkehdck@naver.com","이것은 테스트용 이메일이다.","이것은 테스트이다. 이것은 테스트 이다. 이것은 ?@#ㅛ(*#$(*)(*ㅓㅗ야ㅒㄹㅇㄹ45456955```&nbsp");

}

