'use strict'

function filters(query, options) {
    delete query.sort
    delete query.fields
    delete query.limit
    delete query.skip
    delete query.page

    const result = {$and: [], $or: []}

    if (Object.keys(query).length > 0) {
        result.$and = result.$and.concat(parseDate(query, options))
        delete query.start_at
        delete query.end_at
        delete query.period
        for (const elem in query) {
            if (query[elem] instanceof Array) {
                query[elem].forEach(function (param) {
                    result['$and'].push(processQuery(elem, param))
                })
            } else {
                if (query[elem] instanceof Object) {
                } else if (query[elem].includes(',')) {
                    result['$or'] = result['$or'].concat(splitByCommas(elem, query[elem]))
                } else {
                    Object.assign(result, processQuery(elem, query[elem]))
                }
            }
        }
        if (result['$and'].length === 0) delete result['$and']
        if (result['$or'].length === 0) delete result['$or']
        return validate_filters(result, options.default.filters)
    }
    return options.default.filters
}

function processQuery(key, value) {
    key = key.replace(/([^\w\s,.])|(\s{1,})|(^\.{1,})|\.{1,}$/gi, '')
    const param = {}
    param[key] = treatValue(value)
    return param
}

function treatValue(value) {
    if (isDate(value)) return normalizeDate(value, true)
    else if (isDateTime(value)) return value
    else if (value.includes('*')) return buildRegEx(value)
    else if (value.includes(':')) return getCompareOperator(value)
    else if (value === 'now') return normalizeDate(dateToString(new Date()), false)
    else if (/^\d*$/.test(value)) return parseInt(value)
    return value
}

function isDate(value) {
    return /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/.test(value)
}

function isDateTime(value) {
    return /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))T(0[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])$/
        .test(value)
}

function getCompareOperator(value) {
    if (value.startsWith('gte')) return {'$gte': treatValue(value.slice(4))}
    else if (value.startsWith('gt')) return {'$gt': treatValue(value.slice(3))}
    else if (value.startsWith('lte')) return {'$lte': treatValue(value.slice(4))}
    else if (value.startsWith('lt')) return {'$lt': treatValue(value.slice(3))}
    return value
}

function splitByCommas(key, value) {
    const result = []
    value = value.split(',')
    value.forEach(function (elem) {
        result.push(processQuery(key, elem))
    })
    return result
}

function buildRegEx(value) {
    value = value.replace(/(^\*{2,})|\*{2,}$/gi, '*')
    value = addAccentsRegex(value)
    const result = {'$options': 'i'}
    if (!value.startsWith('*') && value.endsWith('*')) result.$regex = '^'.concat(value.replace(/([*])/gi, ''))
    else if (value.startsWith('*') && !value.endsWith('*')) result.$regex = value.replace(/([*])/gi, '').concat('$')
    else result.$regex = value.replace(/([*])/gi, '')

    return result
}

function addAccentsRegex(string) {
    return string.replace(/a/g, '[a,á,à,ä,â,ã]')
        .replace(/e/g, '[e,é,ë,ê]')
        .replace(/i/g, '[i,í,ï]')
        .replace(/o/g, '[o,ó,ö,ò,ô]')
        .replace(/u/g, '[u,ü,ú,ù]')
}

function parseDate(query, options) {
    const result = []
    if (query.start_at === 'today') query.start_at = normalizeDate(dateToString(new Date()), true)
    if (query.end_at === 'today') query.end_at = normalizeDate(dateToString(new Date()), false)
    if (query.period) {
        if (query.start_at) {
            let date_start = query.start_at
            // If the start_at is a datetime, its necessary convert to date format before get date end by period.
            if (isDateTime(date_start)) date_start = dateTimeToDate(date_start)

            result.push(
                processQuery(
                    options.date_fields.end_at,
                    'lt:'.concat(
                        normalizeDate(getDateEndByPeriod(query.period, new Date(date_start)), false))),
                processQuery(
                    options.date_fields.start_at,
                    'gte:'.concat(query.start_at)))
            return result
        }

        if (query.end_at) {
            let date_end = query.end_at
            // If the end_at is a datetime, its necessary convert to date format before get date start by period.
            if (isDateTime(date_end)) date_end = dateTimeToDate(date_end)

            result.push(
                processQuery(
                    options.date_fields.end_at,
                    'lt:'.concat(
                        isDate(query.end_at) ? normalizeDate(query.end_at, false) : query.end_at)),
                processQuery(
                    options.date_fields.start_at,
                    'gte:'.concat(getDateStartByPeriod(query.period, new Date(date_end)))))

            return result
        }

        let date_end = dateToString(new Date())

        result.push(
            processQuery(
                options.date_fields.end_at,
                'lt:'.concat(normalizeDate(date_end, false))),
            processQuery(
                options.date_fields.start_at,
                'gte:'.concat(
                    normalizeDate(getDateStartByPeriod(query.period, new Date(date_end)), true))))

        return result
    }

    if (query.start_at && (isDate(query.start_at) || isDateTime(query.start_at))) {
        if (query.end_at && (isDate(query.end_at) || isDateTime(query.end_at))) {
            result.push(
                processQuery(options.date_fields.end_at, 'lt:'.concat(query.end_at)))
        } else {
            result.push(
                processQuery(options.date_fields.end_at, 'lt:now'))
        }
        result.push(
            processQuery(options.date_fields.start_at, 'gte:'.concat(query.start_at)))
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
                (end_at.getDate() - onlyNumbers(period) + 1)))
        case 'w':
            return dateToString(new Date(
                end_at.getFullYear(),
                end_at.getMonth(),
                (end_at.getDate() - 7 * onlyNumbers(period) + 1)))
        case 'm':
            return dateToString(new Date(
                end_at.getFullYear(),
                (end_at.getMonth() - onlyNumbers(period)),
                end_at.getDate() + 1))
        case 'y':
            return dateToString(new Date(
                (end_at.getFullYear() - onlyNumbers(period)),
                end_at.getMonth(),
                end_at.getDate() + 1))
    }
}

function getDateEndByPeriod(period, start_at) {
    if (!(/^[0-9]{1,}[d|w|m|y]$/.test(period))) return dateToString(new Date())

    switch (period.slice(-1)) {
        case 'd':
            return dateToString(new Date(
                start_at.getFullYear(),
                start_at.getMonth(),
                (start_at.getDate() + onlyNumbers(period) + 1)))
        case 'w':
            return dateToString(new Date(
                start_at.getFullYear(),
                start_at.getMonth(),
                (start_at.getDate() + 7 * onlyNumbers(period) + 1)))
        case 'm':
            return dateToString(new Date(
                start_at.getFullYear(),
                (start_at.getMonth() + onlyNumbers(period)),
                start_at.getDate() + 1))
        case 'y':
            return dateToString(new Date(
                (start_at.getFullYear() + onlyNumbers(period)),
                start_at.getMonth(),
                start_at.getDate() + 1))
    }
}

function dateTimeToDate(date) {
    return date.substr(0, 10)
}

function dateToString(date) {
    return `${date.getFullYear()}-`
        .concat(`${(date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : '0'.concat((date.getMonth() + 1))}-`)
        .concat(`${date.getDate() > 9 ? date.getDate() : '0'.concat(date.getDate())}`)
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

function validate_filters(_values, _default) {
    return {
        ..._default, ..._values
    }
}

exports = module.exports = {
    filters: filters
}
