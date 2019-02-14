import { DatabaseBase } from "../../definitions/database-definition";
import { QueryReadableBuilderBase } from "./query-readable-builder-base";
import { DatabaseBuilderError } from "../../core/errors";
import { MapperTable } from "../../mapper-table";
import { SqlExecutable } from "../sql-executable";
import { Observable, Observer } from "rxjs";

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
    ): Observable<T[]> {
        return Observable.create((observer: Observer<T[]>) => {
            queryBuilder.execute(cascade, database)
                .subscribe((cursors) => {
                    this.log(cursors);
                    try {
                        if (cursors.length !== 1) {
                            throw new DatabaseBuilderError(`"toCast" is not ready to solve multiple queries in one batch!`);
                        }
                        observer.next(this.read(cursors[0], this._typeT, mapperTable));
                        observer.complete();
                    } catch (error) {
                        observer.error(error);
                        observer.complete();
                    }
                }, err => {
                    observer.error(err);
                    observer.complete();
                });
        });
    }
}
