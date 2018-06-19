import { Regiao } from "./models/regiao";
import { Uf } from "./models/uf";
import { Classificacao } from "./models/classificacao";
import { SubRegiao } from "./models/sub-regiao";
import { Cliente } from "./models/cliente";
import { expect } from "chai";
import { Cidade } from "./models/cidade";
import { Insert } from "../index";
import { MappersTable } from "./mappers-table";

const mappersTable = new MappersTable();

describe("Mapper", () => {
    const clienteToSave = {
        id: 1,
        razaoSocial: "Razão",
        apelido: "Apelido",
        cidade: {
            id: 2,
            nome: "Cidade",
            uf: {
                id: "SC",
                nome: "Santa Catarina"
            } as Uf,
            subRegiao: {
                id: 4,
                nome: "Sub Região",
                regiao: {
                    id: 5,
                    nome: "Região"
                } as Regiao
            } as SubRegiao,
        } as Cidade,
        classificacao: {
            id: 3,
            descricao: "Top"
        } as Classificacao,
        desativo: false
    } as Cliente;

    it("Test mapper insert", () => {
        const result = new Insert(Cliente, clienteToSave, mappersTable.clienteMapper).compile();
        expect(result.params.toString()).to.equal([1, "Razão", "Apelido", false, 2, 3].toString());
        expect(result.query).to.equal("INSERT INTO Cliente (id, razaoSocial, apelido, desativo, cidade_id, classificacao_id) VALUES (?, ?, ?, ?, ?, ?)");
    });

});
