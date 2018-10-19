import { expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import { Ddl } from "../ddl";
import { getMapper } from "./mappers-table-new";

describe("Drop", () => {

    const dll = new Ddl({} as any, getMapper());

    it("by type", () => {
        const drop = dll.drop(TestClazz);
        const result = drop.compile();
        expect(result[0]).to.equal("DROP TABLE IF EXISTS TestClazz;");
    });

    // Deprecated
    // it("by name", () => {
    //     const drop = dll.drop("AbC");
    //     const result = drop.compile();
    //     expect(result[0]).to.equal("DROP TABLE IF EXISTS AbC;");
    // });
});
