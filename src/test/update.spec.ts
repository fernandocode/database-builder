import { TestClazz } from "./models/test-clazz";
import { Update } from "./../crud/update/update";
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

describe("Update", () => {
    const mapper = getMapper();

    it("Classificacao", () => {
        const result = new Update(Classificacao, { modelToSave: ObjectToTest.classificacao, mapperTable: mapper.get(Classificacao).mapperTable })
            .where(where => where.equal(x => x.codeImport, ObjectToTest.classificacao.codeImport))
            .compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.classificacao.descricao, ObjectToTest.classificacao.codeImport
        ].toString());
        expect(result[0].query).to.equal("UPDATE Classificacao SET descricao = ? WHERE codeImport = ?");
    });

    it("Regiao", () => {
        const result = new Update(Regiao, { modelToSave: ObjectToTest.regiao, mapperTable: mapper.get(Regiao).mapperTable })
            .where(where => where.equal(x => x.codeImport, ObjectToTest.regiao.codeImport))
            .compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.regiao.nome, ObjectToTest.regiao.codeImport
        ].toString());
        expect(result[0].query).to.equal("UPDATE Regiao SET nome = ? WHERE codeImport = ?");
    });

    it("SubRegiao", () => {
        const result = new Update(SubRegiao, { modelToSave: ObjectToTest.subRegiao, mapperTable: mapper.get(SubRegiao).mapperTable })
            .where(where => where.equal(x => x.codeImport, ObjectToTest.subRegiao.codeImport))
            .compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.subRegiao.nome,
            ObjectToTest.subRegiao.regiao.codeImport,
            ObjectToTest.subRegiao.codeImport
        ].toString());
        expect(result[0].query).to.equal("UPDATE SubRegiao SET nome = ?, regiao_codeImport = ? WHERE codeImport = ?");
    });

    it("Uf", () => {
        const result = new Update(Uf, { modelToSave: ObjectToTest.uf, mapperTable: mapper.get(Uf).mapperTable })
            .where(where => where.equal(x => x.codeImport, ObjectToTest.uf.codeImport))
            .compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.uf.nome, ObjectToTest.uf.population, ObjectToTest.uf.codeImport
        ].toString());
        expect(result[0].query).to.equal("UPDATE Uf SET nome = ?, population = ? WHERE codeImport = ?");
    });

    it("Cidade", () => {
        const result = new Update(Cidade, { modelToSave: ObjectToTest.cidade, mapperTable: mapper.get(Cidade).mapperTable })
            .where(where => where.equal(x => x.codeImport, ObjectToTest.cidade.codeImport))
            .compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.cidade.nome,
            ObjectToTest.cidade.population,
            ObjectToTest.cidade.subRegiao.codeImport,
            ObjectToTest.cidade.uf.codeImport,
            ObjectToTest.cidade.codeImport
        ].toString());
        expect(result[0].query).to.equal("UPDATE Cidade SET nome = ?, population = ?, subRegiao_codeImport = ?, uf_codeImport = ? WHERE codeImport = ?");
    });

    it("Cliente", () => {
        const result = new Update(Cliente, { modelToSave: ObjectToTest.cliente, mapperTable: mapper.get(Cliente).mapperTable })
            .compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.cliente.idErp,
            ObjectToTest.cliente.versao,
            ObjectToTest.cliente.deleted,
            ObjectToTest.cliente.razaoSocial,
            ObjectToTest.cliente.nomeFantasia,
            ObjectToTest.cliente.cidade.codeImport,
            ObjectToTest.cliente.change,
        ].toString());
        expect(result[0].query).to.equal("UPDATE Cliente SET idErp = ?, versao = ?, deleted = ?, razaoSocial = ?, nomeFantasia = ?, cidade_codeImport = ?, change = ?");
    });

    it("Marca", () => {
        const result = new Update(Marca, { modelToSave: ObjectToTest.marca, mapperTable: mapper.get(Marca).mapperTable })
            .compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.marca.codeImport, ObjectToTest.marca.descricao
        ].toString());
        expect(result[0].query).to.equal("UPDATE Marca SET codeImport = ?, descricao = ?");
    });

    it("Marca (parcial update)", () => {
        const marcaCodeImport = 2;
        const result = new Update(Marca, { mapperTable: mapper.get(Marca).mapperTable })
            .columns(c => c.setValue(x => x.codeImport, marcaCodeImport))
            .compile();
        expect(result[0].params.toString()).to.equal([
            marcaCodeImport
        ].toString());
        expect(result[0].query).to.equal("UPDATE Marca SET codeImport = ?");
    });

    it("Marca parcial update by model", () => {
        const marcaParcial: Marca = { codeImport: 2 } as Marca;
        const result = new Update(Marca, { modelToSave: marcaParcial, mapperTable: mapper.get(Marca).mapperTable })
            .columns(c => c.set(x => x.codeImport))
            .compile();
        expect(result[0].params.toString()).to.equal([
            marcaParcial.codeImport
        ].toString());
        expect(result[0].query).to.equal("UPDATE Marca SET codeImport = ?");
    });

    it("CondicaoPagamento", () => {
        const result = new Update(CondicaoPagamento, { modelToSave: ObjectToTest.condicaoPagamento, mapperTable: mapper.get(CondicaoPagamento).mapperTable })
            .where(where => where.equal(x => x.codeImport, ObjectToTest.condicaoPagamento.codeImport))
            .compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.condicaoPagamento.nome,
            ObjectToTest.condicaoPagamento.codeImport
        ].toString());
        expect(result[0].query).to.equal("UPDATE CondicaoPagamento SET nome = ? WHERE codeImport = ?");
    });

    it("Pedido", () => {
        const result = new Update(Pedido, { modelToSave: ObjectToTest.pedido, mapperTable: mapper.get(Pedido).mapperTable })
            .compile();
        expect(result[0].params.toString()).to.equal([
            ObjectToTest.pedido.codeImport,
            ObjectToTest.pedido.cliente.id,
            ObjectToTest.pedido.marca.internalKey,
            ObjectToTest.pedido.condicaoPagamento.codeImport
        ].toString());
        expect(result[0].query).to.equal("UPDATE Pedido SET codeImport = ?, cliente_id = ?, marca_internalKey = ?, condicaoPagamento_codeImport = ?");
    });

    it("TestClazz", () => {
        const descriptionNewValue = "hdajhdja";
        const result = new Update(TestClazz, { modelToSave: ObjectToTest.testClazz, mapperTable: mapper.get(TestClazz).mapperTable })
            .columns(columns => {
                columns.setValue(x => x.description, descriptionNewValue);
                columns.set(x => x.numero);
            })
            .where(where => where.equal(x => x.id, ObjectToTest.testClazz.id))
            .compile();
        expect(result[0].params.toString()).to.equal([
            descriptionNewValue,
            ObjectToTest.testClazz.numero,
            ObjectToTest.testClazz.id
        ].toString());
        expect(result[0].query).to.equal("UPDATE TestClazz SET description = ?, numero = ? WHERE id = ?");
    });

});
