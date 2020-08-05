
Query Strings Parser  
=========================  
[![License][license-image]][license-url] [![NPM Version][npm-image]][npm-url] [![NPM Downloads][downloads-image]][npm-url] [![Travis][travis-image]][travis-url] [![Coverage][coverage-image]][coverage-url] [![Dependencies][dependencies-image]][dependencies-url] [![DependenciesDev][dependencies-dev-image]][dependencies-dev-url] [![Vulnerabilities][known-vulnerabilities-image]][known-vulnerabilities-url]  [![Releases][releases-image]][releases-url]  [![Contributors][contributors-image]][contributors-url] [![Issues][issues-image]][issues-url]
 
Middleware to transform query strings in a format that is recognized by the MongoDB, MySQL[¹](#future-features) and other databases.  
  
## Prerequisites  
To ensure the smooth operation of the middleware, your web application must be built using the [express.js][express] or [hapi.js][hapi] frameworks.  
  
## Installing  
Use the npm command to install this library into your project:  
```shell 
npm i query-strings-parser --save  
```
  
### Usage Examples  
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
 *    sort: { created_at: 1 }  
 *    filters: {},  
 *    pagination: {  
 *        skip: 10,  
 *        limit: 10  
 *    },  
 *    original: '?fields=name,age&skip=10&limit=10&sort=created_at'  
 * }  
 */  
```  
  
### Using custom configurations:  
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
  },  
  default: {  
      fields: {name: 1 , age: 1, number: 1, _id: 0},  
      sort: { created_at: -1 },  
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
 *    sort: { created_at: -1 }  
 *    filters: {age: 30},  
 *    pagination: {  
 *        limit: 100,  
 *        page: 1  
 *    },  
 *    original: '?fields=name,age&age=30'  
 * }  
 */  
```  

The middleware uses the following defaults:  
```js  
options = {  
    use_page: false,  
    client_db: 'mongodb',  
    date_field: {  
      start_at: 'created_at',  
      end_at: 'created_at'  
    },
    default: {  
        fields: {},  
        sort: {},  
        filters: {},  
        pagination: {  
            limit: Number.MAX_SAFE_INTEGER,  
            skip: 0,  
            page: 1  
        }          
    }      
}  
```

If the options are not provided, the default values will be used for the treatment of queries strings.  
  
For more details, access the [wiki](https://github.com/nutes-uepb/query-strings-parser/wiki/2.-Usage-Examples) page.  

### Parsers Functions
To use these functions, simply call them through the middleware instance and pass them the query string to be converted and its default values. If you pass the default values ​​a merge will be performed with the result of the query strings. Here are some examples of each analyzer:

- `parser()`

```js
const qs = require('query-strings-parser')

const query = '?fields=name,age&page=1&limit=10&sort=created_at'
console.log(qs.parseFields(query, {}, { use_page: true }))

/**
* Result: 
* {
*   fields: { name: 1, age: 1 },
*   sort: { created_at: 1 },
*   filters: {},
*   pagination: { limit: 10, page: 1 },
*   original:  '?fields=name,age&page=1&limit=10&sort=created_at'
* }
*/
```  
For more [details >>](https://github.com/nutes-uepb/query-strings-parser/wiki/4.-Parsers#parser)

- `parseFields()`

```js

const qs = require('query-strings-parser')

const query = '?fields=name,age'
console.log(qs.parseFields(query))

/**
* Result: 
* { 
*     name: 1,
*     age: 1
* }
*/
```  
For more [details >>](https://github.com/nutes-uepb/query-strings-parser/wiki/4.-Parsers#parsefields)

- `parseSort()`

```js
const qs = require('query-strings-parser')

const query = '?sort=name,-age,created_at'
console.log(qs.parseSort(query))

/**
* Result: 
* { 
*     name: 1,
*     age: -1,
*     created_at: 1
* }
*/
```
For more [details >>](https://github.com/nutes-uepb/query-strings-parser/wiki/4.-Parsers#parsesort)

- `parsePagination()`

```js
const qs = require('query-strings-parser')

const query = '?limit=20&page=3'
console.log(qs.parsePagination(query, {}, true))

/**
* Result: 
* { 
*     limit: 20,
*     page: 3 
* }
*/
```
 For more [details >>](https://github.com/nutes-uepb/query-strings-parser/wiki/4.-Parsers#parsepagination)
 
 - `parseFilter()`
              
```js
 const qs = require('query-strings-parser')
 
 const query = '?name=elvis&age=80'
 console.log(qs.parseFilter(query))
 
 /**
 * Result: 
 * { 
 *     name: 'elvis',
 *     age: 80
 * }
 */
```
For more [details >>](https://github.com/nutes-uepb/query-strings-parser/wiki/4.-Parsers#parsefilter)
 
- `parseDate()`

 ```js
 const qs = require('query-strings-parser')
 
 const query = '?start_at=2019-02-05T00:00:00&end_at=2019-02-05T23:59:59'
 console.log(qs.parseDate(query))
 
 /**
 * Result: 
 * { 
 *    $and: [
 *       { created_at: { lt: 2019-02-05T23:59:59 }},
 *       { created_at: { gte: 2019-02-05T00:00:00 }}
 *   ]}
 * }
 */
 ```
For more [details >>](https://github.com/nutes-uepb/query-strings-parser/wiki/4.-Parsers#parsedate)
 
### Supported Query Strings  
For informations and details about the supported query strings, access the [wiki](https://github.com/nutes-uepb/query-strings-parser/wiki/3.-Supported-Query-Strings) page.  

---------- 

### Future Features  
- ¹Support for relational databases such as MySQL, PostgreSQL and SQLite.


[//]: # (These are reference links used in the body of this note.)
[node.js]: <https://nodejs.org>  
[npm.js]: <https://www.npmjs.com/>  
[express]: <https://expressjs.com>  
[hapi]: <https://hapijs.com/>    
[license-image]: https://img.shields.io/badge/license-Apache%202-blue.svg
[license-url]: https://github.com/nutes-uepb/query-strings-parser/blob/master/LICENSE
[npm-image]: https://img.shields.io/npm/v/query-strings-parser.svg?color=red&logo=npm
[npm-url]: https://npmjs.org/package/query-strings-parser
[downloads-image]: https://img.shields.io/npm/dt/query-strings-parser.svg?logo=npm
[travis-image]: https://img.shields.io/travis/nutes-uepb/query-strings-parser.svg?logo=travis
[travis-url]: https://travis-ci.com/nutes-uepb/query-strings-parser
[coverage-image]: https://coveralls.io/repos/github/nutes-uepb/query-strings-parser/badge.svg
[coverage-url]: https://coveralls.io/github/nutes-uepb/query-strings-parser?branch=master
[known-vulnerabilities-image]: https://snyk.io/test/github/nutes-uepb/query-strings-parser/badge.svg?targetFile=package.json
[known-vulnerabilities-url]: https://snyk.io/test/github/nutes-uepb/query-strings-parser?targetFile=package.json
[dependencies-image]: https://david-dm.org/nutes-uepb/query-strings-parser.svg
[dependencies-url]: https://david-dm.org/nutes-uepb/query-strings-parser
[dependencies-dev-image]: https://david-dm.org/nutes-uepb/query-strings-parser/dev-status.svg
[dependencies-dev-url]: https://david-dm.org/nutes-uepb/query-strings-parser?type=dev
[releases-image]: https://img.shields.io/github/release-date/nutes-uepb/query-strings-parser.svg
[releases-url]: https://github.com/nutes-uepb/ip-allowed/releases
[contributors-image]: https://img.shields.io/github/contributors/nutes-uepb/query-strings-parser.svg?color=green
[contributors-url]: https://github.com/nutes-uepb/query-strings-parser/graphs/contributors
[issues-image]: https://img.shields.io/github/issues/nutes-uepb/query-strings-parser.svg
[issues-url]: https://github.com/nutes-uepb/query-strings-parser/issues
