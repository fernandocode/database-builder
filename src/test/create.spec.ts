import { Cliente } from "./models/cliente";
import { ContasAReceber } from "./models/contas-a-receber";
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
import { Referencia } from "./models/referencia";
import { GetMapper } from "../mapper";

describe("Create", () => {

    let mapper: GetMapper;

    before(async () => {
        mapper = getMapper();
    });

    it("Classificacao", () => {
        const create = new Create(Classificacao, mapper.get(Classificacao).mapperTable);
        const result = create.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`CREATE TABLE IF NOT EXISTS Classificacao( codeImport INTEGER NOT NULL PRIMARY KEY, descricao TEXT )`);
    });

    it("Regiao", () => {
        const create = new Create(Regiao, mapper.get(Regiao).mapperTable);
        const result = create.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`CREATE TABLE IF NOT EXISTS Regiao( codeImport INTEGER NOT NULL PRIMARY KEY, nome TEXT )`);
    });

    it("SubRegiao", () => {
        const create = new Create(SubRegiao, mapper.get(SubRegiao).mapperTable);
        const result = create.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`CREATE TABLE IF NOT EXISTS SubRegiao( codeImport INTEGER NOT NULL PRIMARY KEY, nome TEXT, regiao_codeImport INTEGER )`);
    });

    it("Uf", () => {
        const create = new Create(Uf, mapper.get(Uf).mapperTable);
        const result = create.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`CREATE TABLE IF NOT EXISTS Uf( codeImport TEXT NOT NULL PRIMARY KEY, nome TEXT, population INTEGER )`);
    });

    it("Cidade", () => {
        const create = new Create(Cidade, mapper.get(Cidade).mapperTable);
        const result = create.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`CREATE TABLE IF NOT EXISTS Cidade( codeImport INTEGER NOT NULL PRIMARY KEY, nome TEXT, population INTEGER, subRegiao_codeImport INTEGER, uf_codeImport TEXT )`);
    });

    it("Cliente", () => {
        const create = new Create(Cliente, mapper.get(Cliente).mapperTable);
        const result = create.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`CREATE TABLE IF NOT EXISTS Cliente( idErp INTEGER, versao INTEGER, id TEXT NOT NULL PRIMARY KEY, deleted BOOLEAN, razaoSocial TEXT, nomeFantasia TEXT, cidade_codeImport INTEGER, change BOOLEAN )`);
    });

    it("Marca", () => {
        const create = new Create(Marca, mapper.get(Marca).mapperTable);
        const result = create.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`CREATE TABLE IF NOT EXISTS Marca( codeImport INTEGER, internalKey INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, descricao TEXT )`);
    });

    it("CondicaoPagamento", () => {
        const create = new Create(CondicaoPagamento, mapper.get(CondicaoPagamento).mapperTable);
        const result = create.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`CREATE TABLE IF NOT EXISTS CondicaoPagamento( codeImport INTEGER NOT NULL PRIMARY KEY, nome TEXT )`);
    });

    it("Pedido", () => {
        const create = new Create(Pedido, mapper.get(Pedido).mapperTable);
        const result = create.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`CREATE TABLE IF NOT EXISTS Pedido( codeImport INTEGER, internalKey INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, cliente_id TEXT, marca_internalKey INTEGER, condicaoPagamento_codeImport INTEGER )`);
    });

    it("ContasAReceber", () => {
        const create = new Create(ContasAReceber, mapper.get(ContasAReceber).mapperTable);
        const result = create.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`CREATE TABLE IF NOT EXISTS ContasAReceber( versao INTEGER, idErp INTEGER NOT NULL PRIMARY KEY, deleted BOOLEAN, dataVencimento INTEGER, valor INTEGER, dataRecebimento INTEGER, cliente_idErp INTEGER )`);
    });

    it("Test create", () => {
        const create = new Create(TestClazzList, mapper.get(TestClazzList).mapperTable);
        const result = create.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`CREATE TABLE IF NOT EXISTS TestClazzList( internalKey INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, id INTEGER, description TEXT, reference_id INTEGER )`);
    });

    it("TestClazzRefCode", () => {
        const create = new Create(TestClazzRefCode, mapper.get(TestClazzRefCode).mapperTable);
        const result = create.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`CREATE TABLE IF NOT EXISTS TestClazzRefCode( code TEXT NOT NULL PRIMARY KEY, description TEXT, reference_description TEXT )`);
    });

    it("TestClazz", () => {
        const create = new Create(TestClazz, mapper.get(TestClazz).mapperTable);
        const result = create.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`CREATE TABLE IF NOT EXISTS TestClazz( internalKey INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, id INTEGER, description TEXT, date INTEGER, dateMoment INTEGER, dateDate INTEGER, numero INTEGER, referenceTest_id INTEGER, referenceTestCode_code TEXT, dateStr INTEGER )`);
    });

    it("LoginOffline", () => {
        const create = new Create(LoginOffline, mapper.get(LoginOffline).mapperTable);
        const result = create.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`CREATE TABLE IF NOT EXISTS LoginOffline( internalKey INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, id INTEGER, hash TEXT, permissions TEXT )`);
    });

    it("Test circular references", () => {
        const create = new Create(TestClazzRef, mapper.get(TestClazzRef).mapperTable);
        const result = create.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`CREATE TABLE IF NOT EXISTS TestClazzRef( id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, description TEXT, autoReference_id INTEGER )`);
    });

    it("GuidClazz", () => {
        const create = new Create(GuidClazz, mapper.get(GuidClazz).mapperTable);
        const result = create.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`CREATE TABLE IF NOT EXISTS GuidClazz( guid TEXT NOT NULL PRIMARY KEY, description TEXT )`);
    });

    it("HeaderSimple cascade", () => {
        const create = new Create(HeaderSimple, mapper.get(HeaderSimple).mapperTable);
        const result = create.compile();
        expect(result.length).to.equal(2);
        expect(result[0].query).to.equal(`CREATE TABLE IF NOT EXISTS HeaderSimple( id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, descricao TEXT )`);
        expect(result[1].query).to.equal(`CREATE TABLE IF NOT EXISTS ItemHeaderSimple( indexArray INTEGER, value TEXT, HeaderSimple_id INTEGER , PRIMARY KEY (indexArray, HeaderSimple_id) )`);
    });

    it("Referencia cascade", () => {
        const create = new Create(Referencia, mapper.get(Referencia).mapperTable);
        const result = create.compile();
        expect(result.length).to.equal(3);
        expect(result[0].query).to.equal(`CREATE TABLE IF NOT EXISTS Referencia( codeImport INTEGER NOT NULL PRIMARY KEY, codigo TEXT, descricao TEXT, deleted BOOLEAN )`);
        expect(result[1].query).to.equal(`CREATE TABLE IF NOT EXISTS RestricaoGrade( indexArray INTEGER, value TEXT, Referencia_codeImport INTEGER , PRIMARY KEY (indexArray, Referencia_codeImport) )`);
        expect(result[2].query).to.equal(`CREATE TABLE IF NOT EXISTS ReferenciasRelacionadas( indexArray INTEGER, value INTEGER, Referencia_codeImport INTEGER , PRIMARY KEY (indexArray, Referencia_codeImport) )`);
    });

});
