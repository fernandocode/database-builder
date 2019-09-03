import { ExecutableBuilder } from "../core/executable-builder";
import { DatabaseBase, DatabaseResult } from "../definitions/database-definition";
import { DatabaseBuilderError } from "../core/errors";
import { MapperTable } from "../mapper-table";
import { Utils } from "../core/utils";
import { SqlCompilable } from "./sql-compilable";
import { QueryCompiled } from "../core/query-compiled";
import { SqlExecutable } from "./sql-executable";
import { ModelUtils } from "../core/model-utils";
import { Observable } from "rxjs";

export abstract class SqlBase<T> implements SqlCompilable, SqlExecutable {

    protected readonly _executableBuilder: ExecutableBuilder;

    constructor(
        protected readonly mapperTable: MapperTable,
        protected readonly database: DatabaseBase = void 0,
        protected enableLog: boolean = true,
    ) {
        this._executableBuilder = new ExecutableBuilder(enableLog);
    }

    public execute(cascade?: boolean, database?: DatabaseBase): Observable<DatabaseResult[]> {
        return new Observable<DatabaseResult[]>(observer => {
            try {
                this.checkDatabaseResult(
                    this._executableBuilder.execute(this.compile(cascade), this.getDatabase(database))
                ).subscribe(observer);
            } catch (error) {
                observer.error(error);
            }
        });
    }

    public compile(cascade: boolean = true): QueryCompiled[] {
        const compiled = this.builderCompiled();
        const script = [compiled, ...this.compileDependency(cascade)];
        return script;
    }

    protected compileDependency(cascade: boolean): QueryCompiled[] {
        let script: QueryCompiled[] = [];
        if (cascade) {
            this.dependencies().forEach((dependency) => {
                this.checkAndPush(script, this.resolveDependency(dependency));
                script = [...script, ...this.compileDependencyByValue(dependency)];
            });
        }
        return script;
    }

    protected compileDependencyByValue(dependency: MapperTable): QueryCompiled[] {
        const script: QueryCompiled[] = [];
        const columnDependency = this.mapperTable.columns.find(x => x.tableReference === dependency.tableName);
        const fieldArraySplit = columnDependency.fieldReference.split("[?].");
        const valuesDependency: any[] = Utils.getValue(this.model(), fieldArraySplit[0]);
        if (valuesDependency) {
            valuesDependency.forEach((value, index) => {
                const valueItem = fieldArraySplit.length > 1 ? ModelUtils.get(value, fieldArraySplit[1]) : value;
                this.checkAndPush(script, this.resolveDependencyByValue(dependency, valueItem, index));
            });
        }
        return script;
    }

    protected dependencies(): MapperTable[] {
        return this.mapperTable.dependencies;
    }

    protected abstract model(): T;

    protected abstract builderCompiled(): QueryCompiled;

    protected abstract resolveDependencyByValue(dependency: MapperTable, value: any, index: number): QueryCompiled;
    protected abstract resolveDependency(dependency: MapperTable): QueryCompiled;

    protected abstract checkDatabaseResult(promise: Observable<DatabaseResult[]>): Observable<DatabaseResult[]>;

    protected getDatabase(database: DatabaseBase): DatabaseBase {
        const result = (database ? database : this.database);
        if (!result) {
            throw new DatabaseBuilderError("Database not specified in query.");
        }
        return result;
    }

    protected checkAndPush(scripts: QueryCompiled[], push: QueryCompiled) {
        if (push) {
            scripts.push(push);
        }
    }
}
