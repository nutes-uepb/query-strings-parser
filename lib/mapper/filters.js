'use strict'

function filters(query, options) {
    delete query.sort
    delete query.fields
    delete query.limit
    delete query.skip
    delete query.page

    var result = { '$and': [] }
    if (Object.keys(query).length > 0) {
        for (var elem in query) {
            if (query[elem] instanceof Array) {
                query[elem].forEach(param => {
                    result['$and'].push(processQuery(elem, param))
                })
            } else {
                Object.assign(result, processQuery(elem, query[elem]))
            }
        }
        if (result['$and'].length === 0) delete result['$and']
        return result
    }
    return options.default.filters
}

function processQuery(key, value) {
    key = key.replace(/([^\w\s,.])|(\s{1,})|(^\.{1,})|\.{1,}$/gi, '')
    var param = {}
    if (isDate(value)) {
        value = new Date(value).toISOString()
    }

    else if (parseInt(value)) {
        value = parseInt(value)
    }
    else if (value.indexOf(':') !== -1) {
        var result = {}
        value = value.split(':')
        result[`$${value[0]}`] = value[1]
        if (isDate(value[1])) {
            result[`$${value[0]}`] = new Date(value[1]).toISOString()
        }
        value = result
    }
    param[key] = value
    return param
}

exports = module.exports = {
    filters: filters
}

function isDate(value) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return true
    return false
}

