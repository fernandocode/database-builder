import { expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import { Crud } from "../crud/crud";
import { getMapper } from "./mappers-table-new";

describe("Group By", () => {

    const crud = new Crud({getMapper: getMapper()});

    it("none", () => {
        const query = crud.query(TestClazz);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes");
    });

    it("simple", () => {
        const query = crud.query(TestClazz);
        query.groupBy(x => x.id);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes GROUP BY tes.id");
    });

    it("multi", () => {
        const query = crud.query(TestClazz);
        query.groupBy(x => x.id);
        query.groupBy(x => x.referenceTest.id);
        query.groupBy(x => x.description);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes GROUP BY tes.id, tes.referenceTest_id, tes.description");
    });

    it("with having", () => {
        const query = crud.query(TestClazz);
        query.groupBy(x => x.id, (having, projection) => {
            having.greatValue(projection.count(x => x.id), 10);
            having.greatValue(projection.sum(x => x.referenceTest.id), 3);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(2);
        expect(result[0].params[0]).to.equal(10);
        expect(result[0].params[1]).to.equal(3);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes GROUP BY tes.id HAVING COUNT(tes.id) > ? AND SUM(tes.referenceTest_id) > ?");
    });

    it("with multi having", () => {
        const query = crud.query(TestClazz);
        query.groupBy(x => x.id, (having, projection) => {
            having.greatValue(projection.count(x => x.id), 10);
            having.greatValue(projection.sum(x => x.referenceTest.id), 3);
        });
        query.groupBy(x => x.referenceTest.id, (having, projection) => {
            having.greatValue(projection.max(x => x.id), 2);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(3);
        expect(result[0].params[0]).to.equal(10);
        expect(result[0].params[1]).to.equal(3);
        expect(result[0].params[2]).to.equal(2);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes GROUP BY tes.id, tes.referenceTest_id HAVING COUNT(tes.id) > ? AND SUM(tes.referenceTest_id) > ? AND MAX(tes.id) > ?");
    });

    it("multi with having", () => {
        const query = crud.query(TestClazz);
        query.groupBy(x => x.id, (having, projection) => {
            having.greatValue(projection.count(x => x.id), 10);
            having.greatValue(projection.sum(x => x.referenceTest.id), 3);
        });
        query.groupBy(x => x.referenceTest.id);
        const result = query.compile();
        expect(result[0].params.length).to.equal(2);
        expect(result[0].params[0]).to.equal(10);
        expect(result[0].params[1]).to.equal(3);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes GROUP BY tes.id, tes.referenceTest_id HAVING COUNT(tes.id) > ? AND SUM(tes.referenceTest_id) > ?");
    });

    it("with having (stacked)", () => {
        const query = crud.query(TestClazz);
        query.groupBy(x => x.id, (having, projection) => {
            having.greatValue(projection.sum().count(x => x.id), 10);
            having.lessAndEqual(projection.sum(x => x.referenceTest.id), projection.max().count(x => x.id));
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(10);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes GROUP BY tes.id HAVING SUM(COUNT(tes.id)) > ? AND SUM(tes.referenceTest_id) <= MAX(COUNT(tes.id))");
    });

    it("with string", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.add(`strftime('%m', datetime(${select.ref(x => x.date).result()}, 'unixepoch'))`, "month");
        });
        query.groupBy(`strftime('%m', datetime(${query.ref(x => x.date).result()}, 'unixepoch'))`);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT strftime('%m', datetime(tes.date, 'unixepoch')) AS month FROM TestClazz AS tes GROUP BY strftime('%m', datetime(tes.date, 'unixepoch'))");
    });

});
