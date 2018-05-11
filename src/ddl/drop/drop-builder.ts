import { DdlBaseBuilder } from "../ddl-base-builder";
import { TypeOrString, Utils } from "../../core/utils";

export class DropBuilder<T> extends DdlBaseBuilder<T> {

    constructor(typeT: TypeOrString<T>) {
        super(Utils.getValueByTypeOrString(typeT));
        // super(typeT);
    }

    protected buildBase(): string {
        return `DROP TABLE IF EXISTS ${this._tablename};`;
    }

    protected setDefaultColumns(): void {
        // não tem colunas no comando drop
    }
}
