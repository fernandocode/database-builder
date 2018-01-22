import { DdlBaseBuilder } from "../ddl-base-builder";

export class DropBuilder<T> extends DdlBaseBuilder<T> {

    constructor(typeT: new () => T) {
        super(typeT);
    }

    protected buildBase(): string {
        return `DROP TABLE IF EXISTS ${this._tablename};`;
    }

    protected setDefaultColumns(): void {
        // não tem colunas no comando drop
    }
}
