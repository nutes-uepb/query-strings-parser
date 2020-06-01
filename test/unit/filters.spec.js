const expect = require('chai').expect
const filter = require('../../lib/mapper/filters')


describe('QueryString: Filters', function () {

    context('when query filters are string/number parameters', function () {
        it('should return a JSON with filters params', function (done) {
            verify(filter.filters({name: 'lucas', age: '30'}, default_options))
            done()
        })
    })

    context('when query filters its a object', function () {
        it('should ignore the object param and returns another filters', function () {
            verify(filter.filters({job: {first: 'developer'}, name: 'lucas', age: '30'}, default_options))
        })
    })

    context('when query filters key contains blank space', function () {
        it('should return a JSON with filters params, ignoring blank spaces', function (done) {
            verify(filter.filters({' na  me   ': 'lucas', age: '30'}, default_options))
            done()
        })
    })

    context('when query filters key contains special characters', function () {
        it('should return a JSON with filters params, ignoring the special characteres', function (done) {
            verify(filter.filters({'#(@@$na%me!?': 'lucas', age: '30'}, default_options))
            done()
        })
    })

    context('when use the default options', function () {
        it('should return a JSON with default filters params', function (done) {
            const result = filter.filters({}, default_options)
            expect(result).to.eql(default_options.default.filters)
            done()
        })

        it('should return a JSON with default filters params and those of the query', function (done) {
            const options = {
                ...default_options, ...{
                    default: {filters: {age: '19', name: 'John'}}
                }
            }
            const result = filter.filters({age: '21'}, options)
            expect(result.name).to.eql(options.default.filters.name)
            expect(result.age).to.eql(21)
            done()
        })
    })
})

function verify(result) {
    expect(result).to.have.property('name')
    expect(result).to.have.property('age')
    expect(result.name).to.eql('lucas')
    expect(result.age).to.eql(30)
}
