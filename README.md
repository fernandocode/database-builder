[![npm version](https://badge.fury.io/js/database-builder.svg/?a=1)](https://www.npmjs.com/package/database-builder)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/fernandocode/database-builder/issues)

# database-builder
Library to assist in creating and maintaining SQL commands.

[look at the test for more details of use (`./src/test/`)](https://github.com/fernandocode/database-builder/tree/master/src/test)

# Getting Started

### Step 1: Install npm module

```bash
npm install --save database-builder 
```
This will install the current stable version of `database-builder` in your `node_modules` directory and save the entry in `package.json`.

### Step 2: Usage Typescript

[*Demo*](https://stackblitz.com/edit/typescript-cfzt6q)

```ts
import { Query } from 'database-builder';
import { TestClazz, TestClazzRef } from './models';

let querySimple = new Query(TestClazz);
console.log(querySimple.compile());
/**
 * {
 *  params: [],
 *  query: "SELECT tes.* FROM TestClazz AS tes"
 * }
 */

const queryWhere = new Query(TestClazz);
queryWhere.where(where => {
  where.contains(x => x.description, "abc");
  where.greatValue(x => x.id, 1);
});
console.log(queryWhere.compile());
/**
 * {
 *  params: ["%abc%", 1],
 *  query: "SELECT tes.* FROM TestClazz AS tes WHERE tes.description LIKE ? AND tes.id > ?"
 * }
 */

const queryProjections = new Query(TestClazz);
queryProjections.projection(projection => {
  projection.add(x => x.description);
  projection.sum(x => x.id);
  projection.max(x => x.referenceTest.id);
  projection.count(x => x.id, "countId");
});
console.log(queryProjections.compile());
/**
 * {
 *  params: [],
 *  query: "SELECT tes.description AS description, SUM(tes.id) AS id, MAX(tes.referenceTest_id) AS referenceTest_id, COUNT(tes.id) AS countId FROM TestClazz AS tes"
 * }
 */

const queryOrderBy = new Query(TestClazz);
queryOrderBy.orderBy(x => x.id);
console.log(queryOrderBy.compile());
/**
 * {
 *  params: [],
 *  query: "SELECT tes.* FROM TestClazz AS tes ORDER BY tes.id ASC"
 * }
 */

const queryGroupBy = new Query(TestClazz);
queryGroupBy.groupBy(x => x.id, (having, projection) => {
    having.greatValue(projection.count(x => x.id), 10);
  });
console.log(queryGroupBy.compile());
/**
 * {
 *  params: [10],
 *  query: "SELECT tes.* FROM TestClazz AS tes GROUP BY tes.id HAVING COUNT(tes.id) > ?"
 * }
 */

const queryLimitOffset = new Query(TestClazz);
queryLimitOffset.limit(10, 5);
console.log(queryLimitOffset.compile());
/**
 * {
 *  params: [10, 5],
 *  query: "SELECT tes.* FROM TestClazz AS tes LIMIT ? OFFSET ?"
 * }
 */
```

models.ts

```ts
export class TestClazz {

    public description: string = "";
    public referenceTest: TestClazzRef = new TestClazzRef();
    public disabled: boolean = false;
}

export class TestClazzRef{

    public id: number = 0;
    public description: string = "";
}
```

### Usage Angular 2+

[*Demo*](https://stackblitz.com/edit/angular-vxnvua)

```ts
import { Component } from '@angular/core';
import { Query } from 'database-builder';
import { TestClazz } from './models';

@Component({
    selector: 'app-component',
    templateUrl: 'app.html'
})
export class AppComponent {
    
    ngOnInit(){
        let query = new Query(TestClazz);
        query.where(where => where.between(x => x.id, 1, 20));
        const result = query.compile();
        console.log(result);
        /**
         * result:
         * {
         *  params: [1,20],
         *  query: "SELECT tes.* FROM TestClazz AS tes WHERE tes.id BETWEEN ? AND ?"
         * }
         */
    }
}
```

### Usage Ionic 2+

[*Demo*](https://stackblitz.com/edit/ionic-6sdjng)


# Contribution Welcome!

The project is continously evolving with every new release. Give it a star, if you like it. For contribution, setup the development environment as follows:

1. clone and setup the project dependencies

```shell
$> git clone https://github.com/fernandocode/database-builder.git
$> npm install
```

2. Use following commands based on what you'd like to do:

```shell
$> npm test              # runs test suite once and exit.
```

3. Have you found a bug, or want to develop a new feature?

3.1. [Look for Pull Requests](https://github.com/fernandocode/database-builder/pulls) if something is not already implemented;
3.2. [Check if there is no Issue related to this](https://github.com/fernandocode/database-builder/issues)? (If there is not one, so that the use case can be checked);
3.3. Make the necessary changes, add tests to what has been implemented, run the tests and submit a Pull Request with the changes (Comment what was done, and relate the Issue). As soon as possible it will be verified, and if approved it will be available in the next release of the library.

If you face any problem, then raise an issue [here](https://github.com/fernandocode/database-builder/issues).