const read = require('./lib/read')

module.exports.options = function (params) {
    read.set_default()
    return read.options(params)
}