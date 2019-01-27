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
  date_field: 'created_at'
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

### 3. Supported Query Strings
#### 3.1 Partial Answers
| Query | Description | Result |
| ------ | ------ | ------ |
|`?fields=name,age`| Search where the user wants only the name and age of the user. |`{ fields: { name: 1, age: 1 } }` | 
 
#### 3.2 Pagination
**3.2.1 Pagination With Skip**

| Query | Description | Result |
| ------ | ------ | ------ |
| `?limit=10&skip=0` | Search where the user wants only 10 results, without skip any. | `{ pagination: { limit: 10, skip: 0 } }` |

**3.2.2 Pagination With page**

| Query | Description | Result |
| ------ | ------ | ------ |
| `?limit=10&page=2` | Search where the user wants results only 10 results, but the second page (in this case, from the 11th to the 20th result). | `{ pagination: { limit: 10, page: 2 } }` |

#### 3.3 Ordination
| Query | Description | Result |
| ------ | ------ | ------ |
| `?sort=name,-age` | Search where the user wants results to be sorted in ascending order by name and in descending order by age. | `{ sort: { name: 'asc', age: 'desc' } }` |

#### 3.4 Filtering
| Query | Description | Result |
| ------ | ------ | ------ |
| `?name=elvis&age=80` | Search where the user wants results that name equals elvis and age equals 80. | `{ filters: { name: 'elvis', age: 80 } }` |
| `?name=elvis&name=john` | Search where the usar wants results that name equals elvis and john. | `{ filters: { $and: [ { name: 'elvis' }, { name: john } ] } }` |
| `?name=elvis,john` | Search where the user wants results that name equals elvis or john. | `{ filters: { $or: [ { name: 'elvis' }, { name: john } ] } }` |
| `?age=gt:30` | Search where the user wants results that age is greater than 30. | `{ filters: { age: { $gt: 30 } } }` |
| `?age=gte:30` | Search where the user wants results that age is greater or equal than 30. | `{ filters: { age: { $gte: 30 } } }` |
| `age=lt:30` | Search where the user wants results that age is lower than 30. | `{ filters: { age: { $lt: 30 } } }` |
| `age=lte:30` | Search where the user wants results that age is lower or equal than 30. | `{ filters: { age: { $lte: 30 } } }` |

#### 3.5 Data
| Query | Description | Result |
| ------ | ------ | ------ |
| `?start_at=2018-11-10&end_at=2018-12-10` | Search where the user wants results between 2018-12-10 and 2018-12-12. | `{ filters: { $and: [ { created_at: { $lt: '2018-12-10T23:59:59' } }, { created_at: { $gte: '2018-11-10T00:00:00' } } ] } }` |
| `?start_at=2018-12-10` | Search where the user wants results between 2018-12-10 and the current date. In this example, the current day is: 2018-12-12. | `{ filters: { $and: [ { created_at: { $lt: '2018-12-13T23:59:59' } }, { created_at: { $gte: '2018-12-10T00:00:00' } } ] } }` |
| `?end_at=2018-12-11&period=10d` | Search where the user wants results from 10 days before 2018-12-12. |  `{ filters: { $and: [ { created_at: { $lt: '2018-12-11T23:59:59' } }, { created_at: { $gte: '2018-11-30T00:00:00' } } ] } }` | 
| `?period=10d` | Search where the user wants results from 10 days before the current date. In this example, the current day is: 2018-12-12. |  `{ filters: { $and: [ { created_at: { $lt: '2018-12-13T23:59:59' } }, { created_at: { $gte: '2018-12-02T00:00:00' } } ] } }` | 
| `?end_at=2018-12-11&period=8w` | Search where the user wants results from 8 weeks before 2018-12-12. |  `{ filters: { $and: [ { created_at: { $lt: '2018-12-11T23:59:59' } }, { created_at: { $gte: '2018-10-15T00:00:00' } } ] } }` | 
| `?period=8w` | Search where the user wants results from 8 weeks before the current date. In this example, the current day is: 2018-12-12. |  `{ filters: { $and: [ { created_at: { $lt: '2018-12-13T23:59:59' } }, { created_at: { $gte: '2018-10-17T00:00:00' } } ] } }` | 
| `?end_at=2018-12-11&period=6m` | Search where the user wants results from 6 months before 2018-12-11. |  `{ filters: { $and: [ { created_at: { $lt: '2018-12-11T23:59:59' } }, { created_at: { $gte: '2018-06-10T00:00:00' } } ] } }` | 
| `?period=6m` | Search where the user wants results from 6 months before the current date. In this example, the current day is: 2018-12-12. |  `{ filters: { $and: [ { created_at: { $lt: '2018-12-13T23:59:59' } }, { created_at: { $gte: '2018-06-12T00:00:00' } } ] } }` | 
| `?end_at=2018-12-11&period=4y` | Search where the user wants results from 4 years before 2018-12-11. |  `{ filters: { $and: [ { created_at: { $lt: '2018-12-11T23:59:59' } }, { created_at: { $gte: '2014-12-10T00:00:00' } } ] } }` | 
| `?period=4y` | Search where the user wants results from 4 years before the current date. In this example, the current day is: 2018-12-12. |  `{ filters: { $and: [ { created_at: { $lt: '2018-12-13T23:59:59' } }, { created_at: { $gte: '2014-12-12T00:00:00' } } ] } }` | 

#### 3.6 Search
| Query | Description | Result |
| ------ | ------ | ------ |
| `?name=elvis*`| Search where the user want results that the name starts with value 'elvis'. | `{ filters:  { name: { '$options': 'i', '$regex': '^elvis' } } ` |
| `?name=*elvis` | Search where the user want results that the name ends with the value 'elvis'. | `{ filters:  { name: { '$options': 'i', '$regex': 'elvis&' } } ` |
| `?name=*elvis*` | Search where the user wants results for name that contains the value 'elvis' in any position. | `{ filters:  { name: { '$options': 'i', '$regex': 'elvis' } } ` |

**NOTES** :
* Default values are used only when they are not passed in the query string. For example, if you set the default value `?sort=-age` _(age in descending order)_ and your client makes a request with `?sort=name` _(name in ascending order)_, you will get in req.query the value `{ sort: { name: 'asc' } }`, since the values passed by the client will always have preference.
* Remember to set whether you will use the page or not in the options. If you do not set this setting, it will work without page param, even if you pass the page setup on paging.
* If you use custom configurations, the query configurations must be insert in json with name 'default'.
* The accepted date format of Data params is yyyy-MM-dd or yyyy-MM-dd: hh: mm: ss. Any date outside this format will not work correctly.
* The **date_field** parameter in the options is used in cases where you want to use filters with Date. If this value is not specified in the middleware configuration options, its default value will be 'created_at'.
* The configurations that you don't set in middleware options it will be the default settings.

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
