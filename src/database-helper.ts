import { DatetimeUtils } from "./datetime-utils";
import { Utils, ValueType, ValueTypeToParse } from "./core/utils";
import * as moment from "moment";
import { FieldType } from "./core/enums/field-type";
import { ColumnType } from "./core/enums/column-type";
import { DatabaseBuilderError } from "./core/errors";

export class DatabaseHelper {

    public isFlag(value: any, flag: any) {
        return !!(value & flag);
    }

    public isTypeSimpleByType(type: FieldType): boolean {
        return !this.isFlag(type, FieldType.OBJECT)
            && !this.isFlag(type, FieldType.FUNCTION)
            && !this.isFlag(type, FieldType.ARRAY);
    }

    public isTypeSimple(value: ValueTypeToParse): boolean {
        const type = this.getType(value);
        return this.isTypeSimpleByType(type);
    }

    public isTypeIgnoredInMapperByType(type: FieldType): boolean {
        return this.isFlag(type, FieldType.ARRAY);
    }

    public isTypeIgnoredInMapper(value: ValueTypeToParse): boolean {
        const type = this.getType(value);
        return this.isTypeIgnoredInMapperByType(type);
    }

    public getFieldType<T>(type: string | (new () => T), constructorName?: string) {
        const typeCase: string = (Utils.isString(type) ? type as string : (type as new () => void).name).toLowerCase();
        switch (typeCase) {
            case "string":
                return FieldType.STRING;
            case "number":
                return FieldType.NUMBER;
            case "boolean":
                return FieldType.BOOLEAN;
            case "object":
                if (constructorName) {
                    // tratar date como inteiro
                    if (
                        constructorName === "Date"
                        ||
                        constructorName === "Moment"
                    ) {
                        return FieldType.DATE;
                    }
                    if (constructorName === "Array") {
                        return FieldType.ARRAY;
                    }
                }
                // serializar todos os objetos
                return FieldType.OBJECT;
            case "date":
            case "moment":
                return FieldType.DATE;
            case "function":
                return FieldType.FUNCTION;
            case "undefined":
                return FieldType.NULL;
            default:
                if (
                    !Utils.isString(type) &&
                        type.constructor.length === 0 ? new (type as (new () => T))() : {} instanceof Object
                ) {
                    return FieldType.OBJECT;
                }
                throw new DatabaseBuilderError(`type: '${type}', constructor name: '${constructorName}' não configurado!`);
        }
    }

    public getType(value: ValueTypeToParse): FieldType {
        const valueFormatted = this.preFormatValue(value);
        const tipo = typeof valueFormatted;
        return this.getFieldType(tipo, valueFormatted ? valueFormatted.constructor.name : void 0);
    }

    public parseToColumnType(type: FieldType): ColumnType {
        // TODO: list
        if (
            this.isFlag(type, FieldType.ARRAY) &&
            type !== FieldType.ARRAY
        ) {
            return ColumnType.TABLE_REFERENCE;
        }
        if (
            this.isFlag(type, FieldType.STRING) ||
            this.isFlag(type, FieldType.ARRAY) ||
            this.isFlag(type, FieldType.OBJECT)
        ) {
            return ColumnType.TEXT;
        }
        if (
            this.isFlag(type, FieldType.DATE) ||
            this.isFlag(type, FieldType.NUMBER)
        ) {
            return ColumnType.INTEGER;
        }
        if (
            this.isFlag(type, FieldType.BOOLEAN)
        ) {
            return ColumnType.BOOLEAN;
        }
        if (Utils.isNull(type)) {
            return void 0;
        }
        throw new DatabaseBuilderError(`type '${type}' não configurado!`);
    }

    public parseToValueType(value: ValueTypeToParse, type: FieldType = this.getType(value)): ValueType {
        const valueFormatted = this.preFormatValue(value);
        return this.valueToDatabase(valueFormatted, type);
    }

    public preFormatValue(value: ValueTypeToParse): ValueTypeToParse {
        const regexISODatetime = /(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})[+-](\d{2})\:(\d{2})/gm;
        if (typeof value === "string" && regexISODatetime.test(value)) {
            return DatetimeUtils.dateToDatabase(value);
        }
        return value;
    }

    public databaseToValue(columnValue: any, fieldType: FieldType): any {
        if (
            (this.isFlag(fieldType, FieldType.ARRAY) ||
                this.isFlag(fieldType, FieldType.OBJECT))
            && columnValue
        ) {
            return JSON.parse(columnValue);
        }
        if (
            this.isFlag(fieldType, FieldType.DATE)
        ) {
            return DatetimeUtils.databaseToDatetime(columnValue);
        }
        if (
            this.isFlag(fieldType, FieldType.BOOLEAN)
        ) {
            return typeof columnValue === "string"
                ? columnValue === "true"
                : columnValue;
        }
        return columnValue;
    }

    public valueToDatabase(value: ValueTypeToParse, fieldType: FieldType): ValueType {
        // const type = value !== void 0 ? this.getType(value) : fieldType;
        if (
            this.isFlag(fieldType, FieldType.ARRAY) ||
            this.isFlag(fieldType, FieldType.OBJECT)
        ) {
            return JSON.stringify(value);
        }
        if (
            this.isFlag(fieldType, FieldType.DATE)
        ) {
            return DatetimeUtils.datetimeToDatabase(value as moment.Moment);
        }
        return value as ValueType;
    }

    public getValue(instance: any, fieldReference: string): ValueTypeToParse {
        return this.getValueByProperties(instance, fieldReference.split("."));
    }

    public getValueByProperties(instance: any, properties: string[]): ValueTypeToParse {
        const shiftField = properties.shift();
        if (shiftField) {
            if (instance.hasOwnProperty(shiftField)) {
                return this.getValueByProperties(instance[shiftField], properties);
            }
            return void 0;
        }
        return instance;
    }
}
