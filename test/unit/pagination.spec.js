const expect = require('chai').expect
const pagination = require('../../lib/mapper/pagination')

describe('QueryString: Pagination', function () {

    context('when page query contains limit and page params as string', function () {
        it('should return a JSON with pagination fields', function (done) {
            default_options.use_page = true
            var result = pagination.pagination({limit: '10', page: '3'}, default_options)
            verifyPage(result)
            expect(result.limit).to.eql(10)
            expect(result.page).to.eql(3)
            done()
        })
    })

    context('when page query contains limit and skip params as string', function () {
        it('should return a JSON with pagination fields', function (done) {
            default_options.use_page = false
            const result = pagination.pagination({limit: '10', skip: '20'}, default_options)
            verifySkip(result)
            expect(result.limit).to.eql(10)
            expect(result.skip).to.eql(20)
            done()
        })
    })

    context('when page query contains only page param as string', function () {
        it('should return a JSON with pagination fields, with limit equals 2^53-1', function (done) {
            default_options.use_page = true
            const result = pagination.pagination({page: '3'}, default_options)
            verifyPage(result)
            expect(result.limit).to.eql(Number.MAX_SAFE_INTEGER)
            expect(result.page).to.eql(3)
            done()
        })
    })

    context('when page query contains only skip param as string', function () {
        it('should return a JSON with pagination fields, with limit equals 2^53-1', function (done) {
            default_options.use_page = false
            const result = pagination.pagination({skip: '10'}, default_options)
            verifySkip(result)
            expect(result.limit).to.eql(Number.MAX_SAFE_INTEGER)
            expect(result.skip).to.eql(10)
            done()
        })
    })

    context('when page query contains limit and page params as array', function () {
        it('should return a JSON with pagination fields', function (done) {
            default_options.use_page = true
            const result = pagination.pagination({limit: ['10', '2'], page: ['3', '4']}, default_options)
            verifyPage(result)
            expect(result.limit).to.eql(10)
            expect(result.page).to.eql(3)
            done()
        })
    })

    context('when page query contains limit and skip params as array', function () {
        it('should return a JSON with pagination fields', function (done) {
            default_options.use_page = false
            const result = pagination.pagination({limit: ['10', '2'], skip: ['20', '30']}, default_options)
            verifySkip(result)
            expect(result.limit).to.eql(10)
            expect(result.skip).to.eql(20)
            done()
        })
    })

    context('when page query contains only page param as array', function () {
        it('should return a JSON with pagination fields, with limit equals 2^53-1', function (done) {
            default_options.use_page = true
            const result = pagination.pagination({page: ['3', '4']}, default_options)
            verifyPage(result)
            expect(result.limit).to.eql(Number.MAX_SAFE_INTEGER)
            expect(result.page).to.eql(3)
            done()
        })
    })

    context('when page query contains only skip param as array', function () {
        it('should return a JSON with pagination fields, with limit equals 2^53-1', function (done) {
            default_options.use_page = false
            const result = pagination.pagination({skip: ['10', '20']}, default_options)
            verifySkip(result)
            expect(result.limit).to.eql(Number.MAX_SAFE_INTEGER)
            expect(result.skip).to.eql(10)
            done()
        })
    })

    context('when page query contains blank space in page param', function () {
        it('should return a JSON with pagination fields, ignoring the blank space', function (done) {
            default_options.use_page = true
            const result = pagination.pagination({limit: '10', page: '  3         '}, default_options)
            verifyPage(result)
            expect(result.limit).to.eql(10)
            expect(result.page).to.eql(3)
            done()
        })
    })

    context('when page query contains blank space in skip param', function () {
        it('should return a JSON with pagination fields, ignoring the blank space', function (done) {
            default_options.use_page = false
            const result = pagination.pagination({limit: '10', skip: '  20         '}, default_options)
            verifySkip(result)
            expect(result.limit).to.eql(10)
            expect(result.skip).to.eql(20)
            done()
        })
    })

    context('when page query contains special character or letters in page param', function () {
        it('should return a JSON with pagination fields, ignoring the special character', function (done) {
            default_options.use_page = true
            const result = pagination.pagination({limit: '10', page: '3$@#!@%+*&Asadas'}, default_options)
            verifyPage(result)
            expect(result.limit).to.eql(10)
            expect(result.page).to.eql(3)
            done()
        })
    })

    context('when page query contains special character or letters in skip param', function () {
        it('should return a JSON with pagination fields, ignoring the special character', function (done) {
            default_options.use_page = false
            const result = pagination.pagination({limit: '10', skip: '20$@#!@%+*&Asadas'}, default_options)
            verifySkip(result)
            expect(result.limit).to.eql(10)
            expect(result.skip).to.eql(20)
            done()
        })
    })

    context('when use the default options without query', function () {
        it('should return a JSON with default params', function (done) {
            const result = pagination.pagination({}, default_options)
            verifySkip(result)
            expect(result.limit).to.eql(default_options.default.pagination.limit)
            expect(result.skip).to.eql(default_options.default.pagination.skip)
            done()
        })
    })

    context('when use custom options without query with limit and skip params', function () {
        it('should return a JSON with custom params', function (done) {
            const custom_options = {
                default: {
                    pagination: {
                        limit: 15,
                        skip: 10
                    }
                },
                use_page: false
            }
            const result = pagination.pagination({}, custom_options)
            verifySkip(result)
            expect(result.limit).to.eql(15)
            expect(result.skip).to.eql(10)
            done()
        })
    })

    context('when use custom params', function () {
        it('should return a JSON with custom params', function (done) {
            const custom_options = {
                default: {
                    pagination: {
                        limit: 15,
                        page: 2
                    }
                },
                use_page: true
            }
            const result = pagination.pagination({}, custom_options)
            verifyPage(result)
            expect(result.limit).to.eql(15)
            expect(result.page).to.eql(2)
            done()
        })

        it('should return a JSON with custom parameters and those of the query', function (done) {
            const custom_options = {
                default: {
                    pagination: {
                        limit: 50,
                        page: 5
                    }
                },
                use_page: true
            }
            const result = pagination.pagination({page: '3', limit: '10'}, custom_options)
            verifyPage(result)
            expect(result.limit).to.eql(10)
            expect(result.page).to.eql(3)
            done()
        })
    })
})

function verifySkip(result) {
    expect(result).to.have.property('limit')
    expect(result).to.have.property('skip')
}

function verifyPage(result) {
    expect(result).to.have.property('limit')
    expect(result).to.have.property('page')
}
