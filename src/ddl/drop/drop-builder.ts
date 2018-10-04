import { DdlBaseBuilder } from "../ddl-base-builder";
import { TypeOrString, Utils } from "../../core/utils";
import { MapperTable } from "../../mapper-table";
import { DdlCompiled } from "../../core/ddl-compided";

export class DropBuilder<T> extends DdlBaseBuilder<T> {

    protected resolveDependency(dependency: MapperTable): DdlCompiled {
        throw new Error("Method not implemented.");
    }
    protected dependencies(): MapperTable[] {
        return [];
    }

    constructor(typeT: TypeOrString<T>) {
        super(Utils.getValueByTypeOrString(typeT));
    }

    protected buildBase(): string {
        return `DROP TABLE IF EXISTS ${this._tablename};`;
    }

    protected setDefaultColumns(): void {
        // não tem colunas no comando drop
    }
}
