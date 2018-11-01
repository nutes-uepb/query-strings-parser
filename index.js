const read = require('./lib/read')

exports = function (params) {
    read.set_default()
    return read.options(params)
}