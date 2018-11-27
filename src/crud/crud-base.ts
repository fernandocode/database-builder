import { KeyUtils } from "./../core/key-utils";
import { TypeCrud } from "./enums/type-crud";
import { DatabaseBase, DatabaseResult } from "../definitions/database-definition";
import { CrudBaseBuilder } from "./crud-base-builder";
import { ColumnsValuesBuilder } from "../core/columns-values-builder";
import { PrimaryKeyType } from "../core/enums/primary-key-type";
import { MapperTable } from "../mapper-table";
import { QueryCompiled } from "../core/query-compiled";
import { SqlBase } from "./sql-base";
import { Utils } from "../core/utils";

export abstract class CrudBase<
    T,
    TBuilder extends CrudBaseBuilder<T, TColumnsBuilder>,
    TColumnsBuilder extends ColumnsValuesBuilder<T, TColumnsBuilder>
    > extends SqlBase<T> {

    constructor(
        private _typeCrud: TypeCrud,
        mapperTable: MapperTable,
        protected readonly _builder: TBuilder,
        database: DatabaseBase = void 0,
        enableLog: boolean = true,
    ) {
        super(mapperTable, database, enableLog);
    }

    protected model(): T {
        return this._builder.getModel();
    }

    protected builderCompiled(): QueryCompiled {
        return this._builder.compile();
    }

    protected checkDatabaseResult(promise: Promise<DatabaseResult[]>): Promise<DatabaseResult[]> {
        if (this._typeCrud === TypeCrud.CREATE) {
            return new Promise<DatabaseResult[]>((resolve, reject) => {
                promise.then(results => {
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
                    resolve(results);
                }).catch(reject);
            });
        }
        return promise;
    }
}
