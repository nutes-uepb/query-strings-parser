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

    context('when use default configurations', function () {
        context('when query is empty', function () {
            it('should return req.query as default middleware options', function () {
                return request(app)
                    .get('/')
                    .then(res => {
                        validate(res.body, default_options)
                    })
            })
        })

        context('when query contains pagination param as skip', function () {
            it('should return req.query with set pagination params', function () {

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.pagination.limit = 10
                options.default.pagination.skip = 2

                const query = '?limit=10&skip=2'
                return request(app)
                    .get(query)
                    .then(res => {
                        validate(res.body, options)
                    })
            })
        })

        context('when query contains pagination param with string limit as skip', function () {
            it('should return req.query with set pagination params', function () {
                const expect_pagination = {limit: Number.MAX_SAFE_INTEGER, skip: 2}

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.pagination.limit = expect_pagination.limit
                options.default.pagination.skip = expect_pagination.skip

                const query = '?limit=teen&skip=2'

                return request(app)
                    .get(query)
                    .then(res => {
                        validate(res.body, options)
                    })
            })
        })

        context('when query contains pagination param with string skip', function () {
            it('should return req.query with set pagination params', function () {
                const expect_pagination = {limit: 10, skip: 0}

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.pagination.limit = expect_pagination.limit
                options.default.pagination.skip = expect_pagination.skip

                const query = '?limit=10&skip=two'

                return request(app)
                    .get(query)
                    .then(res => {
                        validate(res.body, options)
                    })
            })
        })

        context('when query contains ordination param', function () {
            it('should return req.query with set ordination params', function () {
                const expect_sort = {name: 1, age: -1}

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.sort = expect_sort

                const query = '?sort=name,-age'

                return request(app)
                    .get(query)
                    .then(res => {
                        validate(res.body, options)
                    })
            })
        })

        context('when query contains fields param', function () {
            it('should return req.query with set field params', function () {
                const expect_fields = {name: 1, age: 1}

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.fields = expect_fields

                const query = '?fields=name, age'

                return request(app)
                    .get(query)
                    .then(res => {
                        validate(res.body, options)
                    })
            })
        })

        context('when query contains simple filters param', function () {
            it('should return req.query with set field params', function () {
                const expect_filters = {name: 'lucas', age: 30}

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                const query = '?name=lucas&age=30'

                return request(app)
                    .get(query)
                    .then(res => {
                        validate(res.body, options)
                    })
            })
        })

        context('when query contains compose filters param', function () {
            it('should return req.query with set field params', function () {
                const expect_filters = {
                    '$and': [
                        {
                            name: { '$options': 'i', '$regex': '^l[u,ü,ú,ù]c[a,á,à,ä,â,ã]s' }
                        },
                        {
                            name: { '$options': 'i', '$regex': 'd[o,ó,ö,ò,ô][u,ü,ú,ù]gl[a,á,à,ä,â,ã]s$' }
                        },
                        {
                            name: { '$options': 'i', '$regex': 'j[o,ó,ö,ò,ô]rg[e,é,ë,ê]' }
                        }],
                    'school.name': 'UEPB',
                    'timestamp': '2018-12-05T00:00:00',
                    '$or': [{job: 'Developer'}, {job: 'Engineer'}]
                }

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                const query = '?name=lucas****&name=*****douglas&name=*****jorge*****&.school.name.=UEPB'
                    .concat('&timestamp=2018-12-05&job=Developer,Engineer')

                return request(app)
                    .get(query)
                    .then(res => {
                        validate(res.body, options)
                    })
            })
        })

        context('when query contains equality filters param', function () {
            it('should return req.query with set field params', function () {
                const expect_filters = {
                    name: 'lucas',
                    age: {$gt: 30},
                    timestamp: {$gt: '2018-12-05T00:00:00'},
                    created_at: {$lte: '2018-12-06T00:00:00'},
                    sleep_hour: '22:40'
                }


                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                const query = '?name=lucas&age=gt:30&timestamp=gt:2018-12-05&created_at=lte:2018-12-06&sleep_hour=22:40'

                return request(app)
                    .get(query)
                    .then(res => {
                        validate(res.body, options)
                    })
            })
        })

        context('when query contains date filters param', function () {
            it('should return req.query with set start_at params as today', function () {
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: normalizeDate(dateToString(new Date()), false)}},
                        {created_at: {$gte: normalizeDate(dateToString(new Date()), true)}}
                    ]
                }

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                const query = '?start_at=today'

                return request(app)
                    .get(query)
                    .then(res => {
                        validate(res.body, options)
                    })
            })

            it('should return req.query with set end_at params as today', function () {
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: normalizeDate(dateToString(new Date()), false)}},
                        {created_at: {$gte: '2019-02-05T00:00:00'}}
                    ]
                }

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                const query = '?start_at=2019-02-05&end_at=today'

                return request(app)
                    .get(query)
                    .then(res => {
                        validate(res.body, options)
                    })
            })

            it('should return req.query with set start_at params as date', function () {
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: normalizeDate(dateToString(new Date()), false)}},
                        {created_at: {$gte: '2018-12-05T00:00:01'}}
                    ]
                }

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                const query = '?start_at=2018-12-05T00:00:01'

                return request(app)
                    .get(query)
                    .then(res => {
                        validate(res.body, options)
                    })

            })

            it('should return req.query with set start_at params as dateTime', function () {
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: normalizeDate(dateToString(new Date()), false)}},
                        {created_at: {$gte: '2018-12-05T00:00:00'}}
                    ]
                }

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                const query = '?start_at=2018-12-05T00:00:00'

                return request(app)
                    .get(query)
                    .then(res => {
                        validate(res.body, options)
                    })
            })

            it('should return req.query with set start_at and end_at params as date', function () {

                const expect_filters = {
                    $and: [
                        {created_at: {$lt: '2018-12-11T00:00:00'}},
                        {created_at: {$gte: '2018-12-01T00:00:00'}}]
                }


                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                const query = '?start_at=2018-12-01&end_at=2018-12-11'

                return request(app)
                    .get(query)
                    .then(res => {
                        validate(res.body, options)
                    })
            })

            it('should return req.query with set start_at and end_at params as dateTime', function () {

                const expect_filters = {
                    $and: [
                        {created_at: {$lt: '2018-12-11T03:02:01'}},
                        {created_at: {$gte: '2018-12-01T01:02:03'}}]
                }

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                const query = '?start_at=2018-12-01T01:02:03&&end_at=2018-12-11T03:02:01'

                return request(app)
                    .get(query)
                    .then(res => {
                        validate(res.body, options)
                    })
            })

            it('should return req.query with period as day and start_at param', function () {
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: '2019-01-26T23:59:59'}},
                        {created_at: {$gte: '2019-01-24T00:00:00'}}
                    ]
                }

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                const query = '?period=2d&start_at=2019-01-24'

                return request(app)
                    .get(query)
                    .then(res => {
                        validateWithPeriod(res.body, options)
                    })
            })

            it('should return req.query with period as day and end_at param', function () {
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: '2019-01-26T00:00:00'}},
                        {created_at: {$gte: '2019-01-24T00:00:00'}}
                    ]
                }

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                const query = '?period=2d&end_at=2019-01-26T00:00:00'

                return request(app)
                    .get(query)
                    .then(res => {
                        validateWithPeriod(res.body, options)
                    })
            })

            it('should return req.query with period as week and start_at param', function () {
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: '2019-01-26T23:59:59'}},
                        {created_at: {$gte: '2019-01-19T00:00:00'}}
                    ]
                }

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                const query = '?period=1w&start_at=2019-01-19'

                return request(app)
                    .get(query)
                    .then(res => {
                        validateWithPeriod(res.body, options)
                    })
            })

            it('should return req.query with period as week and end_at param', function () {
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: '2019-01-26T23:59:59'}},
                        {created_at: {$gte: '2019-01-19T00:00:00'}}
                    ]
                }

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                const query = '?period=1w&end_at=2019-01-26'

                return request(app)
                    .get(query)
                    .then(res => {
                        validateWithPeriod(res.body, options)
                    })
            })

            it('should return req.query with period as month and start_at param', function () {
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: '2019-02-24T23:59:59'}},
                        {created_at: {$gte: '2019-01-24T00:00:00'}}
                    ]
                }

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                const query = '?period=1m&start_at=2019-01-24'

                return request(app)
                    .get(query)
                    .then(res => {
                        validateWithPeriod(res.body, options)
                    })
            })

            it('should return req.query with period as month and end_at param', function () {
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: '2019-01-24T23:59:59'}},
                        {created_at: {$gte: '2018-12-24T00:00:00'}}
                    ]
                }

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                const query = '?period=1m&end_at=2019-01-24'

                return request(app)
                    .get(query)
                    .then(res => {
                        validateWithPeriod(res.body, options)
                    })
            })

            it('should return req.query with period as year and start_at param', function () {
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: '2019-02-24T23:59:59'}},
                        {created_at: {$gte: '2018-02-24T00:00:00'}}
                    ]
                }

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                const query = '?period=1y&start_at=2018-02-24'

                return request(app)
                    .get(query)
                    .then(res => {
                        validateWithPeriod(res.body, options)
                    })
            })

            it('should return req.query with period as year and end_at param', function () {
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: '2019-02-24T23:59:59'}},
                        {created_at: {$gte: '2018-02-24T00:00:00'}}
                    ]
                }

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                const query = '?period=1y&end_at=2019-02-24'

                return request(app)
                    .get(query)
                    .then(res => {
                        validateWithPeriod(res.body, options)
                    })
            })

            it('should return req.query with today start_at for invalid period', function () {
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: normalizeDate(dateToString(new Date()), false)}},
                        {created_at: {$gte: normalizeDate(dateToString(new Date()), true)}}
                    ]
                }

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                const query = '?period=12'

                return request(app)
                    .get(query)
                    .then(res => {
                        validate(res.body, options)
                    })
            })

            it('should return req.query with today end_at for invalid period', function () {
                const expect_filters = {
                    $and: [
                        {created_at: {$lt: normalizeDate(dateToString(new Date()), false)}},
                        {created_at: {$gte: '2018-12-05T00:00:01'}}
                    ]
                }

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.filters = expect_filters

                const query = '?period=12&start_at=2018-12-05T00:00:01'

                return request(app)
                    .get(query)
                    .then(res => {
                        validate(res.body, options)
                    })
            })
        })
    })
})


function validate(query, options) {
    expect(query).is.not.eql({})
    expect(query.pagination.limit).to.eql(options.default.pagination.limit)
    expect(query.pagination.skip).to.eql(options.default.pagination.skip)
    expect(query.sort).to.eql(options.default.sort)
    expect(query.fields).to.eql(options.default.fields)
    expect(query.filters).to.eql(options.default.filters)
}

function validateWithPeriod(query, options) {
    expect(query).is.not.eql({})
    expect(query.pagination.limit).to.eql(options.default.pagination.limit)
    expect(query.pagination.skip).to.eql(options.default.pagination.skip)
    expect(query.sort).to.eql(options.default.sort)
    expect(query.fields).to.eql(options.default.fields)
    expect(query.filters).to.have.property('$and')
}

function normalizeDate(date, isDateStart) {
    if (isDateStart) {
        return date.replace(/\D/g, '').replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3T00:00:00')
    }
    return date.replace(/\D/g, '').replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3T23:59:59')
}

function dateToString(date) {
    return `${date.getFullYear()}-`
        .concat(`${(date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : '0'.concat((date.getMonth() + 1))}-`)
        .concat(`${date.getDate() > 9 ? date.getDate() : '0'.concat(date.getDate())}`)
}
