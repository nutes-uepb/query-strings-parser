'use strict'

function fields(query, options) {
    if (query.fields) {
        if (query.fields instanceof Array) {
            return processQuery(query.fields.join(','))
        }
        return processQuery(query.fields)
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

exports = module.exports = {
    fields: fields
}

