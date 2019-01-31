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
        delete query.start_at
        delete query.end_at
        delete query.period
        for (var elem in query) {
            if (query[elem] instanceof Array) {
                query[elem].forEach(function (param) {
                    result['$and'].push(processQuery(elem, param))
                })
            } else {
                if (query[elem] instanceof Object) { }
                else if (query[elem].includes(',')) {
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
    if (isDate(value)) return normalizeDate(value, true)
    else if (isDateTime(value)) return value
    else if (value.includes('*')) return buildRegEx(value)
    else if (value.includes(':')) return getCompareOperator(value)
    else if (value === 'now') return normalizeDate(dateToString(new Date()), false)
    else if (/^[0-9]/.test(value)) return parseInt(value)
    return value
}

function isDate(value) {
    return /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/.test(value)
}
function isDateTime(value) {
    return /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))T(0[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])$/.test(value)
}

function getCompareOperator(value) {
    if (value.startsWith('gte')) return { '$gte': treatValue(value.slice(4)) }
    else if (value.startsWith('gt')) return { '$gt': treatValue(value.slice(3)) }
    else if (value.startsWith('lte')) return { '$lte': treatValue(value.slice(4)) }
    else if (value.startsWith('lt')) return { '$lt': treatValue(value.slice(3)) }
    return value
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
    if (query.start_at === 'today') query.start_at = dateToString(new Date())
    if (query.end_at === 'today') query.end_at = dateToString(new Date())
    if (query.period) {
        (query.end_at && (isDate(query.end_at) || isDateTime(query.end_at))) ?
            result.push(
                processQuery(options.date_field, 'lt:'.concat(normalizeDate(query.end_at, false))),
                processQuery(options.date_field, 'gte:'.concat(normalizeDate(
                    getDateStartByPeriod(query.period, new Date(query.end_at)))))) :
            result.push(
                processQuery(options.date_field, 'lt:now'),
                processQuery(options.date_field, 'gte:'.concat(
                    getDateStartByPeriod(query.period, new Date()))))
        return result
    }

    if (query.start_at && (isDate(query.start_at) || isDateTime(query.start_at))) {
        if (query.end_at && (isDate(query.end_at) || isDateTime(query.end_at))) {
            result.push(
                processQuery(options.date_field, 'lt:'.concat(query.end_at)))
        } else {
            result.push(
                processQuery(options.date_field, 'lt:now'))
        }
        result.push(
            processQuery(options.date_field, 'gte:'.concat(query.start_at)))
    }
    return result
}

function getDateStartByPeriod(period, end_at) {
    if (!(/^[0-9]{1,}[d|w|m|y]$/.test(period))) return dateToString(new Date())

    switch (period.slice(-1)) {
        case 'd':
            return dateToString(new Date(
                end_at.getFullYear(),
                end_at.getMonth(),
                (end_at.getDate() - onlyNumbers(period))))
        case 'w':
            return dateToString(new Date(
                end_at.getFullYear(),
                end_at.getMonth(),
                (end_at.getDate() - 7 * onlyNumbers(period))))
        case 'm':
            return dateToString(new Date(
                end_at.getFullYear(),
                (end_at.getMonth() - onlyNumbers(period)),
                end_at.getDate()))
        case 'y':
            return dateToString(new Date(
                (end_at.getFullYear() - onlyNumbers(period)),
                end_at.getMonth(),
                end_at.getDate()))
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

function normalizeDate(date, isDateStart) {
    if (isDateStart) {
        return date.replace(/\D/g, '').replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3T00:00:00')
    }
    return date.replace(/\D/g, '').replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3T23:59:59')
}

exports = module.exports = {
    filters: filters
}
