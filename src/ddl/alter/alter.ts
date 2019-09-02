import { DatabaseBase } from "../../definitions/database-definition";
import { DdlBase } from "../ddl-base";
import { AlterBuilder } from "./alter-builder";
import { ExpressionOrColumn, ValueTypeToParse } from "../../core/utils";
import { MapperTable } from "../../mapper-table";

export class Alter<T> extends DdlBase<T, AlterBuilder<T>> {

    constructor(
        typeT: new () => T,
        mapperTable: MapperTable,
        database: DatabaseBase = void 0,
        enableLog: boolean = true,
    ) {
        super(new AlterBuilder(typeT, mapperTable), database, enableLog);
    }

    public addColumn<TReturn extends ValueTypeToParse>(
        columnExpression: ExpressionOrColumn<TReturn, T>,
        type?: new () => TReturn
    ): Alter<T> {
        this._builder.addColumn(columnExpression, type);
        return this;
    }

    public renameColumn<TReturn extends ValueTypeToParse>(
        columnExpression: ExpressionOrColumn<TReturn, T>,
        newColumnNameExpression: ExpressionOrColumn<TReturn, T>
    ): Alter<T> {
        this._builder.renameColumn(columnExpression, newColumnNameExpression);
        return this;
    }

    public renameTable<TNewTable>(
        newTableName: string | (new () => TNewTable)
    ): Alter<T> {
        this._builder.renameTable(newTableName);
        return this;
    }
}
