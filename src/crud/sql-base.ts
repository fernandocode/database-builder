import { ExecutableBuilder } from "../core/executable-builder";
import { DatabaseBase, DatabaseResult } from "../definitions/database-definition";
import { DatabaseBuilderError } from "../core/errors";
import { MapperTable } from "../mapper-table";
import { Utils, ValueTypeToParse } from "../core/utils";
import { SqlCompilable } from "./sql-compilable";
import { QueryCompiled } from "../core/query-compiled";
import { SqlExecutable } from "./sql-executable";
import { ModelUtils } from "../core/model-utils";
import { Observable } from "rxjs";

export abstract class SqlBase<T> implements SqlCompilable, SqlExecutable {

    protected readonly _executableBuilder: ExecutableBuilder;
    protected readonly mapperTable: MapperTable;
    protected readonly database: DatabaseBase;
    protected readonly enableLog: boolean;

    protected get mainScriptLength() { return this._mainScriptLength; }

    private _mainScriptLength: number;

    constructor(
        {
            mapperTable,
            database = void 0,
            enableLog = true
        }: {
            mapperTable: MapperTable,
            database?: DatabaseBase,
            enableLog?: boolean
        }
    ) {
        this.mapperTable = mapperTable;
        this.database = database;
        this.enableLog = enableLog;
        this._executableBuilder = new ExecutableBuilder(enableLog);
    }

    public execute(
        {
            cascade = true,
            database
        }: {
            cascade?: boolean,
            database?: DatabaseBase
        } = {}
    ): Observable<DatabaseResult[]> {
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
        const compiledArray = Array.isArray(compiled) ? compiled : [compiled];

        if (compiledArray.length > 1)
            this._mainScriptLength = compiledArray.length;

        const script = [...compiledArray, ...this.compileDependency(cascade)];
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
        const valuesDependencyArray: ValueTypeToParse[][] = Utils.getValue(this.model(), fieldArraySplit[0]);
        return [...script, ...this.compileValuesDependency(dependency, valuesDependencyArray, fieldArraySplit?.[1])];
    }

    protected compileValuesDependency(dependency: MapperTable, valuesDependencyArray: ValueTypeToParse[][], fieldReferenceSubItem: string): QueryCompiled[] {
        const scripts: QueryCompiled[] = [];
        valuesDependencyArray.forEach((valuesDependency) => {
            if (valuesDependency) {
                valuesDependency.forEach((value, index) => {
                    const valueItem = fieldReferenceSubItem ? ModelUtils.get(value, fieldReferenceSubItem) : value;
                    this.checkAndPush(scripts, this.resolveDependencyByValue(dependency, valueItem, index));
                });
            }
        });
        return scripts;
    }

    protected abstract dependencies(): MapperTable[];

    protected abstract model(): T | Array<T>;

    protected abstract builderCompiled(): QueryCompiled | QueryCompiled[];

    protected abstract resolveDependency(dependency: MapperTable): QueryCompiled;

    protected abstract checkDatabaseResult(promise: Observable<DatabaseResult[]>): Observable<DatabaseResult[]>;

    protected resolveDependencyByValue(dependency: MapperTable, value: ValueTypeToParse, index: number): QueryCompiled {
        return void 0;
    }

    protected getDatabase(database: DatabaseBase): DatabaseBase {
        const result = (database ? database : this.database);
        if (!result) {
            throw new DatabaseBuilderError("Database not specified in query.");
        }
        return result;
    }

    protected checkAndPush(scripts: QueryCompiled[], push: QueryCompiled | QueryCompiled[]) {
        if (Array.isArray(push))
            scripts.push(...push);

        else if (push)
            scripts.push(push);
    }
}
