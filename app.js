const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs');
const session = require('express-session');
const mysql2 = require('mysql2');
const morgan = require('morgan');
const app = express();

// disable x-powered-by
app.disable('x-powered-by');

// favicon
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.set('view engine', 'ejs');

// log setup
morgan.token('ko-time', () => new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'}));
app.use(logger([':method', ':url', ':status', ':remote-addr', ':ko-time'].join('\t| '), {
    skip: (req, res) => {
        if(req.url.includes('/assets/') || req.url.includes('/attach/')) return true;
        // if(req.url.match(/[.]+(css|js|map|jpg|png|ico|css|woff|woff2|eot|svg)+$/g)) return true;
        return false;
    }
}));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session setup
app.use(session({
	secret: 'd7GxT8AAD535VadMsBZpJLeh',
	resave: false,
	saveUninitialized: true
}));

// mysql2 config
let dbInfo = require(path.join(__dirname, 'config/database.js'));
if (fs.existsSync(path.join(__dirname, 'bin/env'))) dbInfo = require(path.join(__dirname, 'bin/env')).dbInfo;
global.mysqlPool = mysql2.createPool(dbInfo).promise();

// root directory
global.appRoot = path.resolve(__dirname);

// user session setting
app.use((req, res, next) => {
    res.locals.userInfo = req.session.userInfo;
    next();
});

app.use('/', require(path.join(__dirname, 'routes/index.js')));
app.use('/account', require(path.join(__dirname, 'routes/account/router.js')));

app.use('/golf', require(path.join(__dirname, 'routes/golf/router.js')));

//스마트폴 임시 추가
app.use('/smartpole', require(path.join(__dirname, 'routes/smartpole/router.js')));

app.use('/production', require(path.join(__dirname, 'routes/production/router.js')));

app.use('/operation', require(path.join(__dirname, 'routes/operation/router.js')));

app.use('/system', require(path.join(__dirname, 'routes/system/router.js')));

app.use(function(req, res, next) {
    require(path.join(__dirname, 'routes/common/prevCheck.js')).checkUserSessionNo(req, res, next);
});

app.use('/main', require(path.join(__dirname, 'routes/main/router.js')));
app.use('/dashboard', require(path.join(__dirname, 'routes/dashboard/router.js')));
app.use('/report', require(path.join(__dirname, 'routes/report/router.js')));
app.use('/log', require(path.join(__dirname, 'routes/log/router.js')));
app.use('/analytics', require(path.join(__dirname, 'routes/analytics/router.js')));
app.use('/asset', require(path.join(__dirname, 'routes/asset/router.js')));
app.use('/setting', require(path.join(__dirname, 'routes/setting/router.js')));
app.use('/bbs', require(path.join(__dirname, 'routes/bbs/router.js')));
app.use('/common', require(path.join(__dirname, 'routes/common/router.js')));
app.use('/ccms', require(path.join(__dirname, 'routes/ccms/router.js')));
app.use('/layout', require(path.join(__dirname, 'routes/layout/router.js')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    if (err.status == 404) {
        res.status(err.status || 404);
        res.render('error/page404');
    } else if (err.status == 500) {
        res.status(err.status || 500);
        res.render('error/page500');
    } else {
        // render the error page
        res.status(err.status || 500);
        res.render('common/error');
    }
});

module.exports = app;
