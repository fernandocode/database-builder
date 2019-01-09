import { DatabaseBase } from "../../definitions/database-definition";
import { QueryReadableBuilderBase } from "./query-readable-builder-base";
import { DatabaseBuilderError } from "../../core/errors";
import { MapperTable } from "../../mapper-table";
import { SqlExecutable } from "../sql-executable";

export class QueryReadableBuilder<T> extends QueryReadableBuilderBase {

    constructor(
        private _typeT: new () => T,
        enableLog: boolean = true
    ) {
        super(enableLog);
    }

    public executeAndRead(
        cascade: boolean,
        queryBuilder: SqlExecutable,
        mapperTable: MapperTable,
        database: DatabaseBase,
    ): Promise<T[]> {
        return new Promise((resolve, reject) => {
            queryBuilder.execute(cascade, database)
                .then((cursors) => {
                    this.log(cursors);
                    try {
                        if (cursors.length !== 1) {
                            throw new DatabaseBuilderError(`"toCast" is not ready to solve multiple queries in one batch!`);
                        }
                        resolve(this.read(cursors[0], this._typeT, mapperTable));
                    } catch (error) {
                        reject(error);
                    }
                })
                .catch(reject);
        });
    }
}
