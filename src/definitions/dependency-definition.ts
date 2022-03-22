import { ValueTypeToParse } from "../core/utils";

export interface DependencyListSimpleModel {
    index: number;
    value: ValueTypeToParse;
    reference: any;
}

export const DEPENDENCY_LIST_SIMPLE_COLUMNS = {
    INDEX: "indexArray",
    VALUE: "value",
    REFERENCE: (tableName: string, keyColumn: string) => {
        return `${tableName}_${keyColumn}`;
    }
};