import { expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import { OrderBy } from "../core/enums/order-by";
import { Query } from "../crud/query/query";

describe("Order By", () => {

    it("none", () => {
        const query = new Query(TestClazz);
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT tes.* FROM TestClazz AS tes");
    });

    it("simple", () => {
        const query = new Query(TestClazz);
        query.orderBy(x => x.id);
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT tes.* FROM TestClazz AS tes ORDER BY tes.id ASC");
    });

    it("multi", () => {
        const query = new Query(TestClazz);
        query.orderBy(x => x.id);
        query.orderBy(x => x.referenceTest.id);
        query.orderBy(x => x.description);
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT tes.* FROM TestClazz AS tes ORDER BY tes.id ASC, tes.referenceTest_id ASC, tes.description ASC");
    });

    it("asc", () => {
        const query = new Query(TestClazz);
        query.asc(x => x.id);
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT tes.* FROM TestClazz AS tes ORDER BY tes.id ASC");
    });

    it("desc", () => {
        const query = new Query(TestClazz);
        query.desc(x => x.id);
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT tes.* FROM TestClazz AS tes ORDER BY tes.id DESC");
    });

    it("multi order", () => {
        const query = new Query(TestClazz);
        query.desc(x => x.id);
        query.asc(x => x.referenceTest.id);
        query.orderBy(x => x.description, OrderBy.DESC);
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT tes.* FROM TestClazz AS tes ORDER BY tes.id DESC, tes.referenceTest_id ASC, tes.description DESC");
    });

    it("with string", () => {
        const query = new Query(TestClazz);
        query.projection(select => {
            select.add(`strftime('%m', datetime(${select.ref(x => x.date).result()}, 'unixepoch'))`, "month");
        });
        query.asc(`strftime('%m', datetime(${query.ref(x => x.date).result()}, 'unixepoch'))`);
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT strftime('%m', datetime(tes.date, 'unixepoch')) AS month FROM TestClazz AS tes ORDER BY strftime('%m', datetime(tes.date, 'unixepoch')) ASC");
    });

});
