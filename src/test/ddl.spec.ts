import { TestClazzList } from "./models/test-clazz-list";
import { Ddl } from "./../ddl/ddl";
import { Query } from "./../crud/query/query";
import { Regiao } from "./models/regiao";
import { Uf } from "./models/uf";
import { Classificacao } from "./models/classificacao";
import { ProjectionCompiled } from "./../crud/projection-compiled";
import { Projection } from "./../crud/enums/projection";
import { SubRegiao } from "./models/sub-regiao";
import { Cliente } from "./models/cliente";
import { assert, expect } from "chai";
import { Cidade } from "./models/cidade";
import { Operator } from "../crud/enums/operator";
import { Crud, Insert } from "../index";
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
