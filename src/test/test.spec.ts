import { Regiao } from "./models/regiao";
import { Uf } from "./models/uf";
import { Classificacao } from "./models/classificacao";
import { SubRegiao } from "./models/sub-regiao";
import { Cliente } from "./models/cliente";
import { expect } from "chai";
import { Cidade } from "./models/cidade";
import { Insert } from "..";
// import { MappersTable } from "./mappers-table";

// const mappersTable = new MappersTable();

describe("Mapper", () => {
    const clienteToSave = {
        codeImport: 1,
        razaoSocial: "Razão",
        apelido: "Apelido",
        cidade: {
            codeImport: 2,
            nome: "Cidade",
            uf: {
                codeImport: "SC",
                nome: "Santa Catarina"
            } as Uf,
            subRegiao: {
                codeImport: 4,
                nome: "Sub Região",
                regiao: {
                    codeImport: 5,
                    nome: "Região"
                } as Regiao
            } as SubRegiao,
        } as Cidade,
        classificacao: {
            codeImport: 3,
            descricao: "Top"
        } as Classificacao,
        desativo: false
    } as Cliente;

    it("Test mapper insert", () => {
        // TODO: comment
        // const result = new Insert(Cliente, clienteToSave, mappersTable.clienteMapper).compile();
        // expect(result.params.toString()).to.equal([1, "Razão", "Apelido", false, 2, 3].toString());
        // expect(result.query).to.equal("INSERT INTO Cliente (codeImport, razaoSocial, apelido, desativo, cidade_codeImport, classificacao_codeImport) VALUES (?, ?, ?, ?, ?, ?)");
    });

});
