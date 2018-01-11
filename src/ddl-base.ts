import { Database } from './definitions/database-definition';
import { ExecutableBuilder } from "./executable-builder";
import { ResultExecuteSql } from "./utils";
import { DdlBaseBuilder } from "./ddl-base-builder";

export class DdlBase<T, TBuilder extends DdlBaseBuilder<T>>{

    protected readonly _executableBuilder: ExecutableBuilder;

    constructor(
        protected readonly _builder: TBuilder,
        private readonly _database: Database = void 0,
        enableLog: boolean = true
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
        let result = (database ? database : this._database);
        if (!result) {
            throw "Database not specified in query.";
        }
        return result;
    }
}