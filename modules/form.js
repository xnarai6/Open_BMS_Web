
module.exports = {
    result2: createResult,
    result: makeForm
}


function createResult(method, url, stat, msg, console) {

    if(console) console.log(stat + " | " + msg);
    
    if(method == "GET") return "<link href='/assets/css/bootstrap-dark.min.css' id='bootstrap-style' rel='stylesheet' type='text/css' /><link href='/assets/css/icons.min.css' rel='stylesheet' type='text/css' /><link href='/assets/css/app-dark.min.css' id='app-style' rel='stylesheet' type='text/css' /><link href='/assets/libs/sweetalert2/sweetalert2.min.css' rel='stylesheet' type='text/css'><script src='/assets/libs/jquery/jquery.min.js'></script><script src='/assets/libs/bootstrap/js/bootstrap.bundle.min.js'></script><script src='/assets/libs/sweetalert2/sweetalert2.min.js'></script><script src='/assets/js/pages/sweet-alerts.init.js'></script><script src='/assets/js/app.js'></script><script src='/attach/js/common.js'></script><script type='text/javascript'>$(document).ready(function() {swalWithBootstrapButtons.fire(makeAlertObj('warning','" + msg + "')).then((warningResult) => {window.location.replace('" + url + "');});});</script>";
    if(method == "POST") return {
        status: stat,
        message: msg,
        url: url
    }

    return undefined;
}

function makeForm(res, method, status, code, msg, data, path) {
    if (method == 'GET' && status == 'SUCCESSS') res.render(path, data);
    if (method == 'GET' && status == 'FAIL') res.render('error/error', { msg: msg, path: path });
    if (method == 'POST') res.send({ status: status, code: code, msg: msg, data: data, path: path });
}