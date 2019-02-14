import { DdlCompiled } from "./../core/ddl-compided";
import { ExecutableBuilder } from "../core/executable-builder";
import { DatabaseBase, DatabaseResult } from "../definitions/database-definition";
import { DdlBaseBuilder } from "./ddl-base-builder";
import { DatabaseBuilderError } from "../core/errors";
import { QueryCompiled } from "../core/query-compiled";
import { Observable } from "rxjs";

export class DdlBase<T, TBuilder extends DdlBaseBuilder<T>> {

    protected readonly _executableBuilder: ExecutableBuilder;

    constructor(
        protected readonly _builder: TBuilder,
        private readonly _database: DatabaseBase = void 0,
        enableLog: boolean = true,
    ) {
        this._executableBuilder = new ExecutableBuilder(enableLog);
    }

    public execute(cascade: boolean = true, database: DatabaseBase = void 0): Observable<DatabaseResult[]> {
        const compiled = this.compile(cascade);
        return this._executableBuilder.execute(
            compiled.map(query => {
                return {
                    query,
                    params: []
                } as QueryCompiled;
            }),
            this.getDatabase(database)
        );
    }

    public compile(cascade: boolean = true): string[] {
        const compiled = this.build(cascade);
        const script = [compiled.script];
        compiled.dependencies.forEach(dependency => {
            script.push(dependency.script);
        });
        return script;
    }

    public build(cascade: boolean = true): DdlCompiled {
        return this._builder.build(cascade);
    }

    private getDatabase(database: DatabaseBase): DatabaseBase {
        const result = (database ? database : this._database);
        if (!result) {
            throw new DatabaseBuilderError("Database not specified in query.");
        }
        return result;
    }
}
