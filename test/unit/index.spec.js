const expect = require('chai').expect
const index = require('../../index')

describe('QueryString: Parsers', function () {
    describe('parseFields()', function () {
        context('when use parse without default fields', function () {
            it('should return parse query fields', function () {
                const query = '?fields=name,age,created_at'
                verifyFields(index.parseFields(query, {}))
            })
        })

        context('when query is passed as object', function () {
            it('should return parse query fields', function () {
                const query = {fields: 'name,age,created_at'}
                verifyFields(index.parseFields(query, {}))
            })
        })

        context('when use parse with default fields', function () {
            it('should return parse query fields merged with default fields', function () {
                const query = '?fields=name,age,created_at'
                const parsed_params = index.parseFields(query, {_id: 0})
                verifyFields(parsed_params)
                expect(parsed_params).to.have.property('_id')
                expect(parsed_params._id).to.eql(0)
            })
        })

    })

    describe('parseSort()', function () {
        context('when use parse without default sort', function () {
            it('should return parse query sort', function () {
                const query = '?sort=name,-age,created_at'
                verifySort(index.parseSort(query, {}))
            })
        })

        context('when query is passed as object', function () {
            it('should return parse query sort', function () {
                const query = {sort: 'name,-age,created_at'}
                verifySort(index.parseSort(query, {}))
            })
        })

        context('when use parse with default sort', function () {
            it('should return parse query sort merged with default sort', function () {
                const query = '?sort=name,-age,created_at'
                const parsed_params = index.parseSort(query, {_id: 'desc'})
                verifySort(index.parseSort(query, {_id: 'desc'}))
                expect(parsed_params).to.have.property('_id')
                expect(parsed_params._id).to.eql('desc')
            })
        })
    })

    describe('parsePagination()', function () {
        context('when use parse without default pagination', function () {
            it('should return parse query pagination', function () {
                const query = '?limit=20&page=3'
                verifyPage(index.parsePagination(query, {}, true))
            })
        })

        context('when query is passed as object', function () {
            it('should return parse query pagination', function () {
                const query = {limit: '20', page: '3'}
                verifyPage(index.parsePagination(query, {}, true))
            })
        })

        context('when use parse with default pagination', function () {
            it('should return parse query pagination', function () {
                const query = '?page=3'
                verifyPage(index.parsePagination(query, {limit: 20}, true))
            })
        })
    })

    describe('parseFilters()', function () {
        context('when use parse without default filters', function () {
            it('should return parse query filter', function () {
                const query = '?name=lucas&age=30'
                verifyFilter(index.parseFilter(query, {}))
            })
        })

        context('when query is passed as object', function () {
            it('should return parse query filter', function () {
                const query = {name: 'lucas', age: '30'}
                verifyFilter(index.parseFilter(query, {}))
            })
        })

        context('when use parse with default filters', function () {
            it('should return parse query filters merge with default filters', function () {
                const query = '?name=lucas&age=30'
                const result = index.parseFilter(query, {'job': 'Engineer'})
                verifyFilter(result)
                expect(result).to.have.property('job')
                expect(result.job).to.eql('Engineer')
            })
        })
    })

    describe('parseDate()', function () {
        context('when use parse without default date fields', function () {
            it('should return parse query date', function () {
                const query = '?start_at=2019-02-05T00:00:00&end_at=2019-02-05T23:59:59'
                verifyDate(index.parseDate(query, {}))
            })
        })

        context('when query is passed as object', function () {
            it('should return parse query date', function () {
                const query = {start_at: '2019-02-05T00:00:00', end_at: '2019-02-05T23:59:59'}
                verifyDate(index.parseDate(query, {}))
            })
        })

        context('when use parse with default date fields', function () {
            it('should return parse query date merge with default date', function () {
                const query = '?start_at=2019-02-05T00:00:00&end_at=2019-02-05T23:59:59'
                const result = index.parseDate(query, {start_at: 'created_at', end_at: 'created_at'})
                verifyDate(result)
            })
        })
    })

    describe('parser()', function () {
        context('when parser is used with defaults options', function () {
            it('should return object with fields, sort, filters, pagination and original query', function () {
                verifyParser(index.parser(''))
            })

            it('should return parse query fields', function () {
                const query = '?fields=name,age,created_at'
                verifyFields(index.parser(query).fields)
            })

            it('should return parse query sort', function () {
                const query = '?sort=name,-age,created_at'
                verifySort(index.parser(query).sort)
            })

            it('should return parse query pagination', function () {
                const query = '?limit=20&skip=3'
                const result = index.parser(query)
                expect(result.pagination).to.have.property('limit', 20)
                expect(result.pagination).to.have.property('skip', 3)
            })

            it('should return parse query filter', function () {
                const query = '?name=lucas&age=30'
                verifyFilter(index.parser(query).filters)
            })

            it('should return parse query date', function () {
                const query = '?start_at=2019-02-05T00:00:00&end_at=2019-02-05T23:59:59'
                verifyDate(index.parser(query).filters)
            })
        })

        context('when parser is used with custom options', function () {
            it('should return parse query fields merged with default fields', function () {
                const query = '?fields=name,age,created_at'
                const result = index.parser(query, {fields: {_id: 0}})
                verifyFields(result.fields)
                expect(result.fields).to.have.property('_id', 0)
            })

            it('should return parsing query classification merged with custom classification', function () {
                const query = '?sort=name,-age,created_at'
                const result = index.parser(query, {sort: {_id: -1}})
                expect(result.sort).to.have.property('_id', -1)
            })

            it('should return parse query pagination', function () {
                const query = '?page=3'
                verifyPage(index.parser(query,
                    {pagination: {limit: 20}},
                    {use_page: true}
                ).pagination)
            })

            it('should return parse query filters merge with custom filters', function () {
                const query = '?name=lucas&age=30'
                const result = index.parser(query, {filters: {'job': 'Engineer'}})
                verifyFilter(result.filters)
                expect(result.filters).to.have.property('job', 'Engineer')
            })

            it('should return parse query date merge with default date', function () {
                const query = '?start_at=2019-02-05T00:00:00&end_at=2019-02-05T23:59:59'
                const result = index.parser(
                    query,
                    {},
                    {date_fields: {start_at: 'timestamp', end_at: 'timestamp'}})
                expect(result.filters.$and[0]).to.have.all.keys('timestamp')
                expect(result.filters.$and[1]).to.have.all.keys('timestamp')
            })
        })
    })
})

function verifyFields(result) {
    expect(result).to.have.property('name')
    expect(result).to.have.property('age')
    expect(result).to.have.property('created_at')
    expect(result.name).to.eql(1)
    expect(result.age).to.eql(1)
    expect(result.created_at).to.eql(1)
}

function verifySort(result) {
    expect(result).to.have.property('name')
    expect(result).to.have.property('age')
    expect(result).to.have.property('created_at')
    expect(result.name).to.eql(1)
    expect(result.age).to.eql(-1)
    expect(result.created_at).to.eql(1)
}

function verifyPage(result) {
    expect(result).to.have.property('limit')
    expect(result).to.have.property('page')
    expect(result.limit).to.eql(20)
    expect(result.page).to.eql(3)
}

function verifyFilter(result) {
    expect(result).to.have.property('name')
    expect(result).to.have.property('age')
    expect(result.name).to.eql('lucas')
    expect(result.age).to.eql(30)
}

function verifyDate(result) {
    expect(result).to.have.property('$and')
    expect(result.$and).to.have.lengthOf(2)
    expect(result.$and[0]).to.have.all.keys('created_at')
    expect(result.$and[1]).to.have.all.keys('created_at')
}

function verifyParser(result) {
    expect(result).to.have.property('fields')
    expect(result).to.have.property('sort')
    expect(result).to.have.property('filters')
    expect(result).to.have.property('pagination')
    expect(result).to.have.property('original')
}
