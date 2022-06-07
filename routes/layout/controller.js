// const asyncWrapper = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next());
// const form = require('../../config/form.js');
const viewName = 'layout/';

exports.getJusoPopup = async(req, res, next) => {
    try {
        res.render(viewName+"/jusoPopup");
    } catch (error) {
        console.log(error);
    }
}
