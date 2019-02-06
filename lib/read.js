'use strict'

const url = require('url')
const pagination = require('./mapper/pagination')
const fields = require('./mapper/fields')
const ordination = require('./mapper/ordination')
const filters = require('./mapper/filters')

function init_default() {
    return {
        default: {
            pagination: {
                limit: Number.MAX_SAFE_INTEGER,
                skip: 0,
                page: 1
            },
            fields: {},
            sort: {},
            filters: {}
        },
        use_page: false,
        client_db: 'mongodb',
        date_fields: {
            start_at: 'created_at',
            end_at: 'created_at'
        }
    }
}

exports = module.exports.parser = function (params) {
    return function (req, res, next) {
        const options = validate_options(params)
        req.query = {
            'original': req.url,
            'pagination': pagination.pagination(req.query, options),
            'fields': fields.fields(req.query, options),
            'sort': ordination.sort(req.query, options),
            'filters': filters.filters(req.query, options)
        }
        next()
    }
}

function validate_options(params) {
    const options = init_default()
    if (typeof params === 'object' && Object.keys(params).length > 0) {
        if (params.default) {
            if (params.default.pagination) {
                options.default.pagination.limit = params.default.pagination.limit || options.default.pagination.limit
                options.default.pagination.skip = params.default.pagination.skip || options.default.pagination.skip
                options.default.pagination.page = params.default.pagination.page || options.default.pagination.page
            }
            options.default.fields = params.default.fields || options.default.fields
            options.default.sort = params.default.sort || options.default.sort
            options.default.filters = params.default.filters || options.default.filters
        }
        options.use_page = params.use_page || options.use_page
        options.client_db = params.client_db || options.client_db
        if (params.date_fields) {
            options.date_fields.start_at = params.date_fields.start_at || options.date_fields.start_at
            options.date_fields.end_at = params.date_fields.end_at || options.date_fields.end_at
        }
    }
    return options
}

exports = module.exports.parseFields = function (query, fields_default) {
    const options = validate_options({'default': {'fields': fields_default}})
    return fields.fields(stringToJson(query), options)
}

exports = module.exports.parseSort = function (query, sort_default) {
    const options = validate_options({'default': {'sort': sort_default}})
    return ordination.sort(stringToJson(query), options)
}

exports = module.exports.parsePagination = function (query, pagination_default, use_page) {
    const options = validate_options({
        'default': {'pagination': pagination_default},
        'use_page': use_page
    })
    return pagination.pagination(stringToJson(query), options)
}

exports = module.exports.parseFilter = function (query, filters_default, date_fields) {
    const options = validate_options({'default': {'filters': filters_default}, 'date_fields': date_fields})
    return filters.filters(stringToJson(query), options)
}

exports = module.exports.parseDate = function (query, date_fields) {
    const options = validate_options({'date_fields': date_fields})
    return filters.filters(stringToJson(query), options)
}

function stringToJson(query) {
    if (typeof query === 'string') return url.parse(query, true).query
    return query
}