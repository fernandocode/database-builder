[![npm version](https://badge.fury.io/js/database-builder.svg/?a=1)](https://www.npmjs.com/package/database-builder)

# database-builder
Framework to assist in database manipulation (DDL and CRUD)

# Getting Started

### Step 1: Install npm module

```bash
npm install --save database-builder 
```
This will install the current stable version of `database-builder` in your `node_modules` directory and save the entry in `package.json`.

### Step 2: Usage Typescript (Angular 2+ example)

#### Step 2.1: Usage Query<T>

```ts
import { Component } from '@angular/core';
import { Query } from 'database-builder';

@Component({
    selector: 'app-component',
    templateUrl: 'app.html'
})
export class AppComponent {
    
    ngOnInit(){
        let query = new Query(TestClazz);
        query.
    }
}

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



# TODO: Getting Started Ionic 2+