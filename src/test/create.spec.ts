import { Cliente } from "./models/cliente";
import { ContasReceber } from "./models/contas-receber";
import { Create } from "./../ddl/create/create";
import { CondicaoPagamento } from "./models/condicao-pagamento";
import { Marca } from "./models/marca";
import { getMapper } from "./mappers-table-new";
import { Pedido } from "./models/pedido";
import { TestClazzList } from "./models/test-clazz-list";
import { expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import { LoginOffline } from "./models/login-offline";
import { Cidade } from "./models/cidade";
import { Uf } from "./models/uf";
import { SubRegiao } from "./models/sub-regiao";
import { Regiao } from "./models/regiao";
import { Classificacao } from "./models/classificacao";
import { TestClazzRef } from "./models/test-clazz-ref";
import { TestClazzRefCode } from "./models/test-clazz-ref-code";
import { GuidClazz } from "./models/guid-clazz";
import { HeaderSimple } from "./models/header-simple";

describe("Create", () => {

    const mapper = getMapper();

    it("Classificacao", () => {
        const create = new Create(Classificacao, mapper.get(Classificacao).mapperTable);
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS Classificacao( codeImport INTEGER NOT NULL PRIMARY KEY, descricao TEXT );`);
    });

    it("Regiao", () => {
        const create = new Create(Regiao, mapper.get(Regiao).mapperTable);
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS Regiao( codeImport INTEGER NOT NULL PRIMARY KEY, nome TEXT );`);
    });

    it("SubRegiao", () => {
        const create = new Create(SubRegiao, mapper.get(SubRegiao).mapperTable);
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS SubRegiao( codeImport INTEGER NOT NULL PRIMARY KEY, nome TEXT, regiao_codeImport INTEGER );`);
    });

    it("Uf", () => {
        const create = new Create(Uf, mapper.get(Uf).mapperTable);
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS Uf( codeImport TEXT NOT NULL PRIMARY KEY, nome TEXT );`);
    });

    it("Cidade", () => {
        const create = new Create(Cidade, mapper.get(Cidade).mapperTable);
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS Cidade( codeImport INTEGER NOT NULL PRIMARY KEY, nome TEXT, uf_codeImport TEXT, subRegiao_codeImport INTEGER );`);
    });

    it("Cliente", () => {
        const create = new Create(Cliente, mapper.get(Cliente).mapperTable);
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS Cliente( internalKey INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, codeImport INTEGER, razaoSocial TEXT, apelido TEXT, desativo BOOLEAN, cidade_codeImport INTEGER, classificacao_codeImport INTEGER );`);
    });

    it("Marca", () => {
        const create = new Create(Marca, mapper.get(Marca).mapperTable);
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS Marca( internalKey INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, codeImport INTEGER, descricao TEXT );`);
    });

    it("CondicaoPagamento", () => {
        const create = new Create(CondicaoPagamento, mapper.get(CondicaoPagamento).mapperTable);
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS CondicaoPagamento( codeImport INTEGER NOT NULL PRIMARY KEY, nome TEXT );`);
    });

    it("Pedido", () => {
        const create = new Create(Pedido, mapper.get(Pedido).mapperTable);
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS Pedido( internalKey INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, codeImport INTEGER, cliente_internalKey INTEGER, marca_internalKey INTEGER, condicaoPagamento_codeImport INTEGER );`);
    });

    it("ContasReceber", () => {
        const create = new Create(ContasReceber, mapper.get(ContasReceber).mapperTable);
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS ContasReceber( internalKey INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, codeImport INTEGER, valor INTEGER, dataRecebimento INTEGER, dataVencimento INTEGER, cliente_codeImport INTEGER );`);
    });

    it("Test create", () => {
        const create = new Create(TestClazzList, mapper.get(TestClazzList).mapperTable);
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS TestClazzList( internalKey INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, id INTEGER, description TEXT, reference_id INTEGER );`);
    });

    it("TestClazzRefCode", () => {
        const create = new Create(TestClazzRefCode, mapper.get(TestClazzRefCode).mapperTable);
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS TestClazzRefCode( code TEXT NOT NULL PRIMARY KEY, description TEXT, reference_description TEXT );`);
    });

    it("TestClazz", () => {
        const create = new Create(TestClazz, mapper.get(TestClazz).mapperTable);
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS TestClazz( internalKey INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, id INTEGER, description TEXT, date INTEGER, dateMoment INTEGER, dateDate INTEGER, numero INTEGER, referenceTest_id INTEGER, referenceTestCode_code TEXT );`);
    });

    it("LoginOffline", () => {
        const create = new Create(LoginOffline, mapper.get(LoginOffline).mapperTable);
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS LoginOffline( internalKey INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, id INTEGER, hash TEXT, permissions TEXT );`);
    });

    it("Test circular references", () => {
        const create = new Create(TestClazzRef, mapper.get(TestClazzRef).mapperTable);
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS TestClazzRef( id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, description TEXT, autoReference_id INTEGER );`);
    });

    it("GuidClazz", () => {
        const create = new Create(GuidClazz, mapper.get(GuidClazz).mapperTable);
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS GuidClazz( guid TEXT NOT NULL PRIMARY KEY, description TEXT );`);
    });

    it("HeaderSimple", () => {
        const create = new Create(HeaderSimple, mapper.get(HeaderSimple).mapperTable);
        const result = create.compile();
        expect(result.length > 0).to.equal(true);
        expect(result).to.equal(`CREATE TABLE IF NOT EXISTS HeaderSimple( id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, descricao TEXT );\nCREATE TABLE IF NOT EXISTS ItemHeaderSimple( indexArray INTEGER, value TEXT, HeaderSimple_id INTEGER , PRIMARY KEY (indexArray, HeaderSimple_id) );`);
    });

});
