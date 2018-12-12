[![License][license-image]][license-url] [![NPM Version][npm-image]][npm-url] [![NPM Downloads][downloads-image]][downloads-url] [![Travis][travis-image]][travis-url] [![Coverage][coverage-image]][coverage-url] [![Vulnerabilities][known-vulnerabilities-image]][known-vulnerabilities-url]

# Query Strings Parser
Middleware to transform query strings in a format that is recognized by the MongoDB, MySQL[¹](#future-features) and other databases.

## Prerequisites
To ensure the smooth operation of the middleware, your web application must be built using the [express.js][express] or [hapi.js][hapi] frameworks.

## Installing
Use the npm command to install this library into your project:
```
npm i --save query-strings-parser
```

### Usage Examples
#### 1. Using default configurations
```js
const express = require('express')
const qs = require('query-strings-parser')
const app = express()

app.use(qs()) // middleware query-strings-parser

app.listen(3000, (req, res) => {
    console.log('app listening on port 3000')
})

app.get('/', (req, res) => {
    res.send('the query is:' + JSON.stringify(req.query))
})

/**
 * Request: http://localhost:3000?fields=name,age&skip=10&limit=10&sort=created_at
 * Result (req.query):
 * {
 *    fields: { name: 1, age: 1 },
 *    sort: { created_at: 'asc' }
 *    filters: {},
 *    pagination: {
 *        skip: 10,
 *        limit: 10
 *    }
 * }
 */
```
#### The middleware uses the following defaults:
```js
options = {
    default: {
        pagination: {
            limit: Number.MAX_SAFE_INTEGER,
            skip: 0,
            page: 1
        },
        fields: {},
        sort: {},
        filters: {}
    },
    use_page: false,
    client_db: 'mongodb'
}
```
If the options are not provided, the default values will be used for the treatment of queries strings.

### 2. Using custom configurations:
```js
const express = require('express')
const qs = require('query-strings-parser')
const app = express()

app.use(qs({
  use_page: true,
  client_db: 'mongodb',
  default: {
      fields: {name: 1 , age: 1, number: 1, _id: 0},
      sort: { created_at: 'desc' },
      filters: {},
      pagination: {
          page: 1,
          limit: 100
      }
  }
}))

/**
 * Request: http://localhost:3000?fields=name,age&age=30
 * Result (req.query):
 * {
 *    fields: { name: 1, age: 1},
 *    sort: { created_at: 'desc' }
 *    filters: {age: 30},
 *    pagination: {
 *        limit: 100,
 *        page: 1
 *    }
 * }
 */
```
**NOTES** :
* Default values are used only when they are not passed in the query string. For example, if you set the default value `?sort=-age` _(age in descending order)_ and your client makes a request with `?sort=name` _(name in ascending order)_, you will get in req.query the value `{ sort: { name: 'asc' } }`, since the values passed by the client will always have preference.
* Remember to set whether you will use the page or not in the options. If you do not set this setting, it will work without page param, even if you pass the page setup on paging.
* If you use custom configurations, the query configurations must be insert in json with name 'default'.
* The configurations that you don't set in middleware options it will be the default settings.
### Query Support

This middleware supports the queries as follow the pattern bellow:

| Operation | Query | Description | Result |
| ------ | ------ | ------ | ------ |
| Partial Responses | `?fields=name,age` | Allows you to retrieve only the information you want. To do this, simply provide the name of the attributes/properties separated by commas, `?fields=name,age` indicates that only the name and age should be listed in the result of the request. | `{ fields: { name: 1, age: 1 } }` |
| Pagination with skip  | `?skip=0&limit=100` | Determines how many items to skip and the maximum number that the request should return. | `{ pagination: { skip: 0, limit: 100 } }` |
| Pagination with page | `?page=2&limit=100` | Determines the page number and the maximum number of items the request should return. | { `pagination: { page: 2, limit: 100 } }` |
| Ordenation | `?sort=name,-age` | Allows you to apply sort rules. To do this, simply provide the name of the attributes/properties that will be used to sort the result of the query separated by commas. For ascending _(ascending)_ use before the attribute name the `+` character and for descending _(descending)_ use the `-` character. By default the order is ascending, so the `+` character is optional, just inform the attribute name. | `{ sort: { name: 'asc', age: 'desc' }` }|
| Filters | `?name=elvis&age=83` | It allows limiting the number of resources requested, specifying some attributes and their expected values. To do this, simply use the attribute/property name with an equal sign and the expected value. `?name=elvis` indicates that the request should return the data that has the exact same name as Elvis, `?name=elvis,john` indicates that the name is equal to Elvis or John and `?age=18&age=25` indicates that age is equal to 18 and 25.[²](#notes) | `{ filters: { name : 'elvis', age: 83 } }` |


**NOTES**
* In the last release, is possible filter for sub-level seaches - like `location.city=New York`, advanced filters like `AND`, `<`, `<=`, `>`, `>=`,`OR`,`LIKE` and `Date`.
## Future Features
- Support for other NoSQL banks, in addition to MongoDB.
- ¹Support for relational databases such as MySQL, PostgreSQL and SQLite.
- Support to use the parser by passing the query string programatically: `parser(string)`.
- Support to use the parser individually: `parserFields(string)`, `parserFilters(string)`, `parserSort(string)` and `paserPagination(string)`.

[//]: # (These are reference links used in the body of this note.)
[build-test]: <https://travis-ci.org/nutes-uepb/query-strings-parser>
[test-coverage]: <https://coveralls.io/github/nutes-uepb/query-strings-parser?branch=master>
[node.js]: <https://nodejs.org>
[npm.js]: <https://www.npmjs.com/>
[express]: <https://expressjs.com>
[hapi]: <https://hapijs.com/>

[license-image]: https://img.shields.io/github/license/mashape/apistatus.svg
[license-url]: https://github.com/nutes-uepb/query-strings-parser/blob/master/LICENSE
[npm-image]: https://img.shields.io/npm/v/query-strings-parser.svg
[npm-url]: https://npmjs.org/package/query-strings-parser
[downloads-image]: https://img.shields.io/npm/dt/query-strings-parser.svg
[downloads-url]: https://npmjs.org/package/query-strings-parser
[travis-image]: https://travis-ci.org/nutes-uepb/query-strings-parser.svg?branch=master
[travis-url]: https://travis-ci.org/nutes-uepb/query-strings-parser
[coverage-image]: https://coveralls.io/repos/github/nutes-uepb/query-strings-parser/badge.svg
[coverage-url]: https://coveralls.io/github/nutes-uepb/query-strings-parser?branch=master
[known-vulnerabilities-image]: https://snyk.io/test/github/nutes-uepb/query-strings-parser/badge.svg?targetFile=package.json
[known-vulnerabilities-url]: https://snyk.io/test/github/nutes-uepb/query-strings-parser?targetFile=package.json
