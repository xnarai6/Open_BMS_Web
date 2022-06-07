// const asyncWrapper = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next());
// const form = require('../../config/form.js');
const path = require('path');
const moment = require('moment');
const form = require(path.join(global.appRoot, '/modules/form.js'));
const code = require(path.join(global.appRoot, '/routes/layout/code.js'));
const mapper = require(path.join(global.appRoot, '/routes/smartpole/common/searchBattery.js'));
const common = require('../common/common.js');
const Pagination = require(path.join(global.appRoot,"/modules/pagination.js"));
const utiljs = require(path.join(global.appRoot,"/modules/util.js"));


const viewName = 'smartpole/search/';

exports.getBtry = async (req, res, next) => {
    res.render(viewName + 'battery', { stat: req.query.stt ? req.query.stt : 'all' });
}

exports.postBtryCode = async (req, res, next) => {
    let codeMap = await code.getCodeMap(['btry_stat']);
    return form.result(res, req.method, 'SUCCESS', null, null, { codeMap: codeMap }, null);
}

exports.getBtryCartList = async (req, res, next) => {
    // 1. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 2. 회사번호 가져오기
    let cmpySeq = userInfo.cmpy_seq;

    // 3. 파라미터 가져오기
    let page = Number(req.body.page);
    let param = {
        insStart: moment(req.body['insStart']), insEnd: moment(req.body['insEnd']),
        socStart: Number(req.body['socStart']), socEnd: Number(req.body['socEnd']),
        stat: req.body['stat']
    }

    // 3-1. 파라미터 체크
    if (!param['insStart'].isValid()
        || !param['insEnd'].isValid()
        || !Number.isInteger(param['socStart'])
        || !Number.isInteger(param['socEnd'])
        || !Number.isInteger(page)
    ) return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/production/dashboard');
    if (page <= 0) page = 1;

    param['insStart'] = param['insStart'].format('YYYYMMDD');
    param['insEnd'] = param['insEnd'].format('YYYYMMDD');

    // 4. 배터리 카트 리스트 가져오기
    let btryCartList = await mapper.getBtryCartList(cmpySeq, param, moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss'), page, 10);

    // 5. return
    return form.result(res, req.method, 'SUCCESS', null, '성공', { btryCartList: btryCartList }, null);
}

exports.getBtryDetail = async (req, res, next) => {
    // 0. 배터리 번호 가져오기
    let btrySeq = Number(req.params.seq);
    if (!Number.isInteger(btrySeq)) {
        return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/smartpole/search/battery');
    }

    // 0. 배터리 번호 - 세션 회사 체크하기

    res.render(viewName + 'batteryDetail', { param: btrySeq });
}

exports.postBtryDetailInfo = async (req, res, next) => {
    // 0. 배터리 번호 가져오기
    let btrySeq = Number(req.params.seq);
    if (!Number.isInteger(btrySeq)) {
        return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/smartpole/search/battery');
    }

    // 0. 배터리 번호 - 세션 회사 체크하기

    // 0. 보낸 url의 seq와 일치 확인?

    // 1. 코드 맵 가져오기
    let codeMap = await code.getCodeMap(['btry_ty', 'btry_mdl_ty', 'btry_stat']);

    // 2. 배터리 정보 가져오기
    let btryInfo = await mapper.getBtryInfo(btrySeq);
    if (!btryInfo) return form.result(res, req.method, 'FAIL', null, '해당되는 데이터가 없습니다', null, '/smartpole/search/battery');
    
    // 3. 코드 변환
    btryInfo['mdl_mftr'] = code.getCodeResult(codeMap, 'btry_mdl_ty', btryInfo['mdl_mftr_cd']);
    btryInfo['btry_ty'] = code.getCodeResult(codeMap, 'btry_ty', btryInfo['btry_ty_cd']);
    // btryInfo['chrg_stat'] = code.getCodeResult(codeMap, 'btry_stat', btryInfo['btry_stat'] == 'N' ? 'W' : btryInfo['last_stat_cd']);

    // 4. return
    return form.result(res, req.method, 'SUCCESS', null, '성공', { btryInfo: btryInfo }, null);
}

exports.getBtryDetailTest = async (req, res, next) => {
    // 0. 배터리 번호 가져오기
    let btrySeq = Number(req.params.seq), date = req.params.date;
    if (!Number.isInteger(btrySeq)) return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/smartpole/search/battery');

    res.render(viewName + 'batteryTest', { param1: btrySeq, param2: date });
}

exports.postBtryDetailTest = async (req, res, next) => {
    // 0. 배터리 번호 가져오기
    let btrySeq = Number(req.params.seq), date = req.params.date;
    if (!Number.isInteger(btrySeq)) return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/smartpole/search/battery');

    // 2. 배터리 정보 가져오기
    let btryInfo = await mapper.getTTTTTT(btrySeq, date);
    if (!btryInfo) return form.result(res, req.method, 'FAIL', null, '해당되는 데이터가 없습니다', null, '/smartpole/search/battery');
    
    return form.result(res, req.method, 'SUCCESS', null, '성공', { aaa: btryInfo }, null);
}

exports.postBtryDetailGraph = async (req, res, next) => {
    // 0. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 0. 회원번호 / 회사번호 가져오기
    let acntSeq = userInfo.acnt_seq, cmpySeq = userInfo.cmpy_seq;

    // 0. 배터리 번호 가져오기
    let btrySeq = Number(req.params.seq), dth = Number(req.params.dth);
    if (!Number.isInteger(btrySeq) || !Number.isInteger(dth)) return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/smartpole/search/battery');

    // 0. 배터리 번호 - 세션 회사 체크하기

    // 0. 보낸 url의 seq와 일치 확인?

    // 1. 오늘치 데이터 가져오기
    let btryDthList = await mapper.getBtryDthList(cmpySeq, btrySeq, dth, dth % 100);
    if (!btryDthList) return form.result(res, req.method, 'FAIL', null, '해당되는 데이터가 없습니다', null, '/smartpole/search/battery');

    return form.result(res, req.method, 'SUCCESS', null, '성공', { btryDthList: btryDthList }, null);
}

// 어제까지의 daily list 가져오기
exports.postBtryDetailDaily = async (req, res, next) => {
    // 0. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 0. 회원번호 / 회사번호 가져오기
    let acntSeq = userInfo.acnt_seq, cmpySeq = userInfo.cmpy_seq;

    // 0. 파라미터 가져오기
    let btrySeq = Number(req.params.seq), page = Number(req.body.page);
    if (!Number.isInteger(btrySeq) || !Number.isInteger(page)) return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/smartpole/search/battery');
    if (page <= 0) page = 1;

    // 0. 배터리 번호 - 세션 회사 일치 체크하기

    // 0. 보낸 url의 배터리와 일치 확인

    // 1. 어제까지의 daily 가져오기
    let dailyInfo = await mapper.getDailyList(cmpySeq, btrySeq, page, 10);
    if (!dailyInfo) return form.result(res, req.method, 'FAIL', null, '해당되는 데이터가 없습니다', null, '/smartpole/search/battery');

    return form.result(res, req.method, 'SUCCESS', null, '성공', { dailyPaging: dailyInfo.paging, dailyList: dailyInfo.rows }, null);
}

// 배터리의 간격 내역 가져오기
exports.postBtryDetailPeriod = async (req, res, next) => {
    // 0. 세션정보 가져오기
    let userInfo = req.session.userInfo;

    // 0. 회원번호 / 회사번호 가져오기
    let acntSeq = userInfo.acnt_seq, cmpySeq = userInfo.cmpy_seq;

    // 0. 파라미터 가져오기
    let btrySeq = Number(req.params.seq), dt = moment(req.params.dt), page = Number(req.body.page);
    if (!Number.isInteger(btrySeq) || !dt.isValid() || !Number.isInteger(page)) return form.result(res, req.method, 'FAIL', null, '잘못된 파라미터입니다', null, '/smartpole/search/battery');
    // if (page <= 0) page = 1;

    // 0. 배터리 번호 - 세션 회사 일치 체크하기

    // 0. 보낸 url의 배터리와 일치 확인

    // 0. dt 설정
    let nowDt = dt.format('YYYYMMDD'), nowDtm = dt.format('YYYYMMDDHHmm'), prevDt = moment(req.params.dt).subtract(1, 'days').format('YYYYMMDD'), nextDt = moment(req.params.dt).add(1, 'days').format('YYYYMMDD'), nextDtm = moment(req.params.dt).add(1, 'days').format('YYYYMMDDHHmm');
    // if (nextDt >= moment().format('YYYYMMDD')) nextDt = moment().format('YYYYMMDD');
    if (nextDtm >= moment().format('YYYYMMDDHHmm')) nextDtm = moment().format('YYYYMMDDHHmm');

    // 1. 배터리 간격 정보 가져오기
    let periodData = await mapper.getBtryPeriod(cmpySeq, btrySeq, prevDt, nowDt, nextDt);
    if (!periodData) return form.result(res, req.method, 'FAIL', null, '해당되는 데이터가 없습니다', null, '/smartpole/search/battery');

    // 2. 배터리 상태 코드 가져오기
    let codeMap = await code.getCodeMap(['btry_stat']);

    // 3. 리스트 채우기
    let resultArray = [];

    // prev 있음 AND LIST[0].start가 prev.end + 1D 보다 더 크거나 없음
    if (periodData.prev && (periodData.nowList.length <= 0 || (periodData.nowList.length > 0 && moment(periodData.prev.end_dtm, 'YYYYMMDDHHmm').add(1, 'days').format('YYYYMMDDHHmm') < periodData.nowList[0].start_dtm))) {
        // now ~ prev.end + 1D
        resultArray.push({
            type_cd: 'W',
            period_m: moment.duration(moment(periodData.prev.end_dtm, 'YYYYMMDDHHmm').add(1, 'days').diff(moment(nowDtm, 'YYYYMMDDHHmm'))).asMinutes(),
            start_dtm: nowDtm,
            end_dtm: moment(periodData.prev.end_dtm, 'YYYYMMDDHHmm').add(1, 'days').format('YYYYMMDDHHmm'),
        });

        // prev.end + 1D ~ next
        if (periodData.nowList.length <= 0) {
            resultArray.push({
                type_cd: 'I',
                period_m: moment.duration(moment(nextDtm, 'YYYYMMDDHHmm').diff(moment(periodData.prev.end_dtm, 'YYYYMMDDHHmm').add(1, 'days'))).asMinutes(),
                start_dtm: moment(periodData.prev.end_dtm, 'YYYYMMDDHHmm').add(1, 'days').format('YYYYMMDDHHmm'),
                end_dtm: nextDtm,
            });
        }

        // prev.end + 1D ~ LIST[0].start
        if (periodData.nowList.length > 0) {
            resultArray.push({
                type_cd: 'I',
                period_m: moment.duration(moment(periodData.nowList[0].start_dtm, 'YYYYMMDDHHmm').diff(moment(periodData.prev.end_dtm, 'YYYYMMDDHHmm').add(1, 'days'))).asMinutes(),
                start_dtm: moment(periodData.prev.end_dtm, 'YYYYMMDDHHmm').add(1, 'days').format('YYYYMMDDHHmm'),
                end_dtm: periodData.nowList[0].start_dtm,
                end_volt: periodData.nowList[0].start_volt, end_curr: periodData.nowList[0].start_curr, end_tp: periodData.nowList[0].start_tp, end_soc: periodData.nowList[0].start_soc,
            });
        }

        // List[0] ... ~ next
        resultArray = resultArray.concat(makePeriodList(periodData, nextDtm));
    }

    // prev 있음 AND LIST[0].start가 prev.end + 1D 보다 더 작음
    if (periodData.prev && (periodData.nowList.length > 0 && moment(periodData.prev.end_dtm, 'YYYYMMDDHHmm').add(1, 'days').format('YYYYMMDDHHmm') >= periodData.nowList[0].start_dtm)) {
        // 지금 ~ LIST[0].start
        resultArray.push({
            type_cd: 'W',
            period_m: moment.duration(moment(periodData.nowList[0].start_dtm, 'YYYYMMDDHHmm').diff(moment(nowDtm, 'YYYYMMDDHHmm'))).asMinutes(),
            start_dtm: nowDtm,
            end_dtm: periodData.nowList[0].start_dtm,
            end_volt: periodData.nowList[0].start_volt, end_curr: periodData.nowList[0].start_curr, end_tp: periodData.nowList[0].start_tp, end_soc: periodData.nowList[0].start_soc,
        });

        // List[0] ... ~ next
        resultArray = resultArray.concat(makePeriodList(periodData, nextDtm));
    }

    // prev 없음 AND list 없음
    if (!periodData.prev && periodData.nowList.length <= 0) {
        // 지금 ~ next
        resultArray.push({
            type_cd: 'I',
            period_m: moment.duration(moment(nextDtm, 'YYYYMMDDHHmm').diff(moment(nowDtm, 'YYYYMMDDHHmm'))).asMinutes(),
            start_dtm: nowDtm,
            end_dtm: nextDtm,
        });
    }

    // prev 없음 AND list 있음
    if (!periodData.prev && periodData.nowList.length > 0) {
        // 지금 ~ LIST[0].start
        resultArray.push({
            type_cd: 'I',
            period_m: moment.duration(moment(periodData.nowList[0].start_dtm, 'YYYYMMDDHHmm').diff(moment(nowDtm, 'YYYYMMDDHHmm'))).asMinutes(),
            start_dtm: nowDtm,
            end_dtm: periodData.nowList[0].start_dtm,
            end_volt: periodData.nowList[0].start_volt, end_curr: periodData.nowList[0].start_curr, end_tp: periodData.nowList[0].start_tp, end_soc: periodData.nowList[0].start_soc,
        });

        // List[0] ... ~ next
        resultArray = resultArray.concat(makePeriodList(periodData, nextDtm));
    }

    // 4. 배터리 상태 코드 매핑
    resultArray.map(e => { e['type'] = code.getCodeResult(codeMap, 'btry_stat', e['type_cd']); });
    resultArray = resultArray.reverse();

	let paging = new Pagination(resultArray.length, page, 10);
        paging.getPages(10);

	resultArray = resultArray.slice(paging.start, paging.end);

    return form.result(res, req.method, 'SUCCESS', null, '성공', { periodList: resultArray, paging: paging }, null);
}

function makePeriodList(periodData, nextDtm) {
    let resultArray = [];

    // List[0] ... ~ next
    for (let i = 0; i < periodData.nowList.length; i++) {
        // (IF) LIST[i].end >= next
        if (periodData.nowList[i].end_dtm >= nextDtm) {
            // (THEN) LIST[i].start ~ next -> LIST[i].STAT
            resultArray.push({
                type_cd: periodData.nowList[i].type_cd,
                period_m: moment.duration(moment(nextDtm, 'YYYYMMDDHHmm').diff(moment(periodData.nowList[i].start_dtm, 'YYYYMMDDHHmm'))).asMinutes(),
                start_dtm: periodData.nowList[i].start_dtm,
                start_volt: periodData.nowList[i].start_volt, start_curr: periodData.nowList[i].start_curr, start_tp: periodData.nowList[i].start_tp, start_soc: periodData.nowList[i].start_soc,
                end_dtm: nextDtm,
            });
        }

        // (IF) LIST[i].end < next
        if (periodData.nowList[i].end_dtm < nextDtm) {
            // (IF) LIST[i + 1]
            if (periodData.nowList[i + 1]) {
                // (THEN) LIST[i].start ~ LIST[i].end -> LIST[i].STAT
                resultArray.push({
                    type_cd: periodData.nowList[i].type_cd,
                    period_m: moment.duration(moment(periodData.nowList[i].end_dtm, 'YYYYMMDDHHmm').diff(moment(periodData.nowList[i].start_dtm, 'YYYYMMDDHHmm'))).asMinutes(),
                    start_dtm: periodData.nowList[i].start_dtm,
                    start_volt: periodData.nowList[i].start_volt, start_curr: periodData.nowList[i].start_curr, start_tp: periodData.nowList[i].start_tp, start_soc: periodData.nowList[i].start_soc,
                    end_dtm: periodData.nowList[i].end_dtm,
                    end_volt: periodData.nowList[i].end_volt, end_curr: periodData.nowList[i].end_curr, end_tp: periodData.nowList[i].end_tp, end_soc: periodData.nowList[i].end_soc,
                });

                // (IF) LIST[i].end + 1D < LIST[i + 1].start
                if (moment(periodData.nowList[i].end_dtm, 'YYYYMMDDHHmm').add(1, 'days').format('YYYYMMDDHHmm') < periodData.nowList[i + 1].start_dtm) {
                    // (THEN) LIST[i].end ~ LIST[i].end + 1H -> 'W'
                    resultArray.push({
                        type_cd: 'W',
                        period_m: moment.duration(moment(periodData.nowList[i].end_dtm, 'YYYYMMDDHHmm').add(1, 'days').diff(moment(periodData.nowList[i].end_dtm, 'YYYYMMDDHHmm'))).asMinutes(),
                        start_dtm: periodData.nowList[i].end_dtm,
                        start_volt: periodData.nowList[i].end_volt, start_curr: periodData.nowList[i].end_curr, start_tp: periodData.nowList[i].end_tp, start_soc: periodData.nowList[i].end_soc,
                        end_dtm: moment(periodData.nowList[i].end_dtm, 'YYYYMMDDHHmm').add(1, 'days').format('YYYYMMDDHHmm'),
                    });

                    // (THEN) LIST[i].end + 1D ~ LIST[i + 1].start -> 'I'
                    resultArray.push({
                        type_cd: 'I',
                        period_m: moment.duration(moment(periodData.nowList[i + 1].start_dtm, 'YYYYMMDDHHmm').diff(moment(periodData.nowList[i].end_dtm, 'YYYYMMDDHHmm'))).asMinutes(),
                        start_dtm: periodData.nowList[i].end_dtm,
                        start_volt: periodData.nowList[i].end_volt, start_curr: periodData.nowList[i].end_curr, start_tp: periodData.nowList[i].end_tp, start_soc: periodData.nowList[i].end_soc,
                        end_dtm: periodData.nowList[i + 1].start_dtm,
                        end_volt: periodData.nowList[i + 1].start_volt, end_curr: periodData.nowList[i + 1].start_curr, end_tp: periodData.nowList[i + 1].start_tp, end_soc: periodData.nowList[i + 1].start_soc,
                    });
                }

                // (IF) LIST[i].end + 1D >= LIST[i + 1].start
                if (moment(periodData.nowList[i].end_dtm, 'YYYYMMDDHHmm').add(1, 'days').format('YYYYMMDDHHmm') >= periodData.nowList[i + 1].start_dtm) {
                    // (THEN) LIST[i].end ~ LIST[i + 1].start -> 'W'
                    resultArray.push({
                        type_cd: 'W',
                        period_m: moment.duration(moment(periodData.nowList[i + 1].start_dtm, 'YYYYMMDDHHmm').diff(moment(periodData.nowList[i].end_dtm, 'YYYYMMDDHHmm'))).asMinutes(),
                        start_dtm: periodData.nowList[i].end_dtm,
                        start_volt: periodData.nowList[i].end_volt, start_curr: periodData.nowList[i].end_curr, start_tp: periodData.nowList[i].end_tp, start_soc: periodData.nowList[i].end_soc,
                        end_dtm: periodData.nowList[i + 1].start_dtm,
                        end_volt: periodData.nowList[i + 1].start_volt, end_curr: periodData.nowList[i + 1].start_curr, end_tp: periodData.nowList[i + 1].start_tp, end_soc: periodData.nowList[i + 1].start_soc,
                    });
                }
            }

            // (IF) !LIST[i + 1]
            if (!periodData.nowList[i + 1]) {
                // (THEN) LIST[i].start ~ LIST[i].end -> LIST[i].STAT
                resultArray.push({
                    type_cd: periodData.nowList[i].type_cd,
                    period_m: moment.duration(moment(periodData.nowList[i].end_dtm, 'YYYYMMDDHHmm').diff(moment(periodData.nowList[i].start_dtm, 'YYYYMMDDHHmm'))).asMinutes(),
                    start_dtm: periodData.nowList[i].start_dtm,
                    start_volt: periodData.nowList[i].start_volt, start_curr: periodData.nowList[i].start_curr, start_tp: periodData.nowList[i].start_tp, start_soc: periodData.nowList[i].start_soc,
                    end_dtm: periodData.nowList[i].end_dtm,
                    end_volt: periodData.nowList[i].end_volt, end_curr: periodData.nowList[i].end_curr, end_tp: periodData.nowList[i].end_tp, end_soc: periodData.nowList[i].end_soc,
                });
                
                // (IF) LIST[i].end + 1D < next
                if (moment(periodData.nowList[i].end_dtm, 'YYYYMMDDHHmm').add(1, 'days').format('YYYYMMDDHHmm') < nextDtm) {
                    // (THEN) LIST[i].end ~ LIST[i].end + 1D -> 'W'
                    resultArray.push({
                        type_cd: 'W',
                        period_m: moment.duration(moment(periodData.nowList[i].end_dtm, 'YYYYMMDDHHmm').add(1, 'days').diff(moment(periodData.nowList[i].end_dtm, 'YYYYMMDDHHmm'))).asMinutes(),
                        start_dtm: periodData.nowList[i].end_dtm,
                        start_volt: periodData.nowList[i].start_volt, start_curr: periodData.nowList[i].start_curr, start_tp: periodData.nowList[i].start_tp, start_soc: periodData.nowList[i].start_soc,
                        end_dtm: moment(periodData.nowList[i].end_dtm, 'YYYYMMDDHHmm').add(1, 'days').format('YYYYMMDDHHmm'),
                    });
                    // (THEN) LIST[i].end + 1D ~ next -> 'I'
                    resultArray.push({
                        type_cd: 'I',
                        period_m: moment.duration(moment(nextDtm, 'YYYYMMDDHHmm').diff(moment(periodData.nowList[i].end_dtm, 'YYYYMMDDHHmm').add(1, 'days'))).asMinutes(),
                        start_dtm: moment(periodData.nowList[i].end_dtm, 'YYYYMMDDHHmm').add(1, 'days').format('YYYYMMDDHHmm'),
                        end_dtm: nextDtm,
                    });
                }

                // (IF) LIST[i].end + 1D >= next
                if (moment(periodData.nowList[i].end_dtm, 'YYYYMMDDHHmm').add(1, 'days').format('YYYYMMDDHHmm') >= nextDtm) {
                    // (THEN) LIST[i].end ~ next -> 'W'
                    resultArray.push({
                        type_cd: 'W',
                        period_m: moment.duration(moment(nextDtm, 'YYYYMMDDHHmm').diff(moment(periodData.nowList[i].end_dtm, 'YYYYMMDDHHmm'))).asMinutes(),
                        start_dtm: periodData.nowList[i].end_dtm,
                        start_volt: periodData.nowList[i].end_volt, start_curr: periodData.nowList[i].end_curr, start_tp: periodData.nowList[i].end_tp, start_soc: periodData.nowList[i].end_soc,
                        end_dtm: nextDtm,
                    });
                }
            }
        }
    }

    return resultArray;
}

//실시간 조회
exports.getNow = async(req, res, next) => {

    try{

        var currentPage = req.body.page;

        if (currentPage == null || currentPage == '') {
            currentPage = 1;
        }

        let query1 = "SELECT COUNT(*) AS total_count ";
        query1 += "FROM OPENBMS.TBL_LOC tl ";
        query1 += "LEFT OUTER JOIN MPP_CMPY_LOC mcl ON mcl.loc_seq = tl.loc_seq ";
        //회사 seq 
        query1 += "WHERE mcl.cmpy_seq = 1;";
    
        let [row1] = await global.mysqlPool.query(query1);

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 5);
        paginate.getPages(5);

        let query2 = "SELECT tl.loc_seq, tl.loc_nm, tl.ins_dttm, tc.cmpy_seq, tc.cmpy_nm ";
        query2 += "FROM OPENBMS.TBL_LOC tl ";
        query2 += "LEFT OUTER JOIN MPP_CMPY_LOC mcl ON mcl.loc_seq = tl.loc_seq ";
        query2 += "LEFT OUTER JOIN TBL_CMPY tc ON tc.cmpy_seq = mcl.cmpy_seq "
        //회사 seq 
        query2 += "WHERE mcl.cmpy_seq = 1 ";
        query2 += "LIMIT " + paginate.limit;

        let [row2] = await global.mysqlPool.query(query2);

        res.render(viewName+"now", {locList: row2, liRow: paginate.pages[paginate.page - 1], pages: paginate.threePages});
    }catch(err) {
        console.log(err);
        res.send({locList : null, liRow : null, pages : null});
    }
    
}

/*한 회사에 설치된 배터리들의 종류리스트*/
exports.postCmpyTypeList = async(req, res, next) => {
    console.log("postCmpyTypeList start");
    var userInfo = req.session.userInfo;
    let cmpyList = await common.getBtryGroupByMyCmpy(userInfo.cmpy_seq);
    var btry_seq_group = "0";

    for(var i in cmpyList){
        if(cmpyList[i].cmpy_seq == userInfo.cmpy_seq){
            btry_seq_group = cmpyList[i].btry_seq_group;
        }
    }

    let query= "SELECT tc.cd AS btry_ty_cd,tc.cd_desc AS btry_ty_desc ";
        query+="FROM OPENBMS.TBL_BTRY tb ";
        query+="LEFT JOIN OPENBMS.TBL_MDL tm ON tm.mdl_seq = tb.mdl_seq ";
        query+="LEFT JOIN OPENBMS.TBL_CD tc ON tc.cd = tm.btry_ty AND tc.gp_cd = 'btry_ty' ";
        query+="WHERE tb.btry_seq IN (" + btry_seq_group + ") ";
        query+="GROUP BY tc.cd_desc ";

        console.log("이번엔 뭐가 문제야");
        console.log(query);

    let [rows] = await global.mysqlPool.query(query);

    console.log(rows);

    res.send({btry_ty_list : rows});

}

/*한 회사에 설치된 배터리들 중 한 종류에 대한 배터리 리스트*/
exports.postBtrySeqList = async(req, res, next) => {
    console.log("postBtrySeqList start");
    var btry_ty = req.body.btry_ty;
    var userInfo = req.session.userInfo;

    let cmpyList = await common.getBtryGroupByMyCmpy(userInfo.cmpy_seq);
    var btry_seq_group = "0";

    for(var i in cmpyList){
        if(cmpyList[i].cmpy_seq == userInfo.cmpy_seq){
            btry_seq_group = cmpyList[i].btry_seq_group;
        }
    }

    let query= "SELECT tb.btry_seq, tb.btry_nm ";
        query+="FROM OPENBMS.TBL_BTRY tb ";
        query+="LEFT JOIN OPENBMS.TBL_MDL tm ON tm.mdl_seq = tb.mdl_seq ";
        query+="WHERE tb.btry_seq IN (" + btry_seq_group +") ";
        query+="AND tm.btry_ty = '" + btry_ty + "' ";

    let [rows] = await global.mysqlPool.query(query);

    res.send({btry_seq_list : rows});

}

//일별 통계 가져오기
exports.postDailyHistory = async(req, res, next) => {
    console.log("postDailyHistory start");

    try{
        var currentPage = req.body.page;

        if (currentPage == null || currentPage == '') {
            currentPage = 1;
        }

        var cmpy_seq = req.session.userInfo.cmpy_seq;
        var btry_ty = req.body.btry_ty;
        var btry_seq = req.body.btry_seq;

        let query1 = "select COUNT(*) AS total_count FROM ( ";
            query1+= "select tsd.sttc_day_seq, tb.btry_seq,tb.btry_nm, tsd.sttc_dt, ";
            query1+= "tsd.sttc_dayweek, IFNULL(tsd.comment,'') as comment, tsd.avg_chrg_time, tsd.avg_dischrg_time,  ";
            query1+= "tsd.avg_standby_time, tsd.avg_soc, tsd.avg_soh, IFNULL(tsd.chrg_cnt,0) as chrg_cnt,  ";
            query1+= "tsd.ins_nm, tsd.ins_dttm  ";
            query1+= "FROM OPENBMS.TBL_STTC_DAY tsd  ";
            query1+= "LEFT JOIN OPENBMS.TBL_BTRY tb ON tb.btry_seq = tsd.btry_seq ";
            query1+= "LEFT JOIN OPENBMS.TBL_MDL tm ON tm.mdl_seq = tb.mdl_seq ";
            query1+= "WHERE tsd.cmpy_seq = " + cmpy_seq + " ";
            query1+= "AND tsd.btry_seq = " + btry_seq + " ";
            query1+= "AND tm.btry_ty = '" + btry_ty + "' ";
            query1+= ") main ";
        let [row1] = await global.mysqlPool.query(query1); 

        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 5);
        paginate.getPages(5);

        let query2 = "select tsd.sttc_day_seq, tb.btry_seq,tb.btry_nm, DATE_FORMAT(tsd.sttc_dt,'%Y-%m-%d') AS sttc_dt, ";
            query2+= "tsd.sttc_dayweek, IFNULL(tsd.comment,'') as comment, tsd.avg_chrg_time, tsd.avg_dischrg_time,  ";
            query2+= "tsd.avg_standby_time, ROUND(IFNULL(tsd.avg_soc,0),2) AS avg_soc, ROUND(IFNULL(tsd.avg_soh,0),2) AS avg_soh, IFNULL(tsd.chrg_cnt,0) as chrg_cnt,  ";
            query2+= "tsd.ins_nm, DATE_FORMAT(tsd.ins_dttm,'%Y-%m-%d') AS ins_dttm  ";
            query2+= "FROM OPENBMS.TBL_STTC_DAY tsd  ";
            query2+= "LEFT JOIN OPENBMS.TBL_BTRY tb ON tb.btry_seq = tsd.btry_seq ";
            query2+= "LEFT JOIN OPENBMS.TBL_MDL tm ON tm.mdl_seq = tb.mdl_seq ";
            query2+= "WHERE tsd.cmpy_seq = " + cmpy_seq + " ";
            query2+= "AND tsd.btry_seq = " + btry_seq + " ";
            query2+= "AND tm.btry_ty = '" + btry_ty + "' ";
            query2 += "ORDER BY tsd.sttc_dt DESC ";
            query2 += "LIMIT " + paginate.limit;
    
        let [row2] = await global.mysqlPool.query(query2);

        for(var i = 0; i < row2.length; i++){
            row2[i].avg_chrg_time = utiljs.minuteFormat(row2[i].avg_chrg_time);
            row2[i].avg_dischrg_time = utiljs.minuteFormat(row2[i].avg_dischrg_time);
            row2[i].avg_standby_time = utiljs.minuteFormat(row2[i].avg_standby_time);
        }
        res.send({ data: row2, liRow: paginate.pages[paginate.page - 1], pages: paginate.threePages });

    } catch (err){
        console.log(err);
        res.send({data : null, liRow : null, pages : null});
    }
}

exports.postFirstLiveData = async(req, res, next) => {
    console.log("start postFirstLiveData");

    var cmpy_seq = req.session.userInfo.cmpy_seq;
    var btry_seq = req.body.btry_seq;

    //그래프 처음 10개 데이터

    let query1 ='SELECT GROUP_CONCAT("\'",a.biz_key,"\'") AS bizKeyArrayString ' ;
        query1 += '    FROM ( ' ;
        query1 += '    SELECT TPBD2.biz_key ' ;
        query1 += '    FROM OPENBMS.TBL_PTC_BIZ_DATA TPBD2 ' ;
        query1 += '    WHERE TPBD2.cmpy_seq = 2 ' ;
        query1 += '    AND TPBD2.btry_seq = 2 ' ;
        query1 += '    GROUP BY TPBD2.biz_key ' ;
        query1 += '    ORDER BY TPBD2.biz_key DESC ' ;
        query1 += '    LIMIT 10 ' ;
        query1 += '    ) a';

    let [rows1] = await global.mysqlPool.query(query1);

	let query2 = 'SELECT';
        query2 += ' 	TPBD1.biz_key, TPBD1.volt_sys as volt, TPBD1.curr_sys as curr, TPBD1.soc, TPBD1.soh,';
		query2 += ' 	DATE_FORMAT(TPBD1.ins_dttm, "%Y/%m/%d %H:%i:%s") AS ins_dttm';
		query2 += ' FROM OPENBMS.TBL_PTC_BIZ_DATA TPBD1';
		query2 += ' WHERE TPBD1.biz_key IN (' + rows1[0].bizKeyArrayString +' )';
		query2 += ' GROUP BY TPBD1.biz_key';
		query2 += ' ORDER BY TPBD1.biz_key DESC';

    let [rows2] = await global.mysqlPool.query(query2);

    if (rows2.length > 0) {
        var currData = [], voltData = [], socData = [], sohData = [], xData = [];
        var lastKey = rows2[0].biz_key;
    
        for (var i = 0; i < rows2.length; i++){
            //데이터 파싱
            var time = rows2[rows2.length-1-i].biz_key.substring(8,14);
            var timeString = time.substring(0, 2) + ":" + time.substring(2,4) + ":" + time.substring(4,6);
            xData.push(timeString);
            currData.push(parseFloat(rows2[rows2.length-1-i].curr == null ? 0 : rows2[rows2.length-1-i].curr).toFixed(2));
            voltData.push(parseFloat(rows2[rows2.length-1-i].volt == null ? 0 : rows2[rows2.length-1-i].volt).toFixed(2));
            socData.push(parseFloat(rows2[rows2.length-1-i].soc == null  ? 0 : rows2[rows2.length-1-i].soc).toFixed(2));
            sohData.push(parseFloat(rows2[rows2.length-1-i].soh == null ? 0 : rows2[rows2.length-1-i].soh).toFixed(2));
        }
    
        //SOC 계산할 최대 전압
        let query3 = "SELECT btry_max_volt, btry_min_volt, btry_rat_volt, btry_rat_curr, btry_max_curr, btry_min_curr";
			query3 += " FROM OPENBMS.TBL_BTRY WHERE btry_seq = " + btry_seq + "";

        let [rows3] = await global.mysqlPool.query(query3);
    
        res.send({currData: currData, voltData: voltData, socData: socData, sohData: sohData, btry_info: rows3[0], xData: xData, lastKey: lastKey, cmpySeq: cmpy_seq});
    } else {
        res.send();
    }

}

exports.getAlarmHsty =async(req, res, next) => {
    console.log("start getAlarmHsty");

    res.render(viewName+"alarmHsty");

}

exports.postAlarmHstyList =async(req, res, next) => {
    console.log("start postAlarmHstyList");

    try {
        var currentPage = req.body.page;
        if (currentPage == null || currentPage == '') {
            currentPage = 1;
        }
        var cmpy_seq = req.session.userInfo.cmpy_seq;
        var start_date = req.body.start_date;
        var end_date = req.body.end_date;

        start_date += "000000";
        end_date += "235959";

        let query = "SELECT COUNT(*) as total_count FROM ( ";
            query+= "SELECT tb.btry_nm, tc.cmpy_nm, tah.alm_hsty_seq, tah.alm_set_nm, tah.alm_hsty_comment, ";
            query+= "DATE_FORMAT(tah.alm_hsty_dttm,'%Y-%m-%d') AS alm_hsty_date, DATE_FORMAT(tah.alm_hsty_dttm,'%H:%i:%s') AS alm_hsty_time ";
            query+= "FROM TBL_ALM_HSTY tah ";
            query+= "LEFT JOIN TBL_CMPY tc ON tc.cmpy_seq = tah.cmpy_seq ";
            query+= "LEFT JOIN TBL_BTRY tb ON tb.btry_seq = tah.btry_seq ";
            query+= "LEFT JOIN TBL_ALM_SET tas ON tas.alm_set_seq = tah.alm_set_seq ";
            query+= "WHERE tah.cmpy_seq IN (" + cmpy_seq + ") ";
            query+= "AND tah.alm_hsty_dttm >= " + start_date + " ";
            query+= "AND tah.alm_hsty_dttm <= " + end_date + " ";
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
            query2+= "WHERE tah.cmpy_seq IN (" + cmpy_seq + ") ";
            query2+= "AND tah.alm_hsty_dttm >= " + start_date + " ";
            query2+= "AND tah.alm_hsty_dttm <= " + end_date + " ";
            query2 += "LIMIT " + paginate.limit;

        let [row2] = await global.mysqlPool.query(query2);

        res.send({hstryList: row2, liRow: paginate.pages[paginate.page - 1], pages: paginate.threePages });

    } catch (error) {
        console.log(error);
    }

}

exports.getCheck =async(req, res, next) => {
    console.log("start getCheck");

    let info = {
        loc_seq: "1"
    }

    let query1 = "SELECT loc_nm FROM TBL_LOC WHERE loc_seq = " + info.loc_seq;
    let [row1] = await global.mysqlPool.query(query1);

    let query2 = "SELECT tb.btry_seq, tb.btry_nm ";
    query2 += "FROM OPENBMS.TBL_BTRY tb ";
    query2 += "LEFT OUTER JOIN MPP_LOC_BTRY mlb ON mlb.btry_seq = tb.btry_seq ";
    query2 += "WHERE mlb.loc_seq = " + info.loc_seq + ";";


    let [row2] = await global.mysqlPool.query(query2);
    
    res.render(viewName+"check", {loc_seq: info.loc_seq, loc_nm: row1[0].loc_nm, btryList: row2});

}

exports.postInspecHstry = async(req, res, next) => {
    //장소별 bms list
    console.log("start postInspecHstry");

    try {
        var currentPage = req.body.page;

        if (currentPage == null || currentPage == '') {
            currentPage = 1;
        }

        var inspec_type = req.body.inspec_type;
        var cmpy_seq = req.body.cmpy_seq;
        var loc_seq = req.body.loc_seq;
        var start_date = req.body.start_date;
        var end_date = req.body.end_date;

        start_date += "000000";
        end_date += "235959";

        //점검이력은 본인회사만 조회하도록
        cmpy_seq = req.session.userInfo.cmpy_seq;

        let query = "SELECT COUNT(*) as total_count FROM (";
            query+= "SELECT tc.cmpy_nm, tl.loc_nm, CONCAT(DATE_FORMAT(tih.inspec_date,'%Y/%m/%d'),' ',CONCAT(CONCAT(SUBSTR(tih.inspec_time,1,2)),':',CONCAT(SUBSTR(tih.inspec_time,3,4)),':00')) AS inspec_dttm, "; 
            query+= "tcode.cd_desc AS inspec_type, tcode2.cd_desc AS inspec_stat, IFNULL(tih.inspec_rslt,'') AS inspec_rslt, tih.ins_nm, DATE_FORMAT(tih.ins_dttm,'%Y-%m-%d %H:%i:%s') AS ins_dttm ";
            query+= "FROM TBL_INSPEC_HSTY tih ";
            query+= "LEFT JOIN TBL_CMPY tc ON tih.cmpy_seq = tc.cmpy_seq ";
            query+= "LEFT JOIN TBL_LOC tl ON tih.loc_seq = tl.loc_seq ";
            query+= "LEFT JOIN TBL_CD tcode ON tcode.cd = tih.inspec_type AND tcode.gp_cd = 'inspec_type' ";
            query+= "LEFT JOIN TBL_CD tcode2 ON tcode2.cd = tih.inspec_stat_cd AND tcode2.gp_cd = 'inspec_stat' ";
            query+= "WHERE tih.inspec_type IN (" + inspec_type + ") ";
            query+= "AND tih.cmpy_seq IN (" + cmpy_seq + ") ";
            query+= "AND tih.loc_seq IN (" + loc_seq + ") ";
            query+= "AND tih.inspec_date >= '" + start_date + "' ";
            query+= "AND tih.inspec_date <= '" + end_date + "' ";
            query+=") as main"

        let [row1] = await global.mysqlPool.query(query);


        // 페이지네이션 설정(총 개수, 현재페이지, 페이지당 출력수, 선택가능한 페이지 수)
        let paginate = new Pagination(row1[0].total_count, currentPage, 5);
        paginate.getPages(5);


        let query2 = "SELECT tc.cmpy_nm, tl.loc_nm, CONCAT(DATE_FORMAT(tih.inspec_date,'%Y/%m/%d'),' ',CONCAT(CONCAT(SUBSTR(tih.inspec_time,1,2)),':',CONCAT(SUBSTR(tih.inspec_time,3,4)),':00')) AS inspec_dttm, "; 
            query2+= "tcode.cd_desc AS inspec_type, tcode2.cd_desc AS inspec_stat, IFNULL(tih.inspec_rslt,'') AS inspec_rslt, tih.ins_nm, DATE_FORMAT(tih.ins_dttm,'%Y-%m-%d %H:%i:%s') AS ins_dttm ";
            query2+= "FROM TBL_INSPEC_HSTY tih ";
            query2+= "LEFT JOIN TBL_CMPY tc ON tih.cmpy_seq = tc.cmpy_seq ";
            query2+= "LEFT JOIN TBL_LOC tl ON tih.loc_seq = tl.loc_seq ";
            query2+= "LEFT JOIN TBL_CD tcode ON tcode.cd = tih.inspec_type AND tcode.gp_cd = 'inspec_type' ";
            query2+= "LEFT JOIN TBL_CD tcode2 ON tcode2.cd = tih.inspec_stat_cd AND tcode2.gp_cd = 'inspec_stat' ";
            query2+= "WHERE tih.inspec_type IN (" + inspec_type + ") ";
            query2+= "AND tih.cmpy_seq IN (" + cmpy_seq + ") ";
            query2+= "AND tih.loc_seq IN (" + loc_seq + ") ";
            query2+= "AND tih.inspec_date >= '" + start_date + "' ";
            query2+= "AND tih.inspec_date <= '" + end_date + "' ";
            query2 += "LIMIT " + paginate.limit;

        let [row2] = await global.mysqlPool.query(query2);

        res.send({hstryList: row2, liRow: paginate.pages[paginate.page - 1], pages: paginate.threePages });
    } catch (err){
        console.log(err);
        res.send({hstryList : null, liRow : null, pages : null});
    }

    
}

exports.postLocListByCmpy = async(req, res, next) => {
    //장소별 bms list
    console.log("start postLocListByCmpy");
    try {

        //점검조회에서는 본인회사의 설치장소만
        var cmpy_seq = req.session.userInfo.cmpy_seq;

        let query = "SELECT tl.loc_seq, tl.loc_nm FROM TBL_LOC tl ";
            query+= "WHERE tl.loc_seq IN (SELECT mcl.loc_seq FROM MPP_CMPY_LOC mcl WHERE mcl.cmpy_seq IN (" + cmpy_seq + "))";

        let [rows] = await global.mysqlPool.query(query);

        var allLoc = "";

        for(var i in rows){
            if(i==(rows.length-1)){
                allLoc += rows[i].loc_seq;
                break;
            }
            allLoc += rows[i].loc_seq + ",";
        }

        if(rows != null && rows.length != 0){
            rows.unshift({
                loc_seq: allLoc,
                loc_nm: "전체"
            });
        }

        res.send({loc_list : rows});

    } catch (err){
        console.log(err);
    }
}

exports.postInspecTypeList = async(req, res, next) => {
    //장소별 bms list
    console.log("start postInspecTypeList");
    try {

        let query = "SElECT tc.cd AS inspec_cd, tc.cd_desc AS inspec_cd_desc FROM TBL_CD tc ";
            query+= "WHERE tc.gp_cd = 'inspec_type'";

        let [rows] = await global.mysqlPool.query(query);

        var allInspecCd = "";

        for(var i in rows){
            if(i==(rows.length-1)){
                allInspecCd += rows[i].inspec_cd;
                break;
            }
            allInspecCd += rows[i].inspec_cd + ",";
        }

        if(allInspecCd == null || allInspecCd == ""){
            allInspecCd = "-1";
        }
        rows.unshift({
            inspec_cd: allInspecCd,
            inspec_cd_desc: "전체"
        });

        res.send({inspec_type_list : rows});

    } catch (err){
        console.log(err);
    }
}