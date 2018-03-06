[![npm version](https://badge.fury.io/js/database-builder.svg/?a=1)](https://www.npmjs.com/package/database-builder)

# database-builder
Framework to assist in database manipulation (DDL and CRUD)

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
        const result = query.compile();
        console.log(result);
        /**
         * result:
         * {
         *  params: [],
         *  query: "SELECT tes.* FROM TestClazz AS tes"
         * }
         */
    }
}
```

### Usage Ionic 2+

[*Demo*](https://stackblitz.com/edit/ionic-6sdjng)