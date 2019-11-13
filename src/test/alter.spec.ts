import { Cliente } from "./models/cliente";
import { Alter } from "./../ddl/alter/alter";
import { expect } from "chai";
import { Classificacao } from "./models/classificacao";
import { ReferencesModelTest } from "./models/reference-model-test";
import { getMapper } from "./mappers-table-new";

describe("Alter", () => {

    const mapper = getMapper();

    it("Add column", () => {
        const alter = new Alter(Cliente, mapper.get(Cliente).mapperTable);
        alter.addColumn(x => x.razaoSocial);
        const result = alter.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`ALTER TABLE Cliente ADD COLUMN razaoSocial TEXT`);
    });

    it("Add column without auto mapper", () => {
        const alter = new Alter(ReferencesModelTest, mapper.get(ReferencesModelTest).mapperTable);
        alter.addColumn(x => x.name);
        const result = alter.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`ALTER TABLE ReferencesModelTest ADD COLUMN name TEXT`);
    });

    it("Add column without auto mapper explicit type", () => {
        const alter = new Alter(ReferencesModelTest, mapper.get(ReferencesModelTest).mapperTable);
        alter.addColumn(x => x.name, String);
        const result = alter.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`ALTER TABLE ReferencesModelTest ADD COLUMN name TEXT`);
    });

    it("Add column string name column", () => {
        const alter = new Alter(Cliente, mapper.get(Cliente).mapperTable);
        alter.addColumn("novaColuna", Number);
        const result = alter.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`ALTER TABLE Cliente ADD COLUMN novaColuna INTEGER`);
    });

    it("Rename column", () => {
        const alter = new Alter(Cliente, mapper.get(Cliente).mapperTable);
        alter.renameColumn(x => x.razaoSocial, x => x.nomeFantasia);
        const result = alter.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`ALTER TABLE Cliente RENAME COLUMN razaoSocial TO nomeFantasia`);
    });

    it("Rename column string name column", () => {
        const alter = new Alter(Cliente, mapper.get(Cliente).mapperTable);
        alter.renameColumn("novaColuna", x => x.nomeFantasia);
        const result = alter.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`ALTER TABLE Cliente RENAME COLUMN novaColuna TO nomeFantasia`);
    });

    it("Rename table", () => {
        const alter = new Alter(Cliente, mapper.get(Cliente).mapperTable);
        alter.renameTable(Classificacao);
        const result = alter.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`ALTER TABLE Cliente RENAME TO Classificacao`);
    });

    it("Rename table string name column", () => {
        const alter = new Alter(Cliente, mapper.get(Cliente).mapperTable);
        alter.renameTable("NovaTabela");
        const result = alter.compile();
        expect(result[0].query.length > 0).to.equal(true);
        expect(result[0].query).to.equal(`ALTER TABLE Cliente RENAME TO NovaTabela`);
    });

});
