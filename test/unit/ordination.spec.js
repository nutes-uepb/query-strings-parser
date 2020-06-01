const expect = require('chai').expect
const ordination = require('../../lib/mapper/ordination')

describe('QueryString: Ordination', function () {

    context('when ordination query is a simple string', function () {
        it('should return a JSON with order params', function (done) {
            verify(ordination.sort({sort: '-name,age,created_at'}, default_options))
            done()
        })
    })

    context('when ordination query is an array of strings', function () {
        it('should return a JSON with order params', function (done) {
            verify(ordination.sort({sort: ['-name,age', 'created_at']}, default_options))
            done()
        })
    })

    context('when there are blank spaces between ordination query', function () {
        it('should return a JSON with order params, ignoring the blank space', function (done) {
            verify(ordination.sort({sort: '-na  m e,  age, cr  eat   ed_at'}, default_options))
            done()
        })
    })

    context('when there are null fields in ordination query', function () {
        it('should return a JSON with order params, ignoring the null fields', function (done) {
            verify(ordination.sort({sort: ',,,,,-name,,,,age,,,created_at,,,,,,,'}, default_options))
            done()
        })
    })

    context('when there are special characters in ordination query', function () {
        it('should return a JSON with order params, ignoring the special characteres', function (done) {
            verify(ordination.sort({sort: '-$%n@am#$e??,!!ag%e,c***r$@$eated_at'}, default_options))
            done()
        })

    })

    context('when use the default options without query', function () {
        it('should return a JSON with default ordination params', function (done) {
            const result = ordination.sort({}, default_options)
            expect(result).is.not.null
            expect(result).to.eql({})
            done()
        })
    })

    context('when use custom params', function () {
        it('should return a JSON with custom params', function () {
            const custom_options = {default: {sort: {created_at: 1}}}
            const result = ordination.sort({}, custom_options)
            expect(result.created_at).to.eql(1)
        })

        it('should return a JSON with custom parameters and those of the query', function () {
            const custom_options = {default: {sort: {created_at: 1}}}
            const result = ordination.sort({sort: '-created_at,-age,name'}, custom_options)
            expect(result.created_at).to.eql(-1)
            expect(result.age).to.eql(-1)
            expect(result.name).to.eql(1)
        })
    })
})

function verify(result) {
    expect(result.name).to.eql(-1)
    expect(result.age).to.eql(1)
    expect(result.created_at).to.eql(1)

}
