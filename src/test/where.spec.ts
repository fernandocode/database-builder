import { assert, expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import { Query } from "..";

describe("Where", () => {

    it("none", () => {
        const query = new Query(TestClazz);
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT tes.* FROM TestClazz AS tes");
    });

    it("simple", () => {
        const query = new Query(TestClazz);
        query.where(where => {
            where.equalValue(x => x.id, 2);
        });
        const result = query.compile();
        expect(result.params.length).to.equal(1);
        expect(result.params[0]).to.equal(2);
        expect(result.query).to.equal("SELECT tes.* FROM TestClazz AS tes WHERE tes.id = ?");
    });

    it("simple 2", () => {
        const query = new Query(TestClazz);
        query.where(where => {
            where.eq(x => x.id, 2);
            where.eq(x => x.id, x => x.referenceTest.id);
        });
        const result = query.compile();
        expect(result.params.length).to.equal(1);
        expect(result.params[0]).to.equal(2);
        expect(result.query).to.equal("SELECT tes.* FROM TestClazz AS tes WHERE tes.id = ? AND tes.id = tes.referenceTest_id");
    });

    it("simple 3", () => {
        const query = new Query(TestClazz);
        query.where(where => {
            where.equalValue(x => x.id, 2);
            where.equalColumn(x => x.id, "referenceTest_id");
        });
        const result = query.compile();
        expect(result.params.length).to.equal(1);
        expect(result.params[0]).to.equal(2);
        expect(result.query).to.equal("SELECT tes.* FROM TestClazz AS tes WHERE tes.id = ? AND tes.id = tes.referenceTest_id");
    });

    // it("simple 4", () => {
    //     const query = new Query(TestClazz);
    //     query.where(where => {
    //         where.equalValue(x => x.id, 2);
    //         where.equal(x => x.id, "referenceTest_id");
    //     });
    //     const result = query.compile();
    //     expect(result.params.length).to.equal(1);
    //     expect(result.params[0]).to.equal(2);
    //     expect(result.query).to.equal("SELECT tes.* FROM TestClazz AS tes WHERE tes.id = ? AND tes.id = tes.referenceTest_id");
    // });

    // it("simple 5", () => {
    //     const query = new Query(TestClazz);
    //     query.where(where => {
    //         where.equalValue(x => x.id, 2);
    //         where.equal(x => x.id, "abc.referenceTest_id");
    //     });
    //     const result = query.compile();
    //     expect(result.params.length).to.equal(1);
    //     expect(result.params[0]).to.equal(2);
    //     expect(result.query).to.equal("SELECT tes.* FROM TestClazz AS tes WHERE tes.id = ? AND tes.id = abc.referenceTest_id");
    // });

    it("simple cross", () => {
        const query1 = new Query(TestClazz);
        query1.where(where => {
            where.equalValue(x => x.id, 2);
            where.equal(x => x.id, x => x.referenceTest.id);
        });
        const result1 = query1.compile();

        const query2 = new Query(TestClazz);
        query2.where(where => {
            where.eq(x => x.id, 2);
            where.eq(x => x.id, x => x.referenceTest.id);
        });
        const result2 = query2.compile();

        expect(result1.params.length).to.equal(result2.params.length);
        expect(result1.params[0]).to.equal(result2.params[0]);
        expect(result1.query).to.equal(result2.query);
    });

});
