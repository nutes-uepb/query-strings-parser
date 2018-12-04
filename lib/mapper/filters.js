'use strict'

function filters(query, options) {
    delete query.sort
    delete query.fields
    delete query.limit
    delete query.skip
    delete query.page
    var result = {}
    if (Object.keys(query).length > 0) {
        for (var elem in query) {
            Object.assign(result, processQuery(elem, query[elem]))
        }
        return result
    }
    return options.default.filters
}

function processQuery(key, value) {
    key = key.replace(/([^\w\s,.])|(\s{1,})|(^\.{1,})|\.{1,}$/gi, '')
    var param = {}
    if (parseInt(value)) {
        value = parseInt(value)
    }
    else if (value.indexOf(':') !== -1) {
        var result = {}
        value = value.split(':')
        result[`$${value[0]}`] = value[1]
        value = result
    }
    param[key] = value
    return param
}

exports = module.exports = {
    filters: filters
}


