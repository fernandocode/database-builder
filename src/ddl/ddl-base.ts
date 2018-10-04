import { DdlCompiled } from "./../core/ddl-compided";
import { ExecutableBuilder } from "../core/executable-builder";
import { DatabaseBase, DatabaseResult } from "../definitions/database-definition";
import { DdlBaseBuilder } from "./ddl-base-builder";
import { DatabaseBuilderError } from "../core/errors";

export class DdlBase<T, TBuilder extends DdlBaseBuilder<T>> {

    protected readonly _executableBuilder: ExecutableBuilder;

    constructor(
        protected readonly _builder: TBuilder,
        private readonly _database: DatabaseBase = void 0,
        enableLog: boolean = true,
    ) {
        this._executableBuilder = new ExecutableBuilder(enableLog);
    }

    public execute(database: DatabaseBase = void 0): Promise<DatabaseResult> {
        return this._executableBuilder.execute(
            { query: this.compile(), params: [] },
            this.getDatabase(database));
    }

    public compile(): string {
        const compiled = this.build();
        let script = compiled.script;
        compiled.dependencies.forEach(dependency => {
            script += `\n${dependency.script}`;
        });
        return script;
    }

    public build(): DdlCompiled {
        return this._builder.build();
    }

    private getDatabase(database: DatabaseBase): DatabaseBase {
        const result = (database ? database : this._database);
        if (!result) {
            throw new DatabaseBuilderError("Database not specified in query.");
        }
        return result;
    }
}
