import { MappersTableNew } from "./mappers-table-new";
import { Pedido } from "./models/pedido";
import { TestClazzList } from "./models/test-clazz-list";
import { expect } from "chai";
// import { MappersTable } from "./mappers-table";
import { CreateBuilder } from "../ddl/create/create-builder";
import { TestClazz } from "./models/test-clazz";
import { Cliente } from "./models/cliente";
import { Cidade } from "./models/cidade";

// const mappersTable = new MappersTable();

// TODO: comment
describe("ddl", () => {

    const mapper = new MappersTableNew();

    it("Test create Cidade", () => {
        const create = new CreateBuilder(Cidade, mapper.getMapper(Cidade));
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS Cidade( codeImport INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, internalKey INTEGER, nome TEXT, uf_codeImport TEXT, subRegiao_codeImport INTEGER );`);
    });

    // it("Test create", () => {
    //     const create = new CreateBuilder(TestClazzList, mappersTable.getMapper(TestClazzList));
    //     const result = create.compile();
    //     expect(result.length > 0).to.equal(true);
    //     expect(result).to.equal(`CREATE TABLE IF NOT EXISTS TestClazzList( internalKey INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, id INTEGER, description TEXT, reference_id INTEGER );`);
    // });

    // it("Test create TestClazz", () => {
    //     const create = new CreateBuilder(TestClazz, mappersTable.getMapper(TestClazz));
    //     const result = create.compile();
    //     expect(result.length > 0).to.equal(true);
    //     expect(result).to.equal(`CREATE TABLE IF NOT EXISTS TestClazz( internalKey INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, referenceTestCode_code TEXT, id INTEGER, description TEXT, disabled BOOLEAN, date INTEGER, dateMoment INTEGER, dateDate INTEGER, numero INTEGER, referenceTest_id INTEGER );`);
    // });

    it("Test create Cliente", () => {
        const create = new CreateBuilder(Cliente, mapper.getMapper(Cliente));
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS Cliente( internalKey INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, codeImport INTEGER, razaoSocial TEXT, apelido TEXT, desativo BOOLEAN, cidade_codeImport INTEGER, classificacao_codeImport INTEGER );`);
    });

    it("Test create Pedido", () => {
        const create = new CreateBuilder(Pedido, mapper.getMapper(Pedido));
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS Pedido( internalKey INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, codeImport INTEGER, cliente_internalKey INTEGER, marca_internalKey INTEGER, condicaoPagamento_codeImport INTEGER );`);
    });

    // it("Test create Pedido", () => {
    //     const create = new CreateBuilder(Pedido, mappersTable.getMapper(Pedido));
    //     const result = create.compile();
    //     expect(result.length > 0).to.equal(true);
    //     expect(result).to.equal(`CREATE TABLE IF NOT EXISTS Pedido( key INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, id INTEGER );`);
    // });

});
