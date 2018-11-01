'use strict'

const read = require('./lib/read')

exports = module.exports = function (params) {
    read.set_default()
    return read.options(params)
}