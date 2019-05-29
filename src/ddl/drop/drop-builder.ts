import { DdlBaseBuilder } from "../ddl-base-builder";
import { MapperTable } from "../../mapper-table";
import { DdlCompiled } from "../../core/ddl-compided";
import { DatabaseBuilderError } from "../../core/errors";
import { Utils } from "../../core/utils";

export class DropBuilder<T> extends DdlBaseBuilder<T> {

    constructor(
        typeT: new () => T,
        private _mapperTable: MapperTable
    ) {
        super(typeT && typeT.name ? typeT.name : _mapperTable.tableName);
        if (Utils.isNull(_mapperTable)) {
            throw new DatabaseBuilderError(`Mapper not found for '${this._tablename}'`);
        }
    }

    protected resolveDependency(dependency: MapperTable): DdlCompiled {
        const create = new DropBuilder(void 0, dependency);
        return create.build();
    }

    protected dependencies(): MapperTable[] {
        return this._mapperTable.dependencies;
    }

    // constructor(typeT: TypeOrString<T>) {
    //     super(Utils.getValueByTypeOrString(typeT));
    // }

    protected buildBase(): string {
        return `DROP TABLE IF EXISTS ${this._tablename};`;
    }

    protected setDefaultColumns(): void {
        // não tem colunas no comando drop
    }
}
