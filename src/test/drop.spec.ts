import { expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import { Ddl } from "../ddl";
import { getMapper } from "./mappers-table-new";

describe("Drop", () => {

    const dll = new Ddl({getMapper: getMapper()});

    it("by type", () => {
        const drop = dll.drop(TestClazz);
        const result = drop.compile();
        expect(result[0].query).to.equal("DROP TABLE IF EXISTS TestClazz");
    });
});
