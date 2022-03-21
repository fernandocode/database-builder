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
import { TestClazz } from "./models/test-clazz";
import { Utils } from "../core/utils";
import { FieldType } from "../core/enums/field-type";

describe("Insert", () => {
    const mapper = getMapper();

    it("Classificacao (insert key Assigned value 0)", () => {
        const result = new Insert(Classificacao, { modelToSave: ObjectToTest.classificacao, mapperTable: mapper.get(Classificacao).mapperTable }).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.classificacao.codeImport, ObjectToTest.classificacao.descricao
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO Classificacao (codeImport, descricao) VALUES (?, ?)");
    });

    it("Regiao", () => {
        const result = new Insert(Regiao, { modelToSave: ObjectToTest.regiao, mapperTable: mapper.get(Regiao).mapperTable }).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.regiao.codeImport, ObjectToTest.regiao.nome
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO Regiao (codeImport, nome) VALUES (?, ?)");
    });

    it("Regiao (primary key Assigned) key not informed!", () => {
        const sql = new Insert(Regiao, {
            modelToSave: {
                nome: "Sul"
            } as Regiao,
            mapperTable: mapper.get(Regiao).mapperTable
        });
        expect(() => sql.compile()).to.throw("Primary key to be informed when generation strategy is 'Assigned'!");
    });

    it("SubRegiao", () => {
        const result = new Insert(SubRegiao, { modelToSave: ObjectToTest.subRegiao, mapperTable: mapper.get(SubRegiao).mapperTable }).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.subRegiao.codeImport, ObjectToTest.subRegiao.nome,
            ObjectToTest.subRegiao.regiao.codeImport
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO SubRegiao (codeImport, nome, regiao_codeImport) VALUES (?, ?, ?)");
    });

    it("Uf", () => {
        const result = new Insert(Uf, { modelToSave: ObjectToTest.uf, mapperTable: mapper.get(Uf).mapperTable }).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.uf.codeImport, ObjectToTest.uf.nome, ObjectToTest.uf.population
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO Uf (codeImport, nome, population) VALUES (?, ?, ?)");
    });

    it("Cidade", () => {
        const result = new Insert(Cidade, { modelToSave: ObjectToTest.cidade, mapperTable: mapper.get(Cidade).mapperTable }).compile();
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
        const result = new Insert(Cliente, { modelToSave: ObjectToTest.cliente, mapperTable: mapper.get(Cliente).mapperTable }).compile();
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
        const result = new Insert(Marca, { modelToSave: ObjectToTest.marca, mapperTable: mapper.get(Marca).mapperTable }).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.marca.codeImport, ObjectToTest.marca.descricao
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO Marca (codeImport, descricao) VALUES (?, ?)");
    });

    it("CondicaoPagamento", () => {
        const result = new Insert(CondicaoPagamento, { modelToSave: ObjectToTest.condicaoPagamento, mapperTable: mapper.get(CondicaoPagamento).mapperTable }).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.condicaoPagamento.codeImport, ObjectToTest.condicaoPagamento.nome
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO CondicaoPagamento (codeImport, nome) VALUES (?, ?)");
    });

    it("Pedido", () => {
        const result = new Insert(Pedido, { modelToSave: ObjectToTest.pedido, mapperTable: mapper.get(Pedido).mapperTable }).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.pedido.codeImport, ObjectToTest.pedido.cliente.id, ObjectToTest.pedido.marca.internalKey,
            ObjectToTest.pedido.condicaoPagamento.codeImport
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO Pedido (codeImport, cliente_id, marca_internalKey, condicaoPagamento_codeImport) VALUES (?, ?, ?, ?)");
    });

    it("GuidClazz", () => {
        const obj1 = Object.assign({}, ObjectToTest.guidClazz);
        const result = new Insert(GuidClazz, { modelToSave: obj1, mapperTable: mapper.get(GuidClazz).mapperTable }).compile();
        expect(result[0].params[0]).to.length(36);
        expect(result[0].params[1]).to.equal(obj1.description);
        expect(result[0].query).to.equal("INSERT INTO GuidClazz (guid, description) VALUES (?, ?)");
    });

    it("TestClazz", () => {
        const result = new Insert(TestClazz, { modelToSave: ObjectToTest.testClazz, mapperTable: mapper.get(TestClazz).mapperTable }).compile();
        expect(result[0].params[0]).to.equal(ObjectToTest.testClazz.id);
        expect(result[0].params[1]).to.equal(ObjectToTest.testClazz.description);
        expect(result[0].params[2]).to.equal(Utils.getValueType(ObjectToTest.testClazz.date, FieldType.DATE)?.[0]);
        expect(result[0].params[3]).to.equal(Utils.getValueType(ObjectToTest.testClazz.dateMoment, FieldType.DATE)?.[0]);
        expect(result[0].params[4]).to.equal(Utils.getValueType(ObjectToTest.testClazz.dateDate, FieldType.DATE)?.[0]);
        expect(result[0].params[5]).to.equal(ObjectToTest.testClazz.numero);
        expect(result[0].params[6]).to.equal(ObjectToTest.testClazz.referenceTest.id);
        expect(result[0].params[7]).to.equal(ObjectToTest.testClazz.referenceTestCode.code);
        expect(result[0].params[8]).to.equal(Utils.getValueType(ObjectToTest.testClazz.dateStr, FieldType.DATE)?.[0]);
        expect(result[0].query).to.equal("INSERT INTO TestClazz (id, description, date, dateMoment, dateDate, numero, referenceTest_id, referenceTestCode_code, dateStr) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    });

    it("TestClazzRefCode", () => {
        const result = new Insert(TestClazzRefCode, { modelToSave: ObjectToTest.testClazzRefCode, mapperTable: mapper.get(TestClazzRefCode).mapperTable }).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.testClazzRefCode.code, ObjectToTest.testClazzRefCode.description, ObjectToTest.testClazzRefCode.reference.description
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO TestClazzRefCode (code, description, reference_description) VALUES (?, ?, ?)");
    });

    it("TestClazzRefCode", () => {
        const result = new Insert(TestClazzRefCode, { modelToSave: ObjectToTest.testClazzRefCode, mapperTable: mapper.get(TestClazzRefCode).mapperTable }).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.testClazzRefCode.code, ObjectToTest.testClazzRefCode.description, ObjectToTest.testClazzRefCode.reference.description
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO TestClazzRefCode (code, description, reference_description) VALUES (?, ?, ?)");
    });

    it("ContasAReceber", () => {
        const result = new Insert(ContasAReceber, { modelToSave: ObjectToTest.contasReceber, mapperTable: mapper.get(ContasAReceber).mapperTable }).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.contasReceber.versao,
            ObjectToTest.contasReceber.idErp,
            ObjectToTest.contasReceber.deleted,
            (ObjectToTest.contasReceber.dataVencimento as moment.Moment).unix(),
            ObjectToTest.contasReceber.valor,
            void 0,
            ObjectToTest.contasReceber.cliente.idErp,
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO ContasAReceber (versao, idErp, deleted, dataVencimento, valor, dataRecebimento, cliente_idErp) VALUES (?, ?, ?, ?, ?, ?, ?)");
    });

    it("ContasAReceber date string", () => {
        const contasReceber = {
            idErp: 11,
            valor: 1034.42,
            cliente: ObjectToTest.cliente,
            dataRecebimento: void 0,
            dataVencimento: DatetimeUtils.datetimeToDate("2010-01-28T00:00:00-02:00")
        } as ContasAReceber;
        const result = new Insert(ContasAReceber, { modelToSave: contasReceber, mapperTable: mapper.get(ContasAReceber).mapperTable }).compile();
        expect(result[0].params.toString()).to.equal([
            contasReceber.versao,
            contasReceber.idErp,
            contasReceber.deleted,
            DatetimeUtils.dateToDatabase(contasReceber.dataVencimento),
            contasReceber.valor,
            void 0,
            contasReceber.cliente.idErp,
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO ContasAReceber (versao, idErp, deleted, dataVencimento, valor, dataRecebimento, cliente_idErp) VALUES (?, ?, ?, ?, ?, ?, ?)");
    });
});
