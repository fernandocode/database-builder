import { DdlCompiled } from "./../core/ddl-compided";
import { ExecutableBuilder } from "../core/executable-builder";
import { DatabaseBase, DatabaseResult } from "../definitions/database-definition";
import { DdlBaseBuilder } from "./ddl-base-builder";
import { DatabaseBuilderError } from "../core/errors";
import { QueryCompiled } from "../core/query-compiled";

export class DdlBase<T, TBuilder extends DdlBaseBuilder<T>> {

    protected readonly _executableBuilder: ExecutableBuilder;

    constructor(
        protected readonly _builder: TBuilder,
        private readonly _database: DatabaseBase = void 0,
        enableLog: boolean = true,
    ) {
        this._executableBuilder = new ExecutableBuilder(enableLog);
    }

    public execute(database: DatabaseBase = void 0): Promise<DatabaseResult[]> {
        const compiled = this.compile();
        return this._executableBuilder.execute(
            compiled.map(query => {
                return {
                    query,
                    params: []
                } as QueryCompiled;
            }),
            // { query: this.compile(), params: [] },
            this.getDatabase(database));
    }

    // public executorLinked(scripts: string[], database: DatabaseBase): Promise<DatabaseResult[]> {
    //     return new Promise((resolve, reject) => {
    //         if (scripts && scripts.length > 0) {
    //             this._executableBuilder.execute(
    //                 scripts.map(x => {
    //                     return {
    //                         query: x,
    //                         params: []
    //                     } as QueryCompiled;
    //                 }),
    //                 // { query: scripts[0], params: [] },
    //                 database
    //             )
    //                 .then(result => {
    //                     // remove o item executado
    //                     scripts.shift();
    //                     this.executorLinked(scripts, database)
    //                         .then(res => {
    //                             resolve(res.concat(result));
    //                         })
    //                         .catch(err => reject(err));
    //                 })
    //                 .catch(err => reject(err));
    //         } else {
    //             resolve([]);
    //         }
    //     });
    // }

    public compile(): string[] {
        const compiled = this.build();
        const script = [compiled.script];
        compiled.dependencies.forEach(dependency => {
            script.push(dependency.script);
            // script += `\n${dependency.script}`;
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
