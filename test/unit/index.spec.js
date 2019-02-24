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

        context('when use parse with defualt date fields', function () {
            it('should return parse query date merge with default date', function () {
                const query = '?start_at=2019-02-05T00:00:00&end_at=2019-02-05T23:59:59'
                const result = index.parseDate(query, {start_at: 'created_at', end_at: 'created_at'})
                verifyDate(result)
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
    expect(result.name).to.eql('asc')
    expect(result.age).to.eql('desc')
    expect(result.created_at).to.eql('asc')
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