import { ExecutableBuilder } from "../core/executable-builder";
import { DatabaseBase, DatabaseResult } from "../definitions/database-definition";
import { CrudBaseBuilder } from "./crud-base-builder";
import { ValueType } from "../core/utils";
import { ColumnsValuesBuilder } from "../core/columns-values-builder";
import { DatabaseBuilderError } from "../core/errors";

export class CrudBase<
    T,
    TBuilder extends CrudBaseBuilder<T, TColumnsBuilder>,
    TColumnsBuilder extends ColumnsValuesBuilder<T, TColumnsBuilder>
    > {

    protected readonly _executableBuilder: ExecutableBuilder;

    constructor(
        protected readonly _builder: TBuilder,
        private readonly _database: DatabaseBase = void 0,
        enableLog: boolean = true,
    ) {
        this._executableBuilder = new ExecutableBuilder(enableLog);
    }

    public execute(database: DatabaseBase = void 0): Promise<DatabaseResult> {
        return this._executableBuilder.execute(this.compile(), this.getDatabase(database));
    }

    public compile(): { query: string, params: ValueType[] } {
        return this._builder.compile();
    }

    private getDatabase(database: DatabaseBase): DatabaseBase {
        const result = (database ? database : this._database);
        if (!result) {
            throw new DatabaseBuilderError("Database not specified in query.");
        }
        return result;
    }
}
