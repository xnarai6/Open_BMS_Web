const https = require('https');
const path = require("path");
const Pagination = require(path.join(global.appRoot,"/modules/pagination.js"));
const encryption = require(path.join(global.appRoot,"/modules/encryption.js"));
const utiljs = require(path.join(global.appRoot,"/modules/util.js"));
const viewName = 'operation/dashboard/';

exports.getDashboard =async(req, res, next) => {
    
}