import { Utils } from "../core/utils";
import { DatabaseResult } from "../definitions/database-definition";
import { SqlCompilable } from "../crud/sql-compilable";
import { TransactionStatus } from "./transaction-status";
import { DatabaseBuilderError } from "../core";
import { SqlExecutable } from "../crud/sql-executable";

export class ManagedTransaction {

    private _idTransaction: string;
    private _status: TransactionStatus = TransactionStatus.OPEN;
    private _stack: Array<{ statement: string, params: any }> = [];

    get id(): string {
        return this._idTransaction;
    }

    private set status(value: TransactionStatus) {
        this._status = value;
    }

    constructor(
        private _database: {
            sqlBatch(sqlStatements: Array<(string | string[] | any)>): Promise<DatabaseResult[]>,
            executeSql(statement: string, params: any): Promise<DatabaseResult>;
        }
    ) {
        this._idTransaction = `transaction_${Utils.GUID().replace(/-/g, "_")}`;
    }

    public addStatement(statement: string, params: any): void {
        this.checkTransactionActive();
        this._stack.push({ statement, params });
    }

    public add(compilable: SqlCompilable & { __allowInTransaction: boolean }): void {
        const compiled = compilable.compile();
        compiled.forEach(c => this.addStatement(c.query, c.params));
    }

    public async executeImmediate(executable: SqlExecutable): Promise<DatabaseResult[]> {
        this.checkTransactionActive();
        await this.beginTransaction();
        await this.executeStack();
        return executable.execute().toPromise();
    }

    public async commit(savePointName?: string): Promise<boolean> {
        this.checkTransactionActive();
        if (this._status === TransactionStatus.STARTED
            || this._status === TransactionStatus.RELEASED) {
            this.addStatement(this.commandCommitTransaction(savePointName), []);
            await this.executeStack();
        } else {
            if (savePointName) {
                await this.beginTransaction();
                return await this.commit(savePointName);
            }
            const batch = this.buildSqlBatch(this._stack);
            this.clearStackTransaction();
            this.status = TransactionStatus.STARTED;
            await this._database.sqlBatch(batch);
        }
        return this.finishTransaction(
            savePointName
                ? TransactionStatus.RELEASED
                : TransactionStatus.COMMITED
        );
    }

    public createSavePoint(savePointName: string): void {
        this.addStatement(this.formatSavePoint(savePointName), []);
    }

    public async rollback(savePointName?: string): Promise<boolean> {
        this.checkTransactionActive();
        if (this._status === TransactionStatus.STARTED
            || this._status === TransactionStatus.RELEASED) {
            this.addStatement(this.commandRollbackTransaction(savePointName), []);
            await this.executeStack();
        } else {
            if (savePointName) {
                await this.beginTransaction();
                return await this.rollback(savePointName);
            }
        }
        return this.finishTransaction(
            savePointName
                ? TransactionStatus.RELEASED
                : TransactionStatus.ROLLBACKED);
    }

    private async executeStack(): Promise<void> {
        if (this._stack.length > 0) {
            const batch = this.buildSqlExecute(this._stack);
            await this._database.executeSql(batch.statement, batch.params);
            this.clearStackTransaction();
        }
    }

    private checkTransactionActive(): void {
        if (!this.isTransactionActive()) {
            throw new DatabaseBuilderError(`Transaction (id: ${this._idTransaction}) is no longer active, and can no longer be used`);
        }
    }

    private isTransactionActive(): boolean {
        return this._status === TransactionStatus.OPEN
            || this._status === TransactionStatus.STARTED
            || this._status === TransactionStatus.RELEASED;
    }

    private finishTransaction(status: TransactionStatus.ROLLBACKED | TransactionStatus.COMMITED | TransactionStatus.RELEASED): boolean {
        this.status = status;
        this.clearStackTransaction();
        return true;
    }

    private clearStackTransaction() {
        this._stack = [];
    }

    private buildSqlBatch(compiled: Array<{ statement: string, params: any }>): any[] {
        return compiled.map(x => {
            const r = x.params.length > 0
                ? [x.statement, x.params]
                : x.statement;
            return r;
        });
    }

    private buildSqlExecute(compiled: Array<{ statement: string, params: any }>): { statement: string, params: any } {
        return compiled.reduce(
            (previous, current) => {
                previous.statement += `${current.statement};`;
                previous.params = [...previous.params, ...current.params];
                return previous;
            },
            { statement: "", params: [] }
        );
    }

    private async beginTransaction(): Promise<DatabaseResult> {
        if (this._status === TransactionStatus.STARTED) {
            return Promise.resolve(void 0);
        }
        const result = await this._database.executeSql("BEGIN TRANSACTION", []);
        this.status = TransactionStatus.STARTED;
        return result;
    }

    private commandCommitTransaction(savePointName?: string): string {
        return savePointName
            ? `RELEASE ${this.formatSavePoint(savePointName)}`
            : "COMMIT TRANSACTION";
    }

    private commandRollbackTransaction(savePointName?: string): string {
        return savePointName
            ? `ROLLBACK TRANSACTION TO ${this.formatSavePoint(savePointName)}`
            : "ROLLBACK TRANSACTION";
    }

    private formatSavePoint(savePointName: string): string {
        return `SAVEPOINT "${savePointName}"`;
    }
}