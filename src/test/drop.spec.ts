import { expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import { Drop } from "../ddl/drop/drop";

describe("Drop", () => {

    it("by type", () => {
        const drop = new Drop(TestClazz);
        const result = drop.compile();
        expect(result).to.equal("DROP TABLE IF EXISTS TestClazz;");
    });

    it("by name", () => {
        const drop = new Drop("AbC");
        const result = drop.compile();
        expect(result).to.equal("DROP TABLE IF EXISTS AbC;");
    });
});
