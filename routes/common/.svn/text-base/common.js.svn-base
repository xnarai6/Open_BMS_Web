const path = require('path');
const form = require(path.join(appRoot, 'modules/form.js'));
const utiljs = require(path.join(global.appRoot,"/modules/util.js"));

exports.readDashCard = (req, res, next) => {
    console.log("readDashCard start");  

    var _render = res.render;
    res.render = async function(view, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        } else if (!options) {
            options = {};
        }

        sess = req.session;      
        var acnt_seq = sess.acnt_seq;
        var acnt_role = sess.userInfo.acnt_role;
        var cmpy_seq = sess.userInfo.cmpy_seq;

        let selectsql1 = "";

        if(acnt_role == 'SA'){
            selectsql1 = "SELECT  tb.btry_nm, tb.btry_seq, tb.btry_max_pwr, MAX(CONCAT(tpbd.biz_dt,tpbd.biz_h,tpbd.biz_m,'00')) AS dttm, tpbd.chrg_stat_cd ";
            selectsql1 += "FROM OPENBMS.TBL_BTRY tb ";
            selectsql1 += "LEFT OUTER JOIN OPENBMS.TBL_PTC_BIZ_DATA tpbd ON tpbd.btry_seq = tb.btry_seq AND CONCAT(tpbd.biz_dt,tpbd.biz_h,tpbd.biz_m) = (SELECT MAX(CONCAT(tpbd2.biz_dt,tpbd2.biz_h,tpbd2.biz_m)) FROM OPENBMS.TBL_PTC_BIZ_DATA tpbd2) ";
            selectsql1 += "GROUP BY tb.btry_seq;";
        }else{
            selectsql1 += 'SELECT tb.btry_seq, tb.btry_nm, tb.btry_max_pwr, tbls.chrg_stat_cd, DATE_FORMAT(tbls.last_biz_dttm, "%Y%m%d%H%s%i") AS dttm';
            selectsql1 += ' FROM OPENBMS.MPP_CMPY_BTRY mcb';
            selectsql1 += ' LEFT OUTER JOIN OPENBMS.TBL_BTRY tb';
            selectsql1 += ' ON mcb.btry_seq = tb.btry_seq';
            selectsql1 += ' LEFT OUTER JOIN OPENBMS.TBL_BTRY_LAST_STAT tbls';
            selectsql1 += ' ON mcb.btry_seq = tbls.btry_seq';
            selectsql1 += ' WHERE mcb.cmpy_seq = "' + cmpy_seq + '"';
        }

        let [row1] = await global.mysqlPool.query(selectsql1);
        
        var i=0;
        var retdata = new Object();
        retdata.sum_bty_max_pwr = 0;
        retdata.btry_stat_total_cnt = 0;
        retdata.btry_stat_charge_cnt = 0;
        retdata.btry_stat_discharge_cnt = 0;
        retdata.btry_stat_block_cnt = 0;    
        var sum_bty_max_pwr = 0;
        
        retdata.acnt_seq = sess.userInfo.acnt_seq;
        retdata.acnt_id = sess.userInfo.acnt_id;
        retdata.acnt_nm = sess.userInfo.acnt_nm;
        retdata.acnt_role = sess.userInfo.acnt_role;
        
        for(var i = 0; i < row1.length; i++){
            if (row1[i].dttm != null){
                var ins = new Date(row1[i].dttm);
                var now = new Date();
    
                var diff = (now.getTime() - ins.getTime())/1000/60/60;
               // console.log(diff);
    
                //biz_data 마지막 ins_dttm이 하루 전
            //    if ( diff > 24){
             //       retdata.btry_stat_block_cnt += 1;
              //  } else {

                    if (row1[i].chrg_stat_cd == 'C'){
                        retdata.btry_stat_charge_cnt += 1;
                       // console.log("row1[i].btry_max_pwr:"+row1[i].btry_max_pwr);
                        sum_bty_max_pwr = sum_bty_max_pwr + (row1[i].btry_max_pwr* 1);
                    } else if (row1[i].chrg_stat_cd == 'DC'){
                        retdata.btry_stat_discharge_cnt += 1;
                        //console.log("row1[i].btry_max_pwr:"+row1[i].btry_max_pwr);
                        sum_bty_max_pwr = sum_bty_max_pwr + (row1[i].btry_max_pwr* 1);
                    } else {
                        retdata.btry_stat_block_cnt += 1;
                    }
             //   }
            } else {
                retdata.btry_stat_block_cnt += 1;
            }
        }

        retdata.btry_stat_total_cnt = row1.length;

        // do {
        //     console.log("row1["+i+"]:"+row1[i].sum_bty_max_pwr);
            
        //     if(row1[i].btry_stat =="C"){
        //         retdata.btry_stat_charge_cnt = row1[i].sum_btry_stat;
        //         retdata.sum_bty_max_pwr = retdata.sum_bty_max_pwr + row1[i].sum_bty_max_pwr;  
        //     }else if(row1[i].btry_stat =="D"){
        //         retdata.btry_stat_discharge_cnt = row1[i].sum_btry_stat;
        //         retdata.sum_bty_max_pwr =retdata.sum_bty_max_pwr + row1[i].sum_bty_max_pwr;   
        //     }else if(row1[i].btry_stat =="Y"){
        //         retdata.btry_stat_standby_cnt = row1[i].sum_btry_stat;
        //         retdata.sum_bty_max_pwr =retdata.sum_bty_max_pwr + row1[i].sum_bty_max_pwr;   
        //     }else if(row1[i].btry_stat =="N"){
        //         retdata.btry_stat_block_cnt = row1[i].sum_btry_stat;
        //         retdata.sum_bty_max_pwr = retdata.sum_bty_max_pwr + row1[i].sum_bty_max_pwr;   
        //     }
            
        //     i++;
        // }while (row1[i])

        var pwrAndUnit = utiljs.unitConvertWithComma(sum_bty_max_pwr);
        retdata.sum_bty_max_pwr = pwrAndUnit.power;
        retdata.sum_bty_max_pwr_unit = pwrAndUnit.unit;

        Object.assign(options, {retdata: retdata });
        _render.call(this, view, options, callback);
    }
    next();
}

exports.cartTopCard = (req, res, next) => {
    
    next();
}