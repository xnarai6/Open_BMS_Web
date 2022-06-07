// const asyncWrapper = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next());
// const form = require('../../config/form.js');

exports.getAssetlocation = (req, res, next) => {
    res.render("asset/assetlocation");
}
