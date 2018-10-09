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
import { ContasReceber } from "./models/contas-receber";
import { HeaderSimple } from "./models/header-simple";
import * as moment from "moment";
import { DatetimeUtils } from "../datetime-utils";

describe("Insert", () => {
    const mapper = getMapper();

    it("Classificacao", () => {
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
            ObjectToTest.uf.codeImport, ObjectToTest.uf.nome
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO Uf (codeImport, nome) VALUES (?, ?)");
    });

    it("Cidade", () => {
        const result = new Insert(Cidade, ObjectToTest.cidade, mapper.get(Cidade).mapperTable).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.cidade.codeImport, ObjectToTest.cidade.nome, ObjectToTest.cidade.uf.codeImport,
            ObjectToTest.cidade.subRegiao.codeImport
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO Cidade (codeImport, nome, uf_codeImport, subRegiao_codeImport) VALUES (?, ?, ?, ?)");
    });

    it("Cliente", () => {
        const result = new Insert(Cliente, ObjectToTest.cliente, mapper.get(Cliente).mapperTable).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.cliente.codeImport, ObjectToTest.cliente.razaoSocial, ObjectToTest.cliente.apelido,
            ObjectToTest.cliente.desativo, ObjectToTest.cliente.cidade.codeImport,
            ObjectToTest.cliente.classificacao.codeImport
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO Cliente (codeImport, razaoSocial, apelido, desativo, cidade_codeImport, classificacao_codeImport) VALUES (?, ?, ?, ?, ?, ?)");
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
            ObjectToTest.pedido.codeImport, ObjectToTest.pedido.cliente.internalKey, ObjectToTest.pedido.marca.internalKey,
            ObjectToTest.pedido.condicaoPagamento.codeImport
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO Pedido (codeImport, cliente_internalKey, marca_internalKey, condicaoPagamento_codeImport) VALUES (?, ?, ?, ?)");
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
        const result = new Insert(ContasReceber, ObjectToTest.contasReceber, mapper.get(ContasReceber).mapperTable).compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.contasReceber.codeImport, ObjectToTest.contasReceber.valor,
            void 0, (ObjectToTest.contasReceber.dataVencimento as moment.Moment).unix(),
            ObjectToTest.contasReceber.cliente.codeImport
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO ContasReceber (codeImport, valor, dataRecebimento, dataVencimento, cliente_codeImport) VALUES (?, ?, ?, ?, ?)");
    });

    it("ContasAReceber date string", () => {
        const contasReceber = {
            codeImport: 11,
            valor: 1034.42,
            cliente: ObjectToTest.cliente,
            dataRecebimento: void 0,
            dataVencimento: "2010-01-28T00:00:00-02:00"
        } as ContasReceber;
        const result = new Insert(ContasReceber, contasReceber, mapper.get(ContasReceber).mapperTable).compile();
        expect(result[0].params.toString()).to.equal([
            contasReceber.codeImport, contasReceber.valor,
            void 0, DatetimeUtils.dateToDatabase(contasReceber.dataVencimento),
            contasReceber.cliente.codeImport
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO ContasReceber (codeImport, valor, dataRecebimento, dataVencimento, cliente_codeImport) VALUES (?, ?, ?, ?, ?)");
    });

    // it("HeaderSimple", () => {
    //     const result = new Insert(HeaderSimple, ObjectToTest.headerSimple, mapper.get(HeaderSimple).mapperTable).compile();
    //     expect(result.length).to.equal(2);
    //     expect(result[0].params.toString()).to.equal([
    //         ObjectToTest.headerSimple.descricao
    //     ].toString());
    //     expect(result[0].query).to.equal("INSERT INTO HeaderSimple (id, descricao) VALUES (?, ?)");
    //     for (let index = 0; index < ObjectToTest.headerSimple.items.length; index++) {
    //         const item = ObjectToTest.headerSimple.items[index];
    //         expect(result[index + 1].params.toString()).to.equal([
    //             index, item, new Object()
    //         ].toString());
    //         expect(result[index + 1].query).to.equal("INSERT INTO ItemHeaderSimple (indexArray, value, HeaderSimple_id) VALUES (?, ?, ?)");
    //     }
    // });
});
