import { DatetimeUtils } from "./datetime-utils";
import { ValueType, ValueTypeToParse } from "./core/utils";
import * as moment from "moment";
import { FieldType } from "./core/enums/field-type";
import { ColumnType } from "./core/enums/column-type";
import { DatabaseBuilderError } from "./core/errors";

export class DatabaseHelper {

    public getType(value: ValueTypeToParse): FieldType {
        const valueFormatted = this.preFormatValue(value);
        const tipo = typeof valueFormatted;
        switch (tipo) {
            case "string":
                return FieldType.STRING;
            case "number":
                return FieldType.NUMBER;
            case "boolean":
                return FieldType.BOOLEAN;
            case "object":
                // tratar date como inteiro
                if (valueFormatted.constructor.name === "Date"
                    || valueFormatted.constructor.name === "Moment") {
                    return FieldType.DATE;
                }
                // serializar todos os objetos
                return FieldType.OBJECT;
            case "function":
                return FieldType.FUNCTION;
            default:
                throw new DatabaseBuilderError(`type: '${tipo}', value: '${valueFormatted}' não configurado!`);
        }
    }

    public parseToColumnType(type: FieldType): ColumnType {
        switch (type) {
            case FieldType.STRING:
            case FieldType.OBJECT:
                return ColumnType.TEXT;
            case FieldType.DATE:
            case FieldType.NUMBER:
                return ColumnType.INTEGER;
            case FieldType.BOOLEAN:
                return ColumnType.BOOLEAN;
            default:
                throw new DatabaseBuilderError(`type '${type}' não configurado!`);
        }
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

    public databaseToValue(columnValue: any, fieldType: FieldType) {
        switch (fieldType) {
            case FieldType.OBJECT:
                return JSON.parse(columnValue);
            case FieldType.DATE:
                return DatetimeUtils.databaseToDatetime(columnValue);
            case FieldType.BOOLEAN:
                return typeof columnValue === "string" ? columnValue === "true" : columnValue;
            default:
                return columnValue;
        }
    }

    public valueToDatabase(value: ValueTypeToParse, fieldType: FieldType): ValueType {
        const type = value !== void 0 ? this.getType(value) : fieldType;
        switch (type) {
            case FieldType.OBJECT:
                return JSON.stringify(value);
            case FieldType.DATE:
                return DatetimeUtils.datetimeToDatabase(value as moment.Moment);
            default:
                return value as ValueType;
        }
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
