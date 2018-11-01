 [![license](https://img.shields.io/github/license/mashape/apistatus.svg)][mit] [![node](https://img.shields.io/badge/node-v10.13.3-green.svg)][node.js] [![npm](https://img.shields.io/badge/npm-v6.4.1-green.svg)][npm.js] [![Build Status](https://travis-ci.org/LIBE-NUTES/query-strings-parser.svg?branch=master)][build-test] [![Coverage Status](https://coveralls.io/repos/github/LIBE-NUTES/query-strings-parser/badge.svg?branch=master)][test-coverage]

# Query Strings Parser
Middleware to transform query strings in a format that is recognized by the MongoDB, MySQL and other databases.

### Prerequisites
To ensure the smooth operation of the middleware, your web application must be built using the [express.js][express] or [hapi.js][hapi] frameworks.

### Installing
Use the npm command to install this library into your project:
```
npm install --save query-strings-parser 
```

### Usage Examples
**Using default configurations**
```js
const express = require('express')
const qs = require('query-strings-parser')
const app = express()

app.use(qs.options({}))

app.listen(3000, (req, res) => {
    console.log('app listening on port 3000')
})

app.get('/', (req, res) => {
    res.send('the query is:' + JSON.stringify(req.query))
})

/**
Example request:
 - localhost:3000?fields=name,age&skip=2&limit=10&sort=created_at
Example result (req.query):
{
    pagination: {
        limit:10,
        skip:2
    },
    fields: { name: 1, age: 1 },
    sort: { created_at: 'asc' }
    filters: {}
}
*/
```
**Using custom configurations**
```js
const express = require('express')
const qs = require('query-strings-parser')
const app = express()

app.use(qs.options({
  use_page: true,
  client_db: 'mongodb',
  default: {
      pagination: {
          limit: 100,
          page: 1
      },
      fields: {name: 1 , age: 1, _id: 0},
      sort: { name: 'asc'},
      filters: {age: 30}
  }
}))

/**
Example request:
 - localhost:3000?fields=name&sort=created_at
Example result (req.query):
{
    pagination: {
        limit:100,
        page:1
    },
    fields: { name: 1},
    sort: { created_at: 'asc' }
    filters: {age: 30}
}
*/
``` 
**NOTES** :
* Remember to set whether you will use the page or not in the options. If you do not set this setting, it will work without page param, even if you pass the page setup on paging.
* If you use custom configurations, the query configurations must be insert in json with name 'default'.
* The configurations that you don't set in middleware options it will be the default settings.
### Query Support

This middleware supports the queries as follow the pattern bellow:

| Operation | Query | Result |
| ------ | ------ | ------ |
| Ordenation | ?sort=name,-age | { sort: { name: 'asc', age: 'desc' } }|
| Partial answers | ?fields=name,age,jobs | { fields : { name: 1, age: 1, jobs: 1} } | 
| Pagination with skip  | ?limit=100&skip=0 | { pagination: { limit: 100, skip: 0 } } |
| Pagination with page | ?limit=10&page=2 | { pagination: { limit: 10, page: 2 } } |
| Filters | ?name=lucas&age=30 | { filters: { name : 'lucas', age: 40 } } |

**NOTES**
* The middleware still does not support logical operators from filter queries, such as $gt, $gte, $lt, and $lte.

### Running the tests
After cloning the project, install the necessary dependencies to perform the tests using the command:
```
npm install 
```
**For run only unit tests, use the command:**
```
npm run test:unit
```
**For run only integration tests, use the command:**
```
npm run test:integration
```
**For run all tests, use the command:**
```
npm run test
```

### Future Features
* We will provide developers with a generic middleware that supports any framework used to build web applications.
* Until now, this middleware provides only query string format recognized in MongoDB. In future, we will expand the usability of middleware for use in applications that use SQL databases.
* We will provide the use of query string transformations functions for each passed parameter, individually.
* We will provide the use of logic operators from filters queries, like $gt, $gte, $lt and $lte.

### Acknowledgments
This project is designed to facilitate the development of web applications by intercepting requests and transforming query strings into json, to be applied in queries to the database.

### License
[MIT][mit]


[//]: # (These are reference links used in the body of this note.)
[build-test]: <https://travis-ci.org/LIBE-NUTES/query-strings-parser>
[test-coverage]: <https://coveralls.io/github/LIBE-NUTES/query-strings-parser?branch=master>
[mit]: <https://opensource.org/licenses/MIT>
[node.js]: <https://nodejs.org>
[npm.js]: <https://www.npmjs.com/>
[express]: <https://expressjs.com>
[hapi]: <https://hapijs.com/>

