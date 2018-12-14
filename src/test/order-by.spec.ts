import { expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import { OrderBy } from "../core/enums/order-by";
import { Crud } from "../crud/crud";
import { getMapper } from "./mappers-table-new";

describe("Order By", () => {

    const crud = new Crud({} as any, getMapper());

    it("none", () => {
        const query = crud.query(TestClazz);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes");
    });

    it("simple", () => {
        const query = crud.query(TestClazz);
        query.orderBy(x => x.id);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes ORDER BY tes.id ASC");
    });

    it("multi", () => {
        const query = crud.query(TestClazz);
        query.orderBy(x => x.id);
        query.orderBy(x => x.referenceTest.id);
        query.orderBy(x => x.description);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes ORDER BY tes.id ASC, tes.referenceTest_id ASC, tes.description ASC");
    });

    it("asc", () => {
        const query = crud.query(TestClazz);
        query.asc(x => x.id);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes ORDER BY tes.id ASC");
    });

    it("desc", () => {
        const query = crud.query(TestClazz);
        query.desc(x => x.id);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes ORDER BY tes.id DESC");
    });

    it("multi order", () => {
        const query = crud.query(TestClazz);
        query.desc(x => x.id);
        query.asc(x => x.referenceTest.id);
        query.orderBy(x => x.description, OrderBy.DESC);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes ORDER BY tes.id DESC, tes.referenceTest_id ASC, tes.description DESC");
    });

    it("with string", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.add(`strftime('%m', datetime(${select.ref(x => x.date).result()}, 'unixepoch'))`, "month");
        });
        query.asc(`strftime('%m', datetime(${query.ref(x => x.date).result()}, 'unixepoch'))`);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT strftime('%m', datetime(tes.date, 'unixepoch')) AS month FROM TestClazz AS tes ORDER BY strftime('%m', datetime(tes.date, 'unixepoch')) ASC");
    });

});
