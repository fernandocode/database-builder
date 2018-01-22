import { ExecutableBuilder } from "./../core/executable-builder";
import { Database } from "./../definitions/database-definition";
import { DdlBaseBuilder } from "./ddl-base-builder";
import { ResultExecuteSql } from "../core/result-execute-sql";

export class DdlBase<T, TBuilder extends DdlBaseBuilder<T>> {

    protected readonly _executableBuilder: ExecutableBuilder;

    constructor(
        protected readonly _builder: TBuilder,
        private readonly _database: Database = void 0,
        enableLog: boolean = true,
    ) {
        this._executableBuilder = new ExecutableBuilder(enableLog);
    }

    public execute(database: Database = void 0): Promise<ResultExecuteSql> {
        return this._executableBuilder.execute({ query: this.compile(), params: [] }, this.getDatabase(database));
    }

    public compile(): string {
        return this._builder.compile();
    }

    private getDatabase(database: Database): Database {
        const result = (database ? database : this._database);
        if (!result) {
            throw new Error("Database not specified in query.");
        }
        return result;
    }
}
