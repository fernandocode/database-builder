import { ValueType } from "../../core/utils";
import { JoinQueryBuilder } from "./join-query-builder";

export class JoinCompiled {

    public joins: Array<JoinQueryBuilder<any>> = [];
    constructor(
        public params: ValueType[] = [],
    ) {

    }
}

// // tslint:disable-next-line:max-classes-per-file
// export class JoinQueryCompiled {

//     public hasAlias(alias: string): boolean {
//         if (this._alias === alias) {
//             return true;
//         }
//         return false;
//     }

//     public get alias(): string {
//         return this._alias;
//     }

//     public joins: Array<JoinQueryBuilder<any>> = [];

//     constructor(
//         private readonly _alias: string,
//         public params: ValueType[] = [],
//     ) {

//     }
// }
