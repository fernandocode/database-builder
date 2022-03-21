import { KeyUtils } from "./../core/key-utils";
import { TypeCrud } from "./enums/type-crud";
import { DatabaseBase, DatabaseResult } from "../definitions/database-definition";
import { CrudBaseBuilder } from "./crud-base-builder";
import { ColumnsValuesBuilder } from "../core/columns-values-builder";
import { PrimaryKeyType } from "../core/enums/primary-key-type";
import { MapperTable } from "../mapper-table";
import { QueryCompiled } from "../core/query-compiled";
import { SqlBase } from "./sql-base";
import { map, Observable } from "rxjs";
import { Utils } from "../core/utils";
import { DatabaseBuilderError } from "../core";

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
    ) {
        super({ mapperTable, database, enableLog });
        this._builder = builder;
    }

    protected model(): T | Array<T> {
        return this._builder.getModel();
    }

    protected builderCompiled(): QueryCompiled {
        return this._builder.compile();
    }

    protected checkDatabaseResult(observable: Observable<DatabaseResult[]>): Observable<DatabaseResult[]> {
        if (this._typeCrud === TypeCrud.CREATE) {
            return observable.pipe(map(results => {
                debugger;

                const models: Array<T> = Utils.isArray(this.model())
                        ? this.model() as Array<T>
                        : [this.model() as T];
                if(models.length > 1 && models.length != results.length){
                    throw new DatabaseBuilderError(`Há ${models.length} models e ${results.length} results, e o "checkDatabaseResult" ainda não sabe como proceder nessa situação, possivelmente você está tentando executar multi comandos em combinação com comandos em cascade`);
                }
                // como não sei qual será o retorno do insertMultiple, vou continuar considerando apenas o primeiro para pegar o id inserted do head
                // let index = 0;
                for (let index = 0; index < models.length; index++) {
                    const result = results[index];
                    const model = models[index];
                    if (KeyUtils.primaryKeyType(this._builder.getMapper()) === PrimaryKeyType.AutoIncrement) {
                        KeyUtils.setKey(this._builder.getMapper(), model, result.insertId);
                    } else {
                        const keyValue = KeyUtils.getKey(this._builder.getMapper(), model);
                        try {
                            result.insertId = keyValue;
                        } catch (error) {
                            // ignore error readonly property
                        }
                    }
                }
                return results;
            }))
        }
        return observable;
    }
}
