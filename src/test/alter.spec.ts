import { Cliente } from "./models/cliente";
import { Alter } from "./../ddl/alter/alter";
import { expect } from "chai";
import { Classificacao } from "./models/classificacao";

describe("Alter", () => {

    it("Add column", () => {
        const alter = new Alter(Cliente);
        alter.addColumn(x => x.razaoSocial);
        const result = alter.compile();
        expect(result[0].length > 0).to.equal(true);
        expect(result[0]).to.equal(`ALTER TABLE Cliente ADD COLUMN razaoSocial TEXT;`);
    });

    it("Add column string name column", () => {
        const alter = new Alter(Cliente);
        alter.addColumn('novaColuna', Number);
        const result = alter.compile();
        expect(result[0].length > 0).to.equal(true);
        expect(result[0]).to.equal(`ALTER TABLE Cliente ADD COLUMN novaColuna INTEGER;`);
    });

    it("Rename column", () => {
        const alter = new Alter(Cliente);
        alter.renameColumn(x => x.razaoSocial, x => x.apelido);
        const result = alter.compile();
        expect(result[0].length > 0).to.equal(true);
        expect(result[0]).to.equal(`ALTER TABLE Cliente RENAME COLUMN razaoSocial TO apelido;`);
    });

    it("Rename column string name column", () => {
        const alter = new Alter(Cliente);
        alter.renameColumn('novaColuna', x => x.apelido);
        const result = alter.compile();
        expect(result[0].length > 0).to.equal(true);
        expect(result[0]).to.equal(`ALTER TABLE Cliente RENAME COLUMN novaColuna TO apelido;`);
    });

    it("Rename table", () => {
        const alter = new Alter(Cliente);
        alter.renameTable(Classificacao);
        const result = alter.compile();
        expect(result[0].length > 0).to.equal(true);
        expect(result[0]).to.equal(`ALTER TABLE Cliente RENAME TO Classificacao;`);
    });

    it("Rename table string name column", () => {
        const alter = new Alter(Cliente);
        alter.renameTable("NovaTabela");
        const result = alter.compile();
        expect(result[0].length > 0).to.equal(true);
        expect(result[0]).to.equal(`ALTER TABLE Cliente RENAME TO NovaTabela;`);
    });

});
