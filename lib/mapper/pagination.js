function pagination(query, options) {
    const result = {}
    result.limit = options.default.pagination.limit

    if (query.limit) {
        result.limit = processQuery(query.limit) || options.default.pagination.limit
    }

    if (options.use_page) {
        result.page = options.default.pagination.page
        if (query.page) {
            result.page = processQuery(query.page) || options.default.pagination.page
        }
    } else {
        result.skip = options.default.pagination.skip
        if (query.skip) {
            result.skip = processQuery(query.skip) || options.default.pagination.skip
        }
    }

    return result
}

function processQuery(query) {
    if (query instanceof Array) {
        query = query[0]
    }
    return parseInt(query.replace(/([^\d\s])|(\s{1,})/gi, ''))
}

exports = module.exports = {
    pagination: pagination
}

