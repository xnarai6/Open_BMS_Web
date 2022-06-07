const mysql2 = require('mysql2/promise');
const dbSetting = require('../config/database.js');

getPoolAsync = mysql2.createPool(dbSetting.dbGetter);
setPoolAsync = mysql2.createPool(dbSetting.dbSetter);

exports.getPoolAsync = () => getPoolAsync;
exports.setPoolAsync = () => setPoolAsync;

exports.getAsyncFunc = async(queryStr, queryVal) => {
    try {
        const connection = await getPoolAsync.getConnection(async conn => conn);
        try {
            const [rows] = await connection.query(queryStr, queryVal);
            connection.release();

            return rows;
        } catch(err) {
            console.log("getQuery Error");
            connection.release();
            throw err;
        }
    } catch(err) {
        console.log("DB Error");
        throw err;
    }
}

exports.setAsyncFunc = async(queryStr, queryVal) => {
    try {
        const connection = await setPoolAsync.getConnection(async conn => conn);
        try {
            const [rows] = await connection.query(queryStr, queryVal);
            connection.release();

            return rows;
        } catch(err) {
            console.log("setQuery Error");
            connection.release();
            throw err;
        }
    } catch(err) {
        console.log("DB Error");
        throw err;
    }
}