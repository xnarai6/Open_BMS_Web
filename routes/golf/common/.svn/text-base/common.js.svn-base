
// 코드 그룹 array로 코드 정보 가져오기
exports.getCodeList = async (gpArray) => {
    let query = 'SELECT tcd.gp_cd, tcd.gp_cd_desc, tcd.cd, tcd.cd_desc';
        query += ' FROM OPENBMS.TBL_CD tcd';
        query += ' WHERE tcd.gp_cd IN ("' + gpArray.join('","') + '")';
        query += ' ORDER BY tcd.gp_cd, tcd.cd';

    let queryResult, rows = [];
    try {
        queryResult = await global.mysqlPool.query(query);
    } catch (error) {
        console.log({code: '[query select error]', message: ' code query error'});
        console.log(error);

        return rows;
    }
    if (queryResult == null || queryResult[0].length == 0) {
        console.log({code: '[query result error]', message: ' code empty'});

        return rows;
    }
    rows = queryResult[0];

    return rows;
}

// 본인 회사에 설치된 배터리 그룹
exports.getBtryGroupByMyCmpy = async (cmpy_seq) => {

    let query = "SELECT a.*, tc.cmpy_nm ";
        query+= "FROM ( ";
        query+= "   SELECT mcb1.cmpy_seq, COUNT(*) AS cnt, GROUP_CONCAT(CAST(mcb1.btry_seq AS CHAR(10))) AS btry_seq_group ";
        query+= "   FROM OPENBMS.MPP_CMPY_BTRY mcb1 ";
        query+= "   WHERE mcb1.cmpy_seq = " + cmpy_seq +" ";
        query+= "   AND mcb1.btry_seq IN ( ";
        query+= "      SELECT mcb2.btry_seq ";
        query+= "      FROM OPENBMS.MPP_CMPY_BTRY mcb2 ";
        query+= "      WHERE mcb2.cmpy_seq = " + cmpy_seq + " ";
        query+= "   ) ";
        query+= "   GROUP BY mcb1.cmpy_seq ";
        query+= ") a ";
        query+= "LEFT OUTER JOIN OPENBMS.TBL_CMPY tc ";
        query+= "ON a.cmpy_seq = tc.cmpy_seq ";

    let queryResult, rows = [];
    try {
        queryResult = await global.mysqlPool.query(query);
    } catch (error) {
        console.log({code: '[query select error]', message: ' cc query error'});
        console.log(error);

        return rows;
    }
    if (queryResult == null || queryResult[0].length == 0) {
        console.log({code: '[query result error]', message: ' cc empty'});

        return rows;
    }
    rows = queryResult[0];

    return rows;
}
