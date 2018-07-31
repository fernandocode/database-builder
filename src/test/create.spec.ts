import { Create } from "./../ddl/create/create";
import { CondicaoPagamento } from "./models/condicao-pagamento";
import { Marca } from "./models/marca";
import { MappersTableNew } from "./mappers-table-new";
import { Pedido } from "./models/pedido";
import { TestClazzList } from "./models/test-clazz-list";
import { expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import { Cliente } from "./models/cliente";
import { Cidade } from "./models/cidade";
import { Uf } from "./models/uf";
import { SubRegiao } from "./models/sub-regiao";
import { Regiao } from "./models/regiao";
import { Classificacao } from "./models/classificacao";

describe("Create", () => {

    const mapper = new MappersTableNew();

    it("Classificacao", () => {
        const create = new Create(Classificacao, mapper.get(Classificacao));
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS Classificacao( codeImport INTEGER NOT NULL PRIMARY KEY, descricao TEXT );`);
    });

    it("Regiao", () => {
        const create = new Create(Regiao, mapper.get(Regiao));
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS Regiao( codeImport INTEGER NOT NULL PRIMARY KEY, nome TEXT );`);
    });

    it("SubRegiao", () => {
        const create = new Create(SubRegiao, mapper.get(SubRegiao));
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS SubRegiao( codeImport INTEGER NOT NULL PRIMARY KEY, nome TEXT, regiao_codeImport INTEGER );`);
    });

    it("Uf", () => {
        const create = new Create(Uf, mapper.get(Uf));
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS Uf( codeImport TEXT NOT NULL PRIMARY KEY, nome TEXT );`);
    });

    it("Cidade", () => {
        const create = new Create(Cidade, mapper.get(Cidade));
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS Cidade( codeImport INTEGER NOT NULL PRIMARY KEY, nome TEXT, uf_codeImport TEXT, subRegiao_codeImport INTEGER );`);
    });

    it("Cliente", () => {
        const create = new Create(Cliente, mapper.get(Cliente));
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS Cliente( internalKey INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, codeImport INTEGER, razaoSocial TEXT, apelido TEXT, desativo BOOLEAN, cidade_codeImport INTEGER, classificacao_codeImport INTEGER );`);
    });

    it("Marca", () => {
        const create = new Create(Marca, mapper.get(Marca));
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS Marca( internalKey INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, codeImport INTEGER, descricao TEXT );`);
    });

    it("CondicaoPagamento", () => {
        const create = new Create(CondicaoPagamento, mapper.get(CondicaoPagamento));
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS CondicaoPagamento( codeImport INTEGER NOT NULL PRIMARY KEY, nome TEXT );`);
    });

    it("Pedido", () => {
        const create = new Create(Pedido, mapper.get(Pedido));
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS Pedido( internalKey INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, codeImport INTEGER, cliente_internalKey INTEGER, marca_internalKey INTEGER, condicaoPagamento_codeImport INTEGER );`);
    });

    it("Test create", () => {
        const create = new Create(TestClazzList, mapper.get(TestClazzList));
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS TestClazzList( internalKey INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, id INTEGER, description TEXT, reference_id INTEGER );`);
    });

    it("TestClazz", () => {
        const create = new Create(TestClazz, mapper.get(TestClazz));
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS TestClazz( internalKey INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, id INTEGER, description TEXT, disabled BOOLEAN, date INTEGER, dateMoment INTEGER, dateDate INTEGER, numero INTEGER, referenceTest_id INTEGER, referenceTestCode_code TEXT );`);
    });

});
