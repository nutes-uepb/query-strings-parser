const expect = require('chai').expect
const filter = require('../../lib/mapper/filters')


describe('QueryString: Filters', function () {

    context('when query filters are string/number parameters', function () {
        it('should return a JSON with filters params', function (done) {
            verify(filter.filters({ name: 'lucas', age: '30' }, default_options))
            done()
        })
    })

    context('when query filters contains an integer with a leading zero', function () {
        it('should return a JSON with filters params, keeping the leading zero of the number as string', function (done) {
            const VALUE = '009'
            const result = filter.filters({ value: VALUE }, default_options)
            expect(result).to.have.property('value', VALUE)
            done()
        })
    })

    context('when query filters contains an integer that exceeds max safe integer', function () {
        it('should return a JSON with filters params containing the number as string', function (done) {
            const VALUE = '9007199254740999'
            const result = filter.filters({ value: VALUE }, default_options)
            expect(result).to.have.property('value', VALUE)
            done()
        })
    })

    context('when query filters its a object', function () {
        it('should ignore the object param and returns another filters', function () {
            verify(filter.filters({ job: { first: 'developer' }, name: 'lucas', age: '30' }, default_options))
        })
    })

    context('when query filters have multiple values for multiple fields (status and sourcehealthentity_id)', function () {
        it('should return a JSON with filter parameters containing a $AND filter with multiple $OR filters', function (done) {
            const bedId = generateObjectId()
            const requestStatusList = 'regulated,'
            const sourceHealthEntityIds = `${generateObjectId()},${generateObjectId()}`
            const result = filter.filters({
                bed_id: bedId, status: requestStatusList, sourcehealthentity_id: sourceHealthEntityIds
            }, default_options)

            expect(result).to.have.property('$and')
            expect(result['$and']).to.eql([
                { '$or': [{ status: requestStatusList.split(',')[0] }, { status: requestStatusList.split(',')[1] }] },
                {
                    '$or': [
                        { sourcehealthentity_id: sourceHealthEntityIds.split(',')[0] },
                        { sourcehealthentity_id: sourceHealthEntityIds.split(',')[1] }
                    ]
                }])
            expect(result.bed_id).to.eql(bedId)

            done()
        })
    })

    context('when query filters have multiple values for one field (status)', function () {
        it('should return a JSON with filter parameters containing a $OR filter with multiple values', function (done) {
            const bedId = generateObjectId()
            const requestStatusList = 'regulated,'
            const sourceHealthEntityId = generateObjectId()
            const result = filter.filters({
                bed_id: bedId, status: requestStatusList, sourcehealthentity_id: sourceHealthEntityId
            }, default_options)
            expect(result).to.not.have.property('$and')
            expect(result).to.have.property('$or')
            expect(result['$or']).to.eql([{ status: requestStatusList.split(',')[0] }, { status: requestStatusList.split(',')[1] }])
            expect(result.bed_id).to.eql(bedId)
            expect(result.sourcehealthentity_id).to.eql(sourceHealthEntityId)

            done()
        })
    })

    context('when query filters have multiple values for one field (sourcehealthentity_id)', function () {
        it('should return a JSON with filter parameters containing a $OR filter with multiple values', function (done) {
            const bedId = generateObjectId()
            const requestStatus = 'regulated'
            const sourceHealthEntityIds = `${generateObjectId()},${generateObjectId()}`
            const result = filter.filters({
                bed_id: bedId, status: requestStatus, sourcehealthentity_id: sourceHealthEntityIds
            }, default_options)
            expect(result).to.not.have.property('$and')
            expect(result).to.have.property('$or')
            expect(result['$or']).to.eql([
                { sourcehealthentity_id: sourceHealthEntityIds.split(',')[0] },
                { sourcehealthentity_id: sourceHealthEntityIds.split(',')[1] }
            ])
            expect(result.bed_id).to.eql(bedId)
            expect(result.status).to.eql(requestStatus)
         
            done()
        })
    })

    context('when query filters key contains blank space', function () {
        it('should return a JSON with filters params, ignoring blank spaces', function (done) {
            verify(filter.filters({ ' na  me   ': 'lucas', age: '30' }, default_options))
            done()
        })
    })

    context('when query filters key contains special characters', function () {
        it('should return a JSON with filters params, ignoring the special characteres', function (done) {
            verify(filter.filters({ '#(@@$na%me!?': 'lucas', age: '30' }, default_options))
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
                    default: { filters: { age: '19', name: 'John' } }
                }
            }
            const result = filter.filters({ age: '21' }, options)
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

/**
 * Randomly generates a valid 24-byte hex ID.
 *
 * @returns {string}
 */
function generateObjectId() {
    const chars = 'abcdef0123456789'
    let randS = ''
    for (let i = 0; i < 24; i++) {
        randS += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return randS
}