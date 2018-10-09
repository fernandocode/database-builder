import { Query } from "../crud/query/query";
import { TestClazz } from "./models/test-clazz";
import { expect } from "chai";

describe("Getting Started", () => {

    it("query", () => {
        const query = new Query(TestClazz);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.* FROM TestClazz AS tes");
    });

    it("where", () => {
        const query = new Query(TestClazz);
        query.where(where => {
            where.contains(x => x.description, "abc");
            where.greatValue(x => x.id, 1);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(2);
        expect(result[0].params[0]).to.equal("%abc%");
        expect(result[0].params[1]).to.equal(1);
        expect(result[0].query).to.equal("SELECT tes.* FROM TestClazz AS tes WHERE tes.description LIKE ? AND tes.id > ?");
    });

    it("select (projections)", () => {
        const query = new Query(TestClazz);
        query.projection(projection => {
            projection.add(x => x.description);
            projection.sum(x => x.id);
            projection.max(x => x.referenceTest.id);
            projection.count(x => x.id, "countId");
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.description AS description, SUM(tes.id) AS id, MAX(tes.referenceTest_id) AS referenceTest_id, COUNT(tes.id) AS countId FROM TestClazz AS tes");
    });

    it("order by", () => {
        const query = new Query(TestClazz);
        query.orderBy(x => x.id);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.* FROM TestClazz AS tes ORDER BY tes.id ASC");
    });

    it("group by", () => {
        const query = new Query(TestClazz);
        query.groupBy(x => x.id, (having, projection) => {
            having.greatValue(projection.count(x => x.id), 10);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(10);
        expect(result[0].query).to.equal("SELECT tes.* FROM TestClazz AS tes GROUP BY tes.id HAVING COUNT(tes.id) > ?");
    });

    it("limit and offset", () => {
        const query = new Query(TestClazz);
        query.limit(10, 5);
        const result = query.compile();
        expect(result[0].params.length).to.equal(2);
        expect(result[0].params[0]).to.equal(10);
        expect(result[0].params[1]).to.equal(5);
        expect(result[0].query).to.equal("SELECT tes.* FROM TestClazz AS tes LIMIT ? OFFSET ?");
    });

});
