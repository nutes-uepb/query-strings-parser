const pagination = require('./mapper/pagination')
const fields = require('./mapper/fields')
const ordination = require('./mapper/ordination')
const filters = require('./mapper/filters')

var options = {}

function filter(req, res, next) {
    const default_query = {
        'pagination': pagination.pagination(req.query, options),
        'fields': fields.fields(req.query, options),
        'sort': ordination.sort(req.query, options),
        'filters': filters.filter(req.query, options)
    }
    req.query = default_query
    next()
}

exports.options = function (params) {
    return function (req, res, next) {
        if (typeof params === 'object' && Object.keys(params).length > 0) {
            if (params.default.pagination) {
                options.default.pagination.limit = params.default.pagination.limit || options.default.pagination.limit
                options.default.pagination.skip = params.default.pagination.skip || options.default.pagination.skip
                options.default.pagination.page = params.default.pagination.page || options.default.pagination.page
            }
            options.default.fields = params.default.fields || options.default.fields
            options.default.sort = params.default.sort || options.default.sort
            options.default.filters = params.default.filters || options.default.filters
            options.use_page = params.use_page || options.use_page
            options.client_db = params.client_db || options.client_db
        }
        return filter(req, res, next)
    }
}

exports.set_default = function () {
    options = {
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
        client_db: 'mongodb'
    }
}
