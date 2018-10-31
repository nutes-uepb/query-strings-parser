function ordination(query, options) {
    const result = {}
    if (query.sort) {
        if (query.sort instanceof Array) {
            query.sort.forEach(function (elem) {
                Object.assign(result, processQuery(elem))
            })
            return result
        }
        return processQuery(query.sort)
    }
    return options.default.sort
}

function processQuery(query) {
    const result = {}
    query = query.replace(/([^\w\s,-])|(\s{1,})/gi, '')
    query.split(',').forEach(function (elem) {
        elem = elem.trim()
        if (elem[0] === '-') result[elem.substr(1)] = 'desc'
        else result[elem] = 'asc'
    })
    return result
}

module.exports = {
    sort: ordination
}
