const expect = require('chai').expect
const filter = require('../../lib/mapper/filters')


describe('QueryString: Filters', function () {

    context('when query filters are string/number parameters', function () {
        it('should return a JSON with filter params', function (done) {
            verify(filter.filter({ name: 'lucas', age: 30 }, default_options))
            done()
        })
    })

    context('when query filter key contains blank space', function () {
        it('should return a JSON with filter params, ignoring blank spaces', function (done) {
            verify(filter.filter({ ' na  me   ': 'lucas', age: 30 }, default_options))
            done()
        })
    })

    context('when query filter key contains special characteres', function () {
        it('should return a JSON with filter params, ignoring the special characteres', function (done) {
            verify(filter.filter({ '#(@@$na%me!?': 'lucas', age: 30 }, default_options))
            done()
        })
    })

    context('when use the default options without query', function () {
        it('should return a JSON with default filter params', function (done) {
            var result = filter.filter({}, default_options)
            expect(result).is.not.null
            expect(result).to.eql(default_options.default.filters)
            done()
        })
    })
})

function verify(result) {
    expect(result).is.not.null
    expect(result).to.have.property('name')
    expect(result).to.have.property('age')
    expect(result.name).to.eql('lucas')
    expect(result.age).to.eql(30)
}