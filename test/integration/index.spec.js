const qs = require('../../index')
const expect = require('chai').expect
const request = require('supertest')
const express = require('express')
const app = express()

app.use(qs())

app.get('/', (req, res) => {
    res.status(200).send(req.query)
})


describe('queryFilter()', function () {
    beforeEach(function () {
    })

    context('when use default configurations', function () {
        context('when query is empty', function () {
            it('should return req.query as default middleware options', function (done) {
                request(app)
                    .get('/')
                    .then(res => {
                        validate(res.body, default_options)
                        done()
                    })
            })
        })

        context('when query contains pagination param as skip', function () {
            it('should return req.query with set pagination params', function (done) {

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.pagination.limit = 10
                options.default.pagination.skip = 2

                request(app)
                    .get('?limit=10&skip=2')
                    .then(res => {
                        validate(res.body, options)
                        done()
                    })
            })
        })

        context('when query contains pagination param with string limit as skip', function () {
            it('should return req.query with set pagination params', function (done) {
                const expect_pagination = {limit: Number.MAX_SAFE_INTEGER, skip: 2}

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.pagination.limit = expect_pagination.limit
                options.default.pagination.skip = expect_pagination.skip

                request(app)
                    .get('?limit=nine&skip=2')
                    .then(res => {
                        validate(res.body, options)
                        done()
                    })
            })
        })

        context('when query contains pagination param with string skip', function () {
            it('should return req.query with set pagination params', function (done) {
                const expect_pagination = {limit: 10, skip: 0}

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.pagination.limit = expect_pagination.limit
                options.default.pagination.skip = expect_pagination.skip

                request(app)
                    .get('?limit=10&skip=two')
                    .then(res => {
                        validate(res.body, options)
                        done()
                    })
            })
        })

        context('when query contains ordination param', function () {
            it('should return req.query with set ordination params', function (done) {
                const expect_sort = {name: 'asc', age: 'desc'}

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.sort = expect_sort

                request(app)
                    .get('?sort=name,-age')
                    .then(res => {
                        validate(res.body, options)
                        done()
                    })
            })
        })

        context('when query contains fields param', function () {
            it('should return req.query with set field params', function (done) {
                const expect_fields = {name: 1, age: 1}

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.fields = expect_fields

                request(app)
                    .get('?fields=name, age')
                    .then(res => {
                        validate(res.body, options)
                        done()
                    })
            })
        })

        context('when query contains simple filters param', function () {
            it('should return req.query with set field params', function (done) {
                const expect_filters = {name: 'lucas', age: 30}

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                request(app)
                    .get('?name=lucas&age=30')
                    .then(res => {
                        validate(res.body, options)
                        done()
                    })
            })
        })

        context('when query contains compose filters param', function () {
            it('should return req.query with set field params', function (done) {
                const expect_filters = {
                    '$and': [
                        {
                            name: {'$options': 'i', '$regex': '^lucas'}
                        },
                        {
                            name: {'$options': 'i', '$regex': 'douglas&'}
                        },
                        {
                            name: {'$options': 'i', '$regex': 'jorge'}
                        }],
                    'school.name': 'UEPB',
                    'timestamp': '2018-12-05T00:00:00',
                    '$or': [{job: 'Developer'}, {job: 'Engineer'}]
                }

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                const query = '?name=lucas******&name=******douglas&name=*****jorge********&.school.name.=UEPB' +
                    '&timestamp=2018-12-05&job=Developer,Engineer'
                request(app)
                    .get(query)
                    .then(res => {
                        validate(res.body, options)
                        done()
                    })
            })
        })

        context('when query contains equality filters param', function () {
            it('should return req.query with set field params', function (done) {
                const expect_filters = {
                    name: 'lucas',
                    age: {$gt: 30},
                    timestamp: {$gt: '2018-12-05T00:00:00'},
                    created_at: {$lte: '2018-12-06T00:00:00'},
                    sleep_hour: '22:40'
                }

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                const query = '?name=lucas&age=gt:30&timestamp=gt:2018-12-05&created_at=lte:2018-12-06'+
                    '&sleep_hour=22:40'

                request(app)
                    .get(query)
                    .then(res => {
                        validate(res.body, options)
                        done()
                    })
            })
        })
    })
})

/*

        context('when query contains date filters param', function () {
            it('should return req.query with set start_at params as today', function (done) {
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: new Date().toISOString()}},
                        {created_at: {$gte: new Date().toISOString()}}
                    ]
                }

                const query = {start_at: 'today'}
                const req = httpMocks.createRequest({method: 'GET', url: '/', query: query})
                const res = httpMocks.createResponse()

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                qs({})(req, res, function next() {
                    console.log(req.query)
                    validateFilterWithDate(req, options)
                })
                done()
            })
            it('should return req.query with set start_at params as date', function (done) {
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: new Date().toISOString()}},
                        {created_at: {$gte: '2018-12-05T00:00:00'}}
                    ]
                }

                const query = {start_at: '2018-12-05'}
                const req = httpMocks.createRequest({method: 'GET', url: '/', query: query})
                const res = httpMocks.createResponse()

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                qs({})(req, res, function next() {
                    validateFilterWithDate(req, options)
                })
                done()
            })

            it('should return req.query with set start_at params as dateTime', function (done) {
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: new Date().toISOString()}},
                        {created_at: {$gte: '2018-12-05T00:00:00'}}
                    ]
                }

                const query = {start_at: '2018-12-05T00:00:00'}
                const req = httpMocks.createRequest({method: 'GET', url: '/', query: query})
                const res = httpMocks.createResponse()

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                qs({})(req, res, function next() {
                    validateFilterWithDate(req, options)
                })
                done()
            })

            it('should return req.query with set start_at and end_at params as date', function (done) {

                const expect_filters = {
                    $and: [
                        {created_at: {$lt: '2018-12-11T00:00:00'}},
                        {created_at: {$gte: '2018-12-01T00:00:00'}}]
                }

                const query = {start_at: '2018-12-01', end_at: '2018-12-11'}
                const req = httpMocks.createRequest({method: 'GET', url: '/', query: query})
                const res = httpMocks.createResponse()

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                qs({})(req, res, function next() {
                    validateFilterWithDate(req, options)
                })
                done()
            })

            it('should return req.query with set start_at and end_at params as dateTime', function (done) {

                const expect_filters = {
                    $and: [
                        {created_at: {$lt: '2018-12-11T00:00:00'}},
                        {created_at: {$gte: '2018-12-01T00:00:00'}}]
                }

                const query = {start_at: '2018-12-01T00:00:00', end_at: '2018-12-11T00:00:00'}
                const req = httpMocks.createRequest({method: 'GET', url: '/', query: query})
                const res = httpMocks.createResponse()

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                qs({})(req, res, function next() {
                    validateFilterWithDate(req, options)
                })
                done()
            })

            it('should return req.query with set period and end_at param as dateTime', function (done) {
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: new Date('2018-12-09').toISOString()}},
                        {created_at: {$gte: new Date('2018-11-10').toISOString()}}
                    ]
                }
                const query = {period: '1m', end_at: '2018-12-09T00:00:00'}
                const req = httpMocks.createRequest({method: 'GET', url: '/', query: query})
                const res = httpMocks.createResponse()

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                qs({})(req, res, function next() {
                    validateFilterWithDate(req, options)
                })
                done()
            })

            it('should return req.query with set period as day params and end_at as today', function (done) {
                const now = new Date()
                const today = dateToString(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))
                const beforeToday = dateToString(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 9))
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: new Date(today).toISOString()}},
                        {created_at: {$gte: new Date(beforeToday).toISOString()}}
                    ]
                }

                const query = {period: '10d', end_at: 'today'}
                const req = httpMocks.createRequest({method: 'GET', url: '/', query: query})
                const res = httpMocks.createResponse()

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                qs({})(req, res, function next() {
                    validateFilterWithDate(req, options)
                })
                done()
            })

            it('should return req.query with set period as week params', function (done) {

                const now = new Date()
                const today = dateToString(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))
                const beforeToday = dateToString(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14))
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: new Date(today).toISOString()}},
                        {created_at: {$gte: new Date(beforeToday).toISOString()}}
                    ]
                }

                const query = {period: '2w'}
                const req = httpMocks.createRequest({method: 'GET', url: '/', query: query})
                const res = httpMocks.createResponse()

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                qs({})(req, res, function next() {
                    validateFilterWithDate(req, options)
                })
                done()
            })
            it('should return req.query with set period as month params', function (done) {

                const now = new Date()
                const today = dateToString(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))
                const beforeToday = dateToString(new Date(now.getFullYear(), (now.getMonth() - 1), now.getDate()))
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: new Date(today).toISOString()}},
                        {created_at: {$gte: new Date(beforeToday).toISOString()}}
                    ]
                }

                const query = {period: '1m'}
                const req = httpMocks.createRequest({method: 'GET', url: '/', query: query})
                const res = httpMocks.createResponse()

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                qs({})(req, res, function next() {
                    validateFilterWithDate(req, options)
                })
                done()
            })

            it('should return req.query with set period as year params', function (done) {

                const now = new Date()
                const today = dateToString(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))
                const beforeToday = dateToString(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()))
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: new Date(today).toISOString()}},
                        {created_at: {$gte: new Date(beforeToday).toISOString()}}
                    ]
                }

                const query = {period: '1y'}
                const req = httpMocks.createRequest({method: 'GET', url: '/', query: query})
                const res = httpMocks.createResponse()

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                qs({})(req, res, function next() {
                    validateFilterWithDate(req, options)
                })
                done()
            })

            it('should return req.query with today start_at for invalid period', function (done) {

                const now = new Date()
                const today = dateToString(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))
                const beforeToday = dateToString(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()))
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: new Date(today).toISOString()}},
                        {created_at: {$gte: new Date(beforeToday).toISOString()}}
                    ]
                }

                const query = {period: '12'}
                const req = httpMocks.createRequest({method: 'GET', url: '/', query: query})
                const res = httpMocks.createResponse()

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                qs({})(req, res, function next() {
                    validateFilterWithDate(req, options)
                })
                done()
            })
        })

        context('when use custom options', function () {
            context('when user doesnt pass custom configurations', function () {
                it('should return the default configurations', function (done) {
                    const custom_options = {
                        use_page: true
                    }

                    const expect_pagination = {
                        limit: Number.MAX_SAFE_INTEGER,
                        page: 1
                    }

                    const query = {}
                    const req = httpMocks.createRequest({method: 'GET', url: '/', query: query})
                    const res = httpMocks.createResponse()

                    const options = JSON.parse(JSON.stringify(default_options))
                    options.default.pagination.limit = expect_pagination.limit
                    options.default.pagination.page = expect_pagination.page
                    delete options.default.pagination.skip

                    qs(custom_options)(req, res, function next() {
                        validate(req, options)
                    })
                    done()
                })
            })

            context('when use pagination with skip without define limit', function () {
                it('should return pagination param with default limit', function (done) {
                    const custom_options = {
                        default: {
                            pagination: {
                                skip: 30,
                                page: 1
                            }
                        },
                        use_page: false
                    }

                    const expect_pagination = {
                        limit: Number.MAX_SAFE_INTEGER,
                        skip: 30
                    }

                    const query = {}
                    const req = httpMocks.createRequest({method: 'GET', url: '/', query: query})
                    const res = httpMocks.createResponse()

                    const options = JSON.parse(JSON.stringify(default_options))
                    options.default.pagination.limit = expect_pagination.limit
                    options.default.pagination.skip = expect_pagination.skip
                    delete options.default.pagination.page

                    qs(custom_options)(req, res, function next() {
                        validate(req, options)
                    })
                    done()
                })
            })

            context('when use pagination with page without define limit', function () {
                it('should return pagination param with default limit', function (done) {
                    const custom_options = {
                        default: {
                            pagination: {
                                page: 1
                            }
                        },
                        use_page: true
                    }

                    const expect_pagination = {
                        limit: Number.MAX_SAFE_INTEGER,
                        page: 1
                    }

                    const query = {}
                    const req = httpMocks.createRequest({method: 'GET', url: '/', query: query})
                    const res = httpMocks.createResponse()

                    const options = JSON.parse(JSON.stringify(default_options))
                    options.default.pagination.limit = expect_pagination.limit
                    options.default.pagination.page = expect_pagination.page
                    delete options.default.pagination.skip

                    qs(custom_options)(req, res, function next() {
                        validate(req, options)
                    })
                    done()
                })
            })

            context('when use pagination with page and query page is a string', function () {
                it('should return pagination param with default limit', function (done) {
                    const custom_options = {
                        default: {
                            pagination: {
                                limit: 100
                            }
                        },
                        use_page: true
                    }

                    const expect_pagination = {
                        limit: 100,
                        page: 1
                    }

                    const query = {page: 'two'}
                    const req = httpMocks.createRequest({method: 'GET', url: '/', query: query})
                    const res = httpMocks.createResponse()

                    const options = JSON.parse(JSON.stringify(default_options))
                    options.default.pagination.limit = expect_pagination.limit
                    options.default.pagination.page = expect_pagination.page
                    delete options.default.pagination.skip

                    qs(custom_options)(req, res, function next() {
                        validate(req, options)
                    })
                    done()
                })
            })

            context('when use pagination with skip', function () {
                it('should return pagination params as set', function (done) {
                    const custom_options = {
                        default: {
                            pagination: {
                                limit: 20,
                                skip: 30,
                                page: 1
                            }
                        },
                        use_page: false
                    }

                    const expect_pagination = {
                        limit: 20,
                        skip: 30
                    }

                    const query = {}
                    const req = httpMocks.createRequest({method: 'GET', url: '/', query: query})
                    const res = httpMocks.createResponse()

                    const options = JSON.parse(JSON.stringify(default_options))
                    options.default.pagination.limit = expect_pagination.limit
                    options.default.pagination.skip = expect_pagination.skip
                    delete options.default.pagination.page

                    qs(custom_options)(req, res, function next() {
                        validate(req, options)
                    })
                    done()
                })
            })

            context('when use pagination with page', function () {
                it('should return pagination params as set', function (done) {
                    const custom_options = {
                        default: {
                            pagination: {
                                limit: 100
                            }
                        },
                        use_page: true
                    }

                    const expect_pagination = {
                        limit: 100,
                        page: 1
                    }

                    const query = {}
                    const req = httpMocks.createRequest({method: 'GET', url: '/', query: query})
                    const res = httpMocks.createResponse()

                    const options = JSON.parse(JSON.stringify(default_options))
                    options.default.pagination.limit = expect_pagination.limit
                    options.default.pagination.page = expect_pagination.page
                    delete options.default.pagination.skip

                    qs(custom_options)(req, res, function next() {
                        validate(req, options)
                    })
                    done()
                })
            })

            context('when use sort', function () {
                it('should return sort param as set', function (done) {
                    const custom_options = {
                        default: {
                            sort: {name: 'asc', age: 'desc'}
                        },
                        use_page: false
                    }

                    var expect_sort = {
                        name: 'asc',
                        age: 'desc'
                    }

                    var query = {}
                    var req = httpMocks.createRequest({method: 'GET', url: '/', query: query})
                    var res = httpMocks.createResponse()

                    const options = JSON.parse(JSON.stringify(default_options))
                    options.default.sort = expect_sort

                    qs(custom_options)(req, res, function next() {
                        validate(req, options)
                    })
                    done()
                })
            })
        })
    })
})

function dateToString(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${formatDay(date.getDate())}`
}

function formatDay(day) {
    return day < 10 ? '0'.concat(day) : day
}

function validateFilterWithDate(req, options) {
    expect(req.query).is.not.null
    expect(req.query).is.not.eql({})
    expect(req.query.pagination.limit).to.eql(options.default.pagination.limit)
    expect(req.query.pagination.skip).to.eql(options.default.pagination.skip)
    expect(req.query.sort).to.eql(options.default.sort)
    expect(req.query.fields).to.eql(options.default.fields)
    expect(req.query.filters).to.have.property('$and')
}

*/


function validate(query, options) {
    expect(query).is.not.null
    expect(query).is.not.eql({})
    expect(query.pagination.limit).to.eql(options.default.pagination.limit)
    expect(query.pagination.skip).to.eql(options.default.pagination.skip)
    expect(query.sort).to.eql(options.default.sort)
    expect(query.fields).to.eql(options.default.fields)
    expect(query.filters).to.eql(options.default.filters)
}
