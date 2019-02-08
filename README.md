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
    client_db: 'mongodb',
    date_field: 'created_at'
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
  date_field: {
      start_at: 'timestamp',
      end_at: 'timestamp'
  }
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

For more details, access the [wiki](https://github.com/nutes-uepb/query-strings-parser/wiki/2.-Usage-Examples) page.

### 3. Supported Query Strings

For informations and details about the supported query strings, access the [wiki](https://github.com/nutes-uepb/query-strings-parser/wiki/3.-Supported-Query-Strings) page.


## Future Features
- ¹Support for relational databases such as MySQL, PostgreSQL and SQLite.

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
