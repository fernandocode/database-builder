import { Pedido } from "./models/pedido";
import { Marca } from "./models/marca";
import { CondicaoPagamento } from "./models/condicao-pagamento";
import { Regiao } from "./models/regiao";
import { Uf } from "./models/uf";
import { Classificacao } from "./models/classificacao";
import { SubRegiao } from "./models/sub-regiao";
import { Cliente } from "./models/cliente";
import { expect } from "chai";
import { Cidade } from "./models/cidade";
import { getMapper } from "./mappers-table-new";
import { ObjectToTest } from "./objeto-to-test";
import { GuidClazz } from "./models/guid-clazz";
import { TestClazzRefCode } from "./models/test-clazz-ref-code";
import { Insert } from "../crud/insert/insert";
import { ContasAReceber } from "./models/contas-a-receber";
import * as moment from "moment";
import { DatetimeUtils } from "../datetime-utils";

describe("Insert", () => {
    const mapper = getMapper();

    it("Classificacao (insert key Assigned value 0)", () => {
        const result = new Insert(Classificacao, ObjectToTest.classificacao, mapper.get(Classificacao).mapperTable).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.classificacao.codeImport, ObjectToTest.classificacao.descricao
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO Classificacao (codeImport, descricao) VALUES (?, ?)");
    });

    it("Regiao", () => {
        const result = new Insert(Regiao, ObjectToTest.regiao, mapper.get(Regiao).mapperTable).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.regiao.codeImport, ObjectToTest.regiao.nome
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO Regiao (codeImport, nome) VALUES (?, ?)");
    });

    it("Regiao (primary key Assigned) key not informed!", () => {
        const sql = new Insert(Regiao, {
            nome: "Sul"
        } as Regiao, mapper.get(Regiao).mapperTable);
        expect(() => sql.compile()).to.throw("Primary key to be informed when generation strategy is 'Assigned'!");
    });

    it("SubRegiao", () => {
        const result = new Insert(SubRegiao, ObjectToTest.subRegiao, mapper.get(SubRegiao).mapperTable).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.subRegiao.codeImport, ObjectToTest.subRegiao.nome,
            ObjectToTest.subRegiao.regiao.codeImport
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO SubRegiao (codeImport, nome, regiao_codeImport) VALUES (?, ?, ?)");
    });

    it("Uf", () => {
        const result = new Insert(Uf, ObjectToTest.uf, mapper.get(Uf).mapperTable).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.uf.codeImport, ObjectToTest.uf.nome, ObjectToTest.uf.population
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO Uf (codeImport, nome, population) VALUES (?, ?, ?)");
    });

    it("Cidade", () => {
        const result = new Insert(Cidade, ObjectToTest.cidade, mapper.get(Cidade).mapperTable).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.cidade.codeImport,
            ObjectToTest.cidade.nome,
            ObjectToTest.cidade.population,
            ObjectToTest.cidade.subRegiao.codeImport,
            ObjectToTest.cidade.uf.codeImport,
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO Cidade (codeImport, nome, population, subRegiao_codeImport, uf_codeImport) VALUES (?, ?, ?, ?, ?)");
    });

    it("Cliente", () => {
        const result = new Insert(Cliente, ObjectToTest.cliente, mapper.get(Cliente).mapperTable).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.cliente.idErp,
            ObjectToTest.cliente.versao,
            ObjectToTest.cliente.id,
            ObjectToTest.cliente.deleted,
            ObjectToTest.cliente.razaoSocial,
            ObjectToTest.cliente.nomeFantasia,
            ObjectToTest.cliente.cidade.codeImport,
            ObjectToTest.cliente.change
            // ObjectToTest.cliente.classificacao.codeImport
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO Cliente (idErp, versao, id, deleted, razaoSocial, nomeFantasia, cidade_codeImport, change) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    });

    it("Marca", () => {
        const result = new Insert(Marca, ObjectToTest.marca, mapper.get(Marca).mapperTable).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.marca.codeImport, ObjectToTest.marca.descricao
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO Marca (codeImport, descricao) VALUES (?, ?)");
    });

    it("CondicaoPagamento", () => {
        const result = new Insert(CondicaoPagamento, ObjectToTest.condicaoPagamento, mapper.get(CondicaoPagamento).mapperTable).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.condicaoPagamento.codeImport, ObjectToTest.condicaoPagamento.nome
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO CondicaoPagamento (codeImport, nome) VALUES (?, ?)");
    });

    it("Pedido", () => {
        const result = new Insert(Pedido, ObjectToTest.pedido, mapper.get(Pedido).mapperTable).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.pedido.codeImport, ObjectToTest.pedido.cliente.id, ObjectToTest.pedido.marca.internalKey,
            ObjectToTest.pedido.condicaoPagamento.codeImport
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO Pedido (codeImport, cliente_id, marca_internalKey, condicaoPagamento_codeImport) VALUES (?, ?, ?, ?)");
    });

    it("GuidClazz", () => {
        const result = new Insert(GuidClazz, ObjectToTest.guidClazz, mapper.get(GuidClazz).mapperTable).compile();
        expect(result[0].params[0]).to.length(36);
        expect(result[0].params[1]).to.equal(ObjectToTest.guidClazz.description);
        expect(result[0].query).to.equal("INSERT INTO GuidClazz (guid, description) VALUES (?, ?)");
    });

    it("TestClazzRefCode", () => {
        const result = new Insert(TestClazzRefCode, ObjectToTest.testClazzRefCode, mapper.get(TestClazzRefCode).mapperTable).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.testClazzRefCode.code, ObjectToTest.testClazzRefCode.description, ObjectToTest.testClazzRefCode.reference.description
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO TestClazzRefCode (code, description, reference_description) VALUES (?, ?, ?)");
    });

    it("TestClazzRefCode", () => {
        const result = new Insert(TestClazzRefCode, ObjectToTest.testClazzRefCode, mapper.get(TestClazzRefCode).mapperTable).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.testClazzRefCode.code, ObjectToTest.testClazzRefCode.description, ObjectToTest.testClazzRefCode.reference.description
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO TestClazzRefCode (code, description, reference_description) VALUES (?, ?, ?)");
    });

    it("ContasAReceber", () => {
        const result = new Insert(ContasAReceber, ObjectToTest.contasReceber, mapper.get(ContasAReceber).mapperTable).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.contasReceber.versao,
            ObjectToTest.contasReceber.idErp,
            ObjectToTest.contasReceber.deleted,
            (ObjectToTest.contasReceber.dataVencimento as moment.Moment).unix(),
            void 0,
            ObjectToTest.contasReceber.valor,
            ObjectToTest.contasReceber.cliente.idErp
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO ContasAReceber (versao, idErp, deleted, dataVencimento, dataRecebimento, valor, cliente_idErp) VALUES (?, ?, ?, ?, ?, ?, ?)");
    });

    it("ContasAReceber date string", () => {
        const contasReceber = {
            idErp: 11,
            valor: 1034.42,
            cliente: ObjectToTest.cliente,
            dataRecebimento: void 0,
            dataVencimento: DatetimeUtils.datetimeToDate("2010-01-28T00:00:00-02:00")
        } as ContasAReceber;
        const result = new Insert(ContasAReceber, contasReceber, mapper.get(ContasAReceber).mapperTable).compile();
        expect(result[0].params.toString()).to.equal([
            contasReceber.versao,
            contasReceber.idErp,
            contasReceber.deleted,
            DatetimeUtils.dateToDatabase(contasReceber.dataVencimento),
            void 0,
            contasReceber.valor,
            contasReceber.cliente.idErp
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO ContasAReceber (versao, idErp, deleted, dataVencimento, dataRecebimento, valor, cliente_idErp) VALUES (?, ?, ?, ?, ?, ?, ?)");
    });
});
