import { expect } from "chai";
import { FieldType } from "../core/enums/field-type";
import { PrimaryKeyType } from "../core/enums/primary-key-type";
import { KeyUtils } from "../core/key-utils";
import { DatabaseResult } from "../definitions";
import { MapperTable } from "../mapper-table";

describe("KeyUtils", () => {

    it("setKeyByResult", () => {
        const models = [{ i: 0 }, { i: 1 }, { i: 2 }] as any[];
        const mapper = new MapperTable();
        mapper.addColumn("id", FieldType.NUMBER, PrimaryKeyType.AutoIncrement);

        const modelsResult1 = KeyUtils.setKeyByResult([...models], {
            insertId: 6,
            rowsAffected: 3,
        } as DatabaseResult, mapper);
        expect(modelsResult1[0].id).to.equal(4);
        expect(modelsResult1[1].id).to.equal(5);
        expect(modelsResult1[2].id).to.equal(6);
        
        const modelsResult2 = KeyUtils.setKeyByResult([...models, { i: 3 }, { i: 4 }, { i: 5 }, { i: 6 }], {
            insertId: 1923,
            rowsAffected: 7,
        } as DatabaseResult, mapper);
        expect(modelsResult2[0].id).to.equal(1917);
        expect(modelsResult2[1].id).to.equal(1918);
        expect(modelsResult2[2].id).to.equal(1919);
        expect(modelsResult2[3].id).to.equal(1920);
        expect(modelsResult2[4].id).to.equal(1921);
        expect(modelsResult2[5].id).to.equal(1922);
        expect(modelsResult2[6].id).to.equal(1923);
    });

    it("transformerDatabadeResultInArray", () => {
        const databaseResults = KeyUtils.transformerDatabaseResultInArray({
            insertId: 6,
            rowsAffected: 3,
        } as DatabaseResult);
        expect(databaseResults[0].insertId).to.equal(4);
        expect(databaseResults[1].insertId).to.equal(5);
        expect(databaseResults[2].insertId).to.equal(6);
        
        const modelsResult2 = KeyUtils.transformerDatabaseResultInArray({
            insertId: 1923,
            rowsAffected: 7,
        } as DatabaseResult);
        expect(modelsResult2[0].insertId).to.equal(1917);
        expect(modelsResult2[1].insertId).to.equal(1918);
        expect(modelsResult2[2].insertId).to.equal(1919);
        expect(modelsResult2[3].insertId).to.equal(1920);
        expect(modelsResult2[4].insertId).to.equal(1921);
        expect(modelsResult2[5].insertId).to.equal(1922);
        expect(modelsResult2[6].insertId).to.equal(1923);
    });
});