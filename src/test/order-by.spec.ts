import { expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import { OrderBy } from "../core/enums/order-by";
import { Crud } from "../crud/crud";
import { getMapper } from "./mappers-table-new";
import { PlanRef } from "../core/plan-ref";
import { TestClazzRef } from "./models/test-clazz-ref";

describe("Order By", () => {

    const crud = new Crud({ sqliteLimitVariables: 10000 }, { getMapper: getMapper() });

    it("none", () => {
        const query = crud.query(TestClazz);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes");
    });

    it("simple", () => {
        const query = crud.query(TestClazz);
        query.orderBy(x => x.id);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes ORDER BY tes.id ASC");
    });

    it("multi", () => {
        const query = crud.query(TestClazz);
        query.orderBy(x => x.id);
        query.orderBy(x => x.referenceTest.id);
        query.orderBy(x => x.description);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes ORDER BY tes.id ASC, tes.referenceTest_id ASC, tes.description ASC");
    });

    it("asc", () => {
        const query = crud.query(TestClazz);
        query.asc(x => x.id);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes ORDER BY tes.id ASC");
    });

    it("desc", () => {
        const query = crud.query(TestClazz);
        query.desc(x => x.id);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes ORDER BY tes.id DESC");
    });

    it("multi order", () => {
        const query = crud.query(TestClazz);
        query.desc(x => x.id);
        query.asc(x => x.referenceTest.id);
        query.orderBy(x => x.description, OrderBy.DESC);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes ORDER BY tes.id DESC, tes.referenceTest_id ASC, tes.description DESC");
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

    it("order by sub query", () => {
        const query = crud.query(TestClazz);
        const subQuery = crud.query(TestClazzRef, { alias: "ref" })
            .projection(projection => projection.count(x => x.id))
            .where(where => {
                where.equal(x => x.id, query.ref(x => x.referenceTest.id));
                where.startsWith(x => x.description, "abc");
            });
        query.projection(select => {
            select.add(subQuery, "countRefDescriptionStartWithAbc");
        });
        query.asc(subQuery.compile());
        const result = query.compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal("abc%");
        expect(result[0].query).to.equal("SELECT (SELECT COUNT(ref.id) AS id FROM TestClazzRef AS ref WHERE ref.id = tes.referenceTest_id AND ref.description LIKE ?) AS countRefDescriptionStartWithAbc FROM TestClazz AS tes ORDER BY (SELECT COUNT(ref.id) AS id FROM TestClazzRef AS ref WHERE ref.id = tes.referenceTest_id AND ref.description LIKE 'abc%') ASC");
    });

    it("order by alias projection", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.add(`strftime('%m', datetime(${select.ref(x => x.date).result()}, 'unixepoch'))`, "month");
        });
        query.asc(new PlanRef(`month`));
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT strftime('%m', datetime(tes.date, 'unixepoch')) AS month FROM TestClazz AS tes ORDER BY month ASC");
    });

    it("order by index by alias projection", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.add(x => x.id);
            select.add(`strftime('%m', datetime(${select.ref(x => x.date).result()}, 'unixepoch'))`, "month");
            select.add(x => x.description);
            select.add(x => x.disabled);
        });
        query.asc(query.getIndexProjection(`month`));
        query.desc(query.getIndexProjection(x => x.description));
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.id AS id, strftime('%m', datetime(tes.date, 'unixepoch')) AS month, tes.description AS description, tes.disabled AS disabled FROM TestClazz AS tes ORDER BY 2 ASC, 3 DESC");
    });

    it("order by index projection", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.add(`strftime('%m', datetime(${select.ref(x => x.date).result()}, 'unixepoch'))`, "month");
        });
        query.asc(1);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT strftime('%m', datetime(tes.date, 'unixepoch')) AS month FROM TestClazz AS tes ORDER BY 1 ASC");
    });

});
