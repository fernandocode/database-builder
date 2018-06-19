import { TestClazzList } from "./models/test-clazz-list";
import { expect } from "chai";
import { MappersTable } from "./mappers-table";
import { CreateBuilder } from "../ddl/create/create-builder";

const mappersTable = new MappersTable();

describe("ddl", () => {

    it("Test create", () => {
        const create = new CreateBuilder(TestClazzList, mappersTable.getMapper(TestClazzList));
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS TestClazzList(
            key INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            id INTEGER, description TEXT, reference_id INTEGER
            );`);
    });

});
