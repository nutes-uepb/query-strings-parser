'use strict'
const read = require('./lib/read')

exports = module.exports = function (params) {
    return read.parser(params)
}

exports = module.exports.parser = function (query, _default, _options) {
    return read.parseAll(query, _default, _options)
}

exports = module.exports.parseFields = function (_query, _default) {
    return read.parseFields(_query, _default)
}

exports = module.exports.parseSort = function (_query, _default) {
    return read.parseSort(_query, _default)
}

exports = module.exports.parsePagination = function (_query, _default, _use_page) {
    return read.parsePagination(_query, _default, _use_page)
}

exports = module.exports.parseFilter = function (_query, _default) {
    return read.parseFilter(_query, _default)
}

exports = module.exports.parseDate = function (_query, _default) {
    return read.parseDate(_query, _default)
}
