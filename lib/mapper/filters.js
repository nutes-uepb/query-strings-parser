'use strict'

function filters(query, options) {
    delete query.sort
    delete query.fields
    delete query.limit
    delete query.skip
    delete query.page

    var result = { $and: [], $or: [] }

    if (Object.keys(query).length > 0) {
        result.$and = result.$and.concat(parseDate(query, options))
        delete query.date_start
        delete query.date_end
        delete query.period
        for (var elem in query) {
            if (query[elem] instanceof Array) {
                query[elem].forEach(function (param) {
                    result['$and'].push(processQuery(elem, param))
                })
            } else {
                if (query[elem].includes(',')) {
                    result['$or'] = result['$or'].concat(splitByCommas(elem, query[elem]))
                } else {
                    Object.assign(result, processQuery(elem, query[elem]))
                }
            }
        }
        if (result['$and'].length === 0) delete result['$and']
        if (result['$or'].length === 0) delete result['$or']
        return result
    }
    return options.default.filters
}

function processQuery(key, value) {
    key = key.replace(/([^\w\s,.])|(\s{1,})|(^\.{1,})|\.{1,}$/gi, '')
    var param = {}
    param[key] = treatValue(value)
    return param
}

function treatValue(value) {
    if (isDate(value)) return new Date(value).toISOString()
    else if (parseInt(value)) return parseInt(value)
    else if (value.includes('*')) value = buildRegEx(value)
    else if (value.includes(':')) {
        var result = {}
        value = value.split(':')
        result[`$${value[0]}`] = treatValue(value[1])
        value = result
    }
    return value
}

function isDate(value) {
    return /(^\d{4}-\d{1,2}-\d{1,2}$)|(^\d{4}-\d{1,2}-\d{1,2}T\d{2}:\d{2}:\d{2}$)/.test(value)
}

function splitByCommas(key, value) {
    var result = []
    value = value.split(',')
    value.forEach(function (elem) {
        result.push(processQuery(key, elem))
    })
    return result
}

function buildRegEx(value) {
    value = value.replace(/(^\*{2,})|\*{2,}$/gi, '*')
    var result = { '$options': 'i' }
    if (!value.startsWith('*') && value.endsWith('*')) result.$regex = '^'.concat(value.replace(/([*])/gi, ''))
    else if (value.startsWith('*') && !value.endsWith('*')) result.$regex = value.replace(/([*])/gi, '').concat('&')
    else result.$regex = value.replace(/([*])/gi, '')
    return result
}

function parseDate(query, options) {
    var result = []
    if (query.period) {
        (query.date_end && isDate(query.date_end)) ?
            result.push(
                processQuery(options.date_field, 'lt:'.concat(query.date_end)),
                processQuery(options.date_field, 'gte:'.concat(
                    getDateStart(query.period, new Date(query.date_end))))) :
            result.push(
                processQuery(options.date_field, 'lt:'.concat(getDateStart('0d', new Date()))),
                processQuery(options.date_field, 'gte:'.concat(
                    getDateStart(query.period, new Date()))))
        return result
    }

    if (query.date_start && isDate(query.date_start)) {
        if (query.date_end && isDate(query.date_end)) {
            result.push(
                processQuery(options.date_field, 'lt:'.concat(query.date_end)))
        } else {
            result.push(
                processQuery(options.date_field, 'lt:'.concat(getDateStart('0d', new Date()))))
        }
        result.push(
            processQuery(options.date_field, 'gte:'.concat(query.date_start)))
    }
    return result
}

function getDateStart(period, date_end) {
    if (period.endsWith('d')) {
        return dateToString(new Date(
            date_end.getFullYear(),
            date_end.getMonth(),
            (date_end.getDate() - onlyNumbers(period))))
    }
    else if (period.endsWith('w')) {
        return dateToString(new Date(
            date_end.getFullYear(),
            date_end.getMonth(),
            (date_end.getDate() - 7 * onlyNumbers(period))))
    }
    else if (period.endsWith('m')) {
        return dateToString(new Date(
            date_end.getFullYear(),
            (date_end.getMonth() - onlyNumbers(period)),
            date_end.getDate()))
    }
    else {
        return dateToString(new Date(
            (date_end.getFullYear() - onlyNumbers(period)),
            date_end.getMonth() - onlyNumbers(period),
            date_end.getDate()))
    }
}

function dateToString(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${formatDay(date.getDate())}`
}
function formatDay(day) {
    return day < 10 ? '0'.concat(day) : day
}

function onlyNumbers(value) {
    return parseInt(value.replace(/[^0-9]+/g, ''))
}

exports = module.exports = {
    filters: filters
}

