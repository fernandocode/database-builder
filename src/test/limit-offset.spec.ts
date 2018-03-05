import { assert, expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import { Query } from "..";
import { OrderBy } from "../core/enums/order-by";

describe("Limit and Offset", () => {

    it("limit", () => {
        const query = new Query(TestClazz);
        query.limit(12);
        const result = query.compile();
        expect(result.params.length).to.equal(1);
        expect(result.params[0]).to.equal(12);
        expect(result.query).to.equal("SELECT tes.* FROM TestClazz AS tes LIMIT ?");
    });

    // it("offset", () => {
    //     const query = new Query(TestClazz);
    //     query.offset(2);
    //     const result = query.compile();
    //     expect(result.params.length).to.equal(1);
    //     expect(result.params[0]).to.equal(2);
    //     expect(result.query).to.equal("SELECT tes.* FROM TestClazz AS tes OFFSET ?");
    // });

    it("limit with offset", () => {
        const query = new Query(TestClazz);
        query.limit(9, 3);
        const result = query.compile();
        expect(result.params.length).to.equal(2);
        expect(result.params[0]).to.equal(9);
        expect(result.params[1]).to.equal(3);
        expect(result.query).to.equal("SELECT tes.* FROM TestClazz AS tes LIMIT ? OFFSET ?");
    });

});
