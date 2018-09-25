import { ContasReceber } from "./models/contas-receber";
import { Ddl } from "./../ddl/ddl";
import { SQLiteDatabase } from "./database/sqlite-database";
import { expect } from "chai";
import { Cidade } from "./models/cidade";
import { ObjectToTest } from "./objeto-to-test";
import { MappersTableNew } from "./mappers-table-new";
import { Crud } from "../crud";
import { GuidClazz } from "./models/guid-clazz";
import { Uf } from "./models/uf";
import * as moment from "moment";

describe("SQLite", async () => {
    const mapper = new MappersTableNew();

    const database = new SQLiteDatabase();
    const crud = new Crud(database, mapper, false);
    const ddl = new Ddl(database, mapper, false);

    it("GuidClazz", async () => {

        await ddl.create(GuidClazz).execute();

        const insertResult = await crud.insert(GuidClazz, ObjectToTest.guidClazz).execute();
        expect(insertResult.rowsAffected, "insert").to.equal(1);

        const queryInsertResult = await crud.query(GuidClazz).toList();
        expect(queryInsertResult.length).to.equal(1);
        expect(queryInsertResult[0].description).to.equal(ObjectToTest.guidClazz.description);
        expect(queryInsertResult[0].guid).to.equal(ObjectToTest.guidClazz.guid);

        const modelUpdate = {
            guid: "abc",
            description: "Teste Update"
        } as GuidClazz;
        const updateResult = await crud.update(GuidClazz, modelUpdate)
            .where(where => where.equal(x => x.guid, ObjectToTest.guidClazz.guid))
            .execute();
        expect(updateResult.rowsAffected, "update").to.equal(1);

        const queryUpdateResult = await crud.query(GuidClazz).toList();
        expect(queryUpdateResult.length).to.equal(1);
        expect(queryUpdateResult[0].description).to.equal(modelUpdate.description);
        expect(queryUpdateResult[0].guid).to.equal(ObjectToTest.guidClazz.guid);

        const modelUpdateByDescription = new GuidClazz(void 0, "Teste teste test");
        const updateByDescriptionResult = await crud.update(GuidClazz, modelUpdateByDescription)
            .where(where => where.equal(x => x.description, modelUpdate.description))
            .execute();
        expect(updateByDescriptionResult.rowsAffected, "update").to.equal(1);
        expect(modelUpdateByDescription.guid).to.equal(void 0);
    });

    it("Cidade", async () => {

        await ddl.create(Cidade).execute();

        const insertResult1 = await crud.insert(Cidade, ObjectToTest.cidade).execute();
        expect(insertResult1.rowsAffected, "insert").to.equal(1);
        const insertResult2 = await crud.insert(Cidade, {
            codeImport: 3,
            nome: "São João Batisa",
            uf: ObjectToTest.uf,
            subRegiao: ObjectToTest.subRegiao,
        } as Cidade).execute();
        expect(insertResult2.rowsAffected, "insert").to.equal(1);
        const insertResult3 = await crud.insert(Cidade, {
            codeImport: 4,
            nome: "São Paulo",
            uf: {
                codeImport: "SP",
                nome: "São Paulo"
            } as Uf,
            subRegiao: ObjectToTest.subRegiao,
        } as Cidade).execute();
        expect(insertResult3.rowsAffected, "insert").to.equal(1);

        const queryResult = await crud.query(Cidade)
            .where(where => where.equal(x => x.uf.codeImport, ObjectToTest.uf.codeImport))
            .toList();
        expect(queryResult.length).to.equal(2);
        for (const itemResult of queryResult) {
            expect(itemResult.uf.codeImport).to.equal(ObjectToTest.uf.codeImport);
        }
        expect(queryResult[0].codeImport).to.equal(ObjectToTest.cidade.codeImport);
    });

    it("ContasAReceber", async () => {

        await ddl.create(ContasReceber).execute();

        const insertResult1 = await crud.insert(ContasReceber, ObjectToTest.contasReceber).execute();
        expect(insertResult1.rowsAffected, "insert").to.equal(1);

        const queryResult = await crud.query(ContasReceber)
            .where(where => where.equal(x => x.cliente.codeImport, ObjectToTest.contasReceber.cliente.codeImport))
            .toList();

        expect(queryResult.length).to.equal(1);
        expect(queryResult[0].codeImport).to.equal(ObjectToTest.contasReceber.codeImport);
        expect(queryResult[0].dataRecebimento).to.equal(void 0);
    });

});
