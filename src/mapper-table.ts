import { MapperColumn } from "./mapper-column";
import { Utils } from "./core/utils";
import { FieldType } from "./core/enums/field-type";
import { DatabaseBuilderError } from "./core/errors";
import { PrimaryKeyType } from "./core/enums/primary-key-type";

export class MapperTable {

    public columns: MapperColumn[] = [];
    public dependencies: MapperTable[] = [];

    constructor(
        public tableName: string = void 0,
    ) {

    }

    public addColumn(
        name: string,
        fieldType: FieldType,
        primaryKeyType?: PrimaryKeyType
    ) {
        this.add(
            new MapperColumn(
                name, fieldType, void 0,
                primaryKeyType
            )
        );
    }

    public removeColumn(columnName: string) {
        if (this.hasColumn(columnName)) {
            const index = this.columns.findIndex(x => x.column === columnName);
            if (index > -1) {
                this.columns.splice(index, 1);
            }
        }
    }

    private hasColumn(columnName: string): boolean {
        return this.getColumn(columnName) !== void 0;
    }

    private getColumn(columnName: string): MapperColumn {
        return this.columns.find(x => x.column === columnName);
    }

    private add(
        mapperColumn: MapperColumn
    ) {
        if (Utils.isFlag(mapperColumn.fieldType, FieldType.NULL)) {
            throw new DatabaseBuilderError(`Mapper: ${this.tableName}, can not get instance of mapped column ('${mapperColumn.column}')`);
        }
        if (this.hasColumn(mapperColumn.column)) {
            throw new DatabaseBuilderError(`Mapper: ${this.tableName}, duplicate column: '${mapperColumn.column}'`);
        }
        this.columns.push(mapperColumn);
    }

}
