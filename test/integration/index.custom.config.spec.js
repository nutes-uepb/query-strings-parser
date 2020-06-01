const qs = require('../../index')
const expect = require('chai').expect
const request = require('supertest')
const express = require('express')
const app = express()
const custom_options = {
    default: {
        pagination: {
            limit: 20,
            skip: 0,
            page: 1
        },
        fields: {},
        sort: {},
        filters: {}
    },
    use_page: true,
    client_db: 'mongodb',
    date_fields: {
        start_at: 'timestamp',
        end_at: 'timestamp'
    }
}

app.use(qs(custom_options))

app.get('/', (req, res) => {
    res.status(200).send(req.query)
})


describe('queryFilter()', function () {
    context('when use custom configurations', function () {
        context('when query is empty', function () {
            it('should return req.query as default middleware options', function () {
                return request(app)
                    .get('/')
                    .then(res => {
                        validate(res.body, custom_options)
                    })
            })
        })

        context('when use pagination with page without define limit', function () {
            it('should return pagination param with custom limit', function () {

                const expect_pagination = {
                    limit: 20,
                    page: 2
                }

                const options = JSON.parse(JSON.stringify(custom_options))
                options.default.pagination = expect_pagination

                const query = '?page=2'

                return request(app)
                    .get(query)
                    .then(res => {
                        validate(res.body, options)
                    })
            })
        })

        context('when use pagination with page without define page', function () {
            it('should return pagination param with default page', function () {

                const expect_pagination = {
                    limit: 40,
                    page: 1
                }

                const options = JSON.parse(JSON.stringify(default_options))
                options.default.pagination = expect_pagination

                const query = '?limit=40'

                return request(app)
                    .get(query)
                    .then(res => {
                        validate(res.body, options)
                    })
            })
        })

        context('when use pagination with page and query page and limit is not a number', function () {
            it('should return pagination param with default limit', function () {

                const expect_pagination = {
                    limit: 20,
                    page: 1
                }

                const options = JSON.parse(JSON.stringify(custom_options))
                options.default.pagination = expect_pagination

                const query = '?page=current&limit=teen'

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
    expect(query.pagination.page).to.eql(options.default.pagination.page)
    expect(query.sort).to.eql(options.default.sort)
    expect(query.fields).to.eql(options.default.fields)
    expect(query.filters).to.eql(options.default.filters)
}
