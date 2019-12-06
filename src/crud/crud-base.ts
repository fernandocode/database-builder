import { KeyUtils } from "./../core/key-utils";
import { TypeCrud } from "./enums/type-crud";
import { DatabaseBase, DatabaseResult } from "../definitions/database-definition";
import { CrudBaseBuilder } from "./crud-base-builder";
import { ColumnsValuesBuilder } from "../core/columns-values-builder";
import { PrimaryKeyType } from "../core/enums/primary-key-type";
import { MapperTable } from "../mapper-table";
import { QueryCompiled } from "../core/query-compiled";
import { SqlBase } from "./sql-base";
import { Observable, Observer } from "rxjs";

export abstract class CrudBase<
    T,
    TBuilder extends CrudBaseBuilder<T, TColumnsBuilder>,
    TColumnsBuilder extends ColumnsValuesBuilder<T, TColumnsBuilder>
    > extends SqlBase<T> {

    // tslint:disable-next-line: variable-name
    public readonly __allowInTransaction: boolean = true;

    protected readonly _builder: TBuilder;

    constructor(
        private _typeCrud: TypeCrud,
        {
            mapperTable,
            builder,
            database = void 0,
            enableLog = true
        }: {
            mapperTable: MapperTable,
            builder: TBuilder,
            database?: DatabaseBase,
            enableLog?: boolean
        }
        // mapperTable: MapperTable,
        // protected readonly _builder: TBuilder,
        // database: DatabaseBase = void 0,
        // enableLog: boolean = true,
    ) {
        super({ mapperTable, database, enableLog });
        this._builder = builder;
    }

    protected model(): T {
        return this._builder.getModel();
    }

    protected builderCompiled(): QueryCompiled {
        return this._builder.compile();
    }

    protected checkDatabaseResult(promise: Observable<DatabaseResult[]>): Observable<DatabaseResult[]> {
        if (this._typeCrud === TypeCrud.CREATE) {
            return Observable.create((observer: Observer<DatabaseResult[]>) => {
                promise
                    .subscribe(results => {
                        const result = results[0];
                        if (KeyUtils.primaryKeyType(this._builder.getMapper()) === PrimaryKeyType.AutoIncrement) {
                            KeyUtils.setKey(this._builder.getMapper(), this._builder.getModel(), result.insertId);
                        } else {
                            const keyValue = KeyUtils.getKey(this._builder.getMapper(), this._builder.getModel());
                            try {
                                result.insertId = keyValue;
                            } catch (error) {
                                // ignore error readonly property
                            }
                        }
                        observer.next(results);
                        observer.complete();
                    }, err => {
                        observer.error(err);
                        observer.complete();
                    });
            });
        }
        return promise;
    }
}
