import { Regiao } from "./models/regiao";
import { getMapper } from "./mappers-table-new";
import { CommanderBuilder } from "../crud/commander-builder";
import { expect } from "chai";
import { ObjectToTest } from "./objeto-to-test";
import { Insert } from "../crud";
import { TestClazz } from "./models/test-clazz";
import moment = require("moment");
import { TestClazzRef } from "./models/test-clazz-ref";
import { TestClazzRefCode } from "./models/test-clazz-ref-code";
import { Utils } from "../core/utils";
import { FieldType } from "../core/enums/field-type";
import { ConfigDatabase } from "../crud/config-database";

describe("Batch Insert", () => {
    const mapper = getMapper();
    const config: ConfigDatabase = { sqliteLimitVariables: 10000 };
    const commanderBuilder = new CommanderBuilder(config);

    it("Regiao batch", () => {
        const mapperTable = mapper.get(Regiao).mapperTable;
        const models: Regiao[] = [
            {
                codeImport: 901,
                nome: "Norte 901"
            }, {
                codeImport: 902,
                nome: "Leste 902"
            }, {
                codeImport: 903,
                nome: "Oeste 903"
            }];
        const result = commanderBuilder.batchInsertMapper(mapperTable, models);
        expect(result.length).to.equal(1);
        expect(result[0].params.toString()).to.equal([
            [].concat(...models.map(m => [m.codeImport, m.nome]))
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO Regiao (codeImport, nome) VALUES (?, ?), (?, ?), (?, ?)");
    });

    it("Regiao grupo", () => {
        const result = commanderBuilder.insertMapper(mapper.get(Regiao).mapperTable, ObjectToTest.regiao);
        expect(result.params.toString()).to.equal([
            ObjectToTest.regiao.codeImport, ObjectToTest.regiao.nome
        ].toString());
        expect(result.query).to.equal("INSERT INTO Regiao (codeImport, nome) VALUES (?, ?)");
    });

    it("Regiao batch Insert", () => {
        const models: Regiao[] = [
            {
                codeImport: 901,
                nome: "Norte 901"
            }, {
                codeImport: 902,
                nome: "Leste 902"
            }, {
                codeImport: 903,
                nome: "Oeste 903"
            }];
        const result = new Insert(Regiao, { toSave: models, mapperTable: mapper.get(Regiao).mapperTable, config }).compile();
        expect(result.length).to.equal(1);
        expect(result[0].params.toString()).to.equal([
            [].concat(...models.map(m => [m.codeImport, m.nome]))
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO Regiao (codeImport, nome) VALUES (?, ?), (?, ?), (?, ?)");
    });

    const data = (index: number) => {
        const v = 1000 + index;
        return {
            id: v,
            dateDate: new Date(v, 3, 21),
            description: `Norte ${v}`,
            numero: v,
            dateStr: `${v}-05-12`,
            date: 3202320000 + v,
            dateMoment: moment(`${v}-10-12`, "YYYY-MM-DD"),
            disabled: v % 5 === 0,
            referenceTest: { id: v * 2 } as TestClazzRef,
            referenceTestCode: { code: `a${v * 3}c` } as TestClazzRefCode
        } as TestClazz
    };

    it("Regiao batch Insert set only any columns", () => {
        const models: TestClazz[] = Array.from({ length: 5 }, (_, i) => data(i));
        const insertCommand = new Insert(TestClazz, { toSave: models, mapperTable: mapper.get(TestClazz).mapperTable, config })
            .columns(column => column
                .set(x => x.dateDate)
                .set(x => x.id)
                .set(x => x.description)
            );
        const result = insertCommand.compile();
        expect(result.length).to.equal(1);
        expect(result[0].params.toString()).to.equal([
            [].concat(...models.map(m => [Utils.getValueType(m.dateDate, FieldType.DATE), m.id, m.description]))
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO TestClazz (dateDate, id, description) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?)");
    });

    it("Regiao batch Insert setValue only any columns", () => {
        const ids = [1101, 1102, 1103];
        const descriptions = ["Description 1", "Option 2", "other"];
        const numeros = [10, 11, 12];
        const result = new Insert(TestClazz, { mapperTable: mapper.get(TestClazz).mapperTable, config })
            .columns(column => column
                .setValue(x => x.id, ids)
                .setValue(x => x.description, descriptions)
                .setValue(x => x.numero, numeros)
            )
            .compile();
        expect(result.length).to.equal(1);
        expect(result[0].params.toString()).to.equal([
            [].concat(...ids.map((_, i) => [ids[i], descriptions[i], numeros[i]]))
        ].toString());
        expect(result[0].query).to.equal("INSERT INTO TestClazz (id, description, numero) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)");
    });

    it("Regiao batch Insert setValue different sizes", () => {
        const ids = [1103];
        const descriptions = ["Description 1", "other"];
        const numeros = [10, 11, 12];
        const insert = new Insert(TestClazz, { mapperTable: mapper.get(TestClazz).mapperTable, config })
            .columns(column => column
                .setValue(x => x.id, ids)
                .setValue(x => x.description, descriptions)
                .setValue(x => x.numero, numeros)
            );
        expect(() => insert.compile()).to.throw(`Values with different size not suportted, values: ${JSON.stringify(Array.from({ length: 3 }, (_, i) => [ids[i], descriptions[i], numeros[i]].filter(x => x != void 0)))}`);
    });
});
