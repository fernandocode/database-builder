import { expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import { Crud } from "../crud/crud";
import { getMapper } from "./mappers-table-new";

describe("Limit and Offset", () => {

    const crud = new Crud({} as any, getMapper());

    it("limit", () => {
        const query = crud.query(TestClazz);
        query.limit(12);
        const result = query.compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(12);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes LIMIT ?");
    });

    it("limit with offset", () => {
        const query = crud.query(TestClazz);
        query.limit(9, 3);
        const result = query.compile();
        expect(result[0].params.length).to.equal(2);
        expect(result[0].params[0]).to.equal(9);
        expect(result[0].params[1]).to.equal(3);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes LIMIT ? OFFSET ?");
    });

});
