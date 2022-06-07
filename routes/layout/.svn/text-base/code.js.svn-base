// 코드 그룹 array로 코드 정보 가져오기
exports.getCodeMap = async (gpArray) => {
    let query = 'SELECT tcd.gp_cd, tcd.gp_cd_desc, tcd.cd, tcd.cd_desc';
        query += ' FROM OPENBMS.TBL_CD tcd';
        query += ' WHERE tcd.gp_cd IN ("' + gpArray.join('","') + '")';
        query += ' ORDER BY tcd.gp_cd ASC, tcd.cd_ordr ASC';

    let queryResult, rows = [], result = {};
    try {
        queryResult = await global.mysqlPool.query(query);
    } catch (error) {
        console.log({code: '[query select error]', message: ' code query error'});
        console.log(error);

        return result;
    }
    if (queryResult == null || queryResult[0].length == 0) {
        console.log({code: '[query result error]', message: ' code empty'});

        return result;
    }
    rows = queryResult[0];

    rows.map(e => {
        if (!result[e.gp_cd]) result[e.gp_cd] = {};
        result[e.gp_cd][e.cd] = e.cd_desc;
    });

    return result;
}

exports.getCodeResult = (codeMap, gp, cd) => {
    return codeMap[gp] && codeMap[gp][cd] ? codeMap[gp][cd] : null;
}