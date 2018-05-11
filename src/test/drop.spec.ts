import { assert, expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import { DropBuilder } from "../ddl/drop/drop-builder";

describe("Drop", () => {

    it("by type", () => {
        const drop = new DropBuilder(TestClazz);
        const result = drop.compile();
        expect(result).to.equal("DROP TABLE IF EXISTS TestClazz;");
    });

    it("by name", () => {
        const drop = new DropBuilder("AbC");
        const result = drop.compile();
        expect(result).to.equal("DROP TABLE IF EXISTS AbC;");
    });
});
