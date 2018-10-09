import { KeyUtils } from "./../core/key-utils";
import { TypeCrud } from "./enums/type-crud";
import { ExecutableBuilder } from "../core/executable-builder";
import { DatabaseBase, DatabaseResult } from "../definitions/database-definition";
import { CrudBaseBuilder } from "./crud-base-builder";
import { ValueType } from "../core/utils";
import { ColumnsValuesBuilder } from "../core/columns-values-builder";
import { DatabaseBuilderError } from "../core/errors";
import { PrimaryKeyType } from "../core/enums/primary-key-type";
import { QueryCompiled } from "..";

export class CrudBase<
    T,
    TBuilder extends CrudBaseBuilder<T, TColumnsBuilder>,
    TColumnsBuilder extends ColumnsValuesBuilder<T, TColumnsBuilder>
    > {

    protected readonly _executableBuilder: ExecutableBuilder;

    constructor(
        private _typeCrud: TypeCrud,
        protected readonly _builder: TBuilder,
        private readonly _database: DatabaseBase = void 0,
        enableLog: boolean = true,
    ) {
        this._executableBuilder = new ExecutableBuilder(enableLog);
    }

    public execute(database: DatabaseBase = void 0): Promise<DatabaseResult[]> {
        return this.checkDatabaseResult(
            this._executableBuilder.execute(this.compile(), this.getDatabase(database))
        );
    }

    public compile(): QueryCompiled[] {
        // TODO: verificar como fazer multiplos scripts no builder
        return [this._builder.compile()];
    }

    private checkDatabaseResult(promise: Promise<DatabaseResult[]>): Promise<DatabaseResult[]> {
        if (this._typeCrud === TypeCrud.CREATE) {
            return new Promise<DatabaseResult[]>((resolve, reject) => {
                promise.then(results => {
                    results.forEach(result => {
                        if (KeyUtils.primaryKeyType(this._builder.getMapper()) === PrimaryKeyType.AutoIncrement) {
                            KeyUtils.setKey(this._builder.getMapper(), this._builder.getModel(), result.insertId);
                        } else {
                            result.insertId = KeyUtils.getKey(this._builder.getMapper(), this._builder.getModel());
                        }
                    });
                    resolve(results);
                }).catch(reject);
            });
        }
        return promise;
    }

    private getDatabase(database: DatabaseBase): DatabaseBase {
        const result = (database ? database : this._database);
        if (!result) {
            throw new DatabaseBuilderError("Database not specified in query.");
        }
        return result;
    }
}
