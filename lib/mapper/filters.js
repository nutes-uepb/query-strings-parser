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
    return /^\d{4}-\d{1,2}-\d{1,2}$/.test(value)
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
    if (value.endsWith('*')) {
        result.$regex = '^'.concat(value.replace(/([*])/gi, ''))
        if (value.startsWith('*')) {
            result.$regex = value.replace(/([*])/gi, '')
        }
    } else {
        if (value.startsWith('*')) {
            result.$regex = value.replace(/([*])/gi, '').concat('&')
        }
    }
    return result
}

function parseDate(query, options) {
    var result = []
    if (query.period) {
        if (query.date_end && isDate(query.date_end)) {
            result.push(
                processQuery(options.date_field, 'lt:'.concat(query.date_end)),
                processQuery(options.date_field, 'gte:'.concat(getDateStart(query.period, new Date(query.date_end)))))
        } else {
            result.push(
                processQuery(options.date_field, 'lt:'.concat(getDateStart('0d', new Date()))),
                processQuery(options.date_field, 'gte:'.concat(getDateStart(query.period, new Date()))))
        }
        return result
    }

    if (query.date_start && isDate(query.date_start)) {
        result.push(
            processQuery(options.date_field, 'gte:'.concat(query.date_start)))
        if (query.date_end && isDate(query.date_end)) {
            result.push(
                processQuery(options.date_field, 'lt:'.concat(query.date_end)))
        } else {
            result.push(
                processQuery(options.date_field, 'lt:'.concat(getDateStart('0d', new Date()))))
        }
    }
    return result
}

function getDateStart(period, date_end) {
    var date_start
    if (period.endsWith('d')) {
        date_start = new Date(date_end.getFullYear(),
            date_end.getMonth(),
            date_end.getDate() - periodToDays(period))
    }
    else if (period.endsWith('w')) {
        date_start = new Date(date_end.getFullYear(),
            date_end.getMonth(),
            date_end.getDate() - 7 * periodToDays(period))
    }
    else if (period.endsWith('m')) {
        date_start = new Date(date_end.getFullYear(),
            date_end.getMonth() - periodToDays(period),
            date_end.getDate())
    }
    else {
        date_start = new Date(date_end.getFullYear() - periodToDays(period),
            date_end.getMonth(),
            date_end.getDate())
    }
    return `${date_start.getFullYear()}-${date_start.getMonth() + 1}-${date_start.getDate()}`
}

function periodToDays(period) {
    period = period.replace(/[^0-9]+/g, '')
    return parseInt(period)
}

exports = module.exports = {
    filters: filters
}
