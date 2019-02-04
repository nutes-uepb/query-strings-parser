'use strict'

function fields(query, options) {
    var result = {}
    if (query.fields) {
        if (query.fields instanceof Array) {
            result = processQuery(query.fields.join(','))
        } else {
            result = processQuery(query.fields)
        }
        return validate_fields(result, options.default.fields)
    }
    return options.default.fields
}

function processQuery(query) {
    query = query.replace(/([^\w\s,.])|(\s{1,})|(^\.{1,})|\.{1,}$/gi, '')
    var elems = {}
    query.split(',').forEach(elem => {
        if (elem) {
            elems[elem] = 1
        }
    })
    return elems
}

function validate_fields(_values, _default) {
    return {..._values, ..._default}
}

exports = module.exports = {
    fields: fields
}

