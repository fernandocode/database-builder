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
import { Insert } from "..";
import { MappersTableNew } from "./mappers-table-new";
import { ObjectToTest } from "./objeto-to-test";

describe("Insert", () => {
    const mapper = new MappersTableNew();

    it("Classificacao", () => {
        const result = new Insert(Classificacao, ObjectToTest.classificacao, mapper.get(Classificacao)).compile();
        expect(result.params.toString()).to.equal([
            ObjectToTest.classificacao.codeImport, ObjectToTest.classificacao.descricao
        ].toString());
        expect(result.query).to.equal("INSERT INTO Classificacao (codeImport, descricao) VALUES (?, ?)");
    });

    it("Regiao", () => {
        const result = new Insert(Regiao, ObjectToTest.regiao, mapper.get(Regiao)).compile();
        expect(result.params.toString()).to.equal([
            ObjectToTest.regiao.codeImport, ObjectToTest.regiao.nome
        ].toString());
        expect(result.query).to.equal("INSERT INTO Regiao (codeImport, nome) VALUES (?, ?)");
    });

    it("SubRegiao", () => {
        const result = new Insert(SubRegiao, ObjectToTest.subRegiao, mapper.get(SubRegiao)).compile();
        expect(result.params.toString()).to.equal([
            ObjectToTest.subRegiao.codeImport, ObjectToTest.subRegiao.nome,
            ObjectToTest.subRegiao.regiao.codeImport
        ].toString());
        expect(result.query).to.equal("INSERT INTO SubRegiao (codeImport, nome, regiao_codeImport) VALUES (?, ?, ?)");
    });

    it("Uf", () => {
        const result = new Insert(Uf, ObjectToTest.uf, mapper.get(Uf)).compile();
        expect(result.params.toString()).to.equal([
            ObjectToTest.uf.codeImport, ObjectToTest.uf.nome
        ].toString());
        expect(result.query).to.equal("INSERT INTO Uf (codeImport, nome) VALUES (?, ?)");
    });

    it("Cidade", () => {
        const result = new Insert(Cidade, ObjectToTest.cidade, mapper.get(Cidade)).compile();
        expect(result.params.toString()).to.equal([
            ObjectToTest.cidade.codeImport, ObjectToTest.cidade.nome, ObjectToTest.cidade.uf.codeImport,
            ObjectToTest.cidade.subRegiao.codeImport
        ].toString());
        expect(result.query).to.equal("INSERT INTO Cidade (codeImport, nome, uf_codeImport, subRegiao_codeImport) VALUES (?, ?, ?, ?)");
    });

    it("Cliente", () => {
        const result = new Insert(Cliente, ObjectToTest.cliente, mapper.get(Cliente)).compile();
        expect(result.params.toString()).to.equal([
            ObjectToTest.cliente.codeImport, ObjectToTest.cliente.razaoSocial, ObjectToTest.cliente.apelido,
            ObjectToTest.cliente.desativo, ObjectToTest.cliente.cidade.codeImport,
            ObjectToTest.cliente.classificacao.codeImport
        ].toString());
        expect(result.query).to.equal("INSERT INTO Cliente (codeImport, razaoSocial, apelido, desativo, cidade_codeImport, classificacao_codeImport) VALUES (?, ?, ?, ?, ?, ?)");
    });

    it("Marca", () => {
        const result = new Insert(Marca, ObjectToTest.marca, mapper.get(Marca)).compile();
        expect(result.params.toString()).to.equal([
            ObjectToTest.marca.codeImport, ObjectToTest.marca.descricao
        ].toString());
        expect(result.query).to.equal("INSERT INTO Marca (codeImport, descricao) VALUES (?, ?)");
    });

    it("CondicaoPagamento", () => {
        const result = new Insert(CondicaoPagamento, ObjectToTest.condicaoPagamento, mapper.get(CondicaoPagamento)).compile();
        expect(result.params.toString()).to.equal([
            ObjectToTest.condicaoPagamento.codeImport, ObjectToTest.condicaoPagamento.nome
        ].toString());
        expect(result.query).to.equal("INSERT INTO CondicaoPagamento (codeImport, nome) VALUES (?, ?)");
    });

    it("Pedido", () => {
        const result = new Insert(Pedido, ObjectToTest.pedido, mapper.get(Pedido)).compile();
        expect(result.params.toString()).to.equal([
            ObjectToTest.pedido.codeImport, ObjectToTest.pedido.cliente.internalKey, ObjectToTest.pedido.marca.internalKey,
            ObjectToTest.pedido.condicaoPagamento.codeImport
        ].toString());
        expect(result.query).to.equal("INSERT INTO Pedido (codeImport, cliente_internalKey, marca_internalKey, condicaoPagamento_codeImport) VALUES (?, ?, ?, ?)");
    });

});
