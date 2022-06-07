// const asyncWrapper = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next());
// const form = require('../../config/form.js');
const path = require('path');
const form = require(path.join(global.appRoot, '/modules/form.js'));
const mapper = require(path.join(global.appRoot, '/routes/smartpole/common/dashboard.js'));

const viewName = 'smartpole/dashboard/';

exports.getDashboard = async (req, res, next) => {
    res.render(viewName + 'dashboard');
}

exports.postInfo = async (req, res, next) => {
    // 0. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 0. 회원번호 / 회사번호 가져오기
    let acntSeq = userInfo.acnt_seq, cmpySeq = userInfo.cmpy_seq;

    // 1. 골프장 정보 가져오기
    let ccInfo = await mapper.getCCInfo(cmpySeq);
    if (!ccInfo) return form.result(res, req.method, 'FAIL', null, '골프장 정보가 없습니다', null, '/');

    // 2. 코스 리스트 가져오기
    let corsList = await mapper.getCorsList(ccInfo);

    // 3. 홀 리스트 가져오기
    let holeList = await mapper.getHoleList(corsList);

    // 4. 홀 위치 리스트 가져오기
    let holeLocList = await mapper.getHoleLocList(holeList);

    let resultData = {
        ccInfo: ccInfo,
        corsList: corsList,
        holeList: holeList,
        holeLocList: holeLocList
    }

    return form.result(res, req.method, 'SUCCESS', null, '성공', resultData, null);
}

exports.postInfoCart = async (req, res, next) => {
    // 0. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 0. 회원번호 / 회사번호 가져오기
    let acntSeq = userInfo.acnt_seq, cmpySeq = userInfo.cmpy_seq;

    // 1. 카트 리스트 가져오기
    let cartList = await mapper.getCartList(cmpySeq);

    // 2. 배터리 리스트 가져오기
    let btryList = await mapper.getBtryList(cartList);

    // 3. 카트 배터리 연결 리스트 생성
    let btryObject = {}
    btryList.map(e => btryObject[e.cart_seq] = { btry_seq: e.btry_seq, lat: e.lat, lon: e.lon, soc: e.soc, btry_stat: e.btry_mng_stat });

    let cartBtryList = cartList.map(e => Object.assign(btryObject[e.cart_seq], { cart_seq: e.cart_seq, name: e.cart_nm, cart_stat: e.cart_stat }));

    return form.result(res, req.method, 'SUCCESS', null, '성공', { cartBtryList: cartBtryList }, null);
}