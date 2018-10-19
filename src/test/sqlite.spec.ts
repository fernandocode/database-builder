import { ContasReceber } from "./models/contas-receber";
import { Ddl } from "./../ddl/ddl";
import { SQLiteDatabase } from "./database/sqlite-database";
import { expect } from "chai";
import { Cidade } from "./models/cidade";
import { ObjectToTest } from "./objeto-to-test";
import { getMapper } from "./mappers-table-new";
import { Crud } from "../crud";
import { GuidClazz } from "./models/guid-clazz";
import { Uf } from "./models/uf";
import { HeaderSimple } from "./models/header-simple";

describe("SQLite", async () => {
    const mapper = getMapper();

    const database = new SQLiteDatabase();
    const crud = new Crud(database, mapper, false);
    const ddl = new Ddl(database, mapper, false);

    it("GuidClazz", async () => {

        await ddl.create(GuidClazz).execute();

        const insertResult = await crud.insert(GuidClazz, ObjectToTest.guidClazz).execute();
        expect(insertResult[0].rowsAffected).to.equal(1);

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
        expect(updateResult[0].rowsAffected).to.equal(1);

        const queryUpdateResult = await crud.query(GuidClazz).toList();
        expect(queryUpdateResult.length).to.equal(1);
        expect(queryUpdateResult[0].description).to.equal(modelUpdate.description);
        expect(queryUpdateResult[0].guid).to.equal(ObjectToTest.guidClazz.guid);

        const modelUpdateByDescription = new GuidClazz(void 0, "Teste teste test");
        const updateByDescriptionResult = await crud.update(GuidClazz, modelUpdateByDescription)
            .where(where => where.equal(x => x.description, modelUpdate.description))
            .execute();
        expect(updateByDescriptionResult[0].rowsAffected).to.equal(1);
        expect(modelUpdateByDescription.guid).to.equal(void 0);
    });

    it("Cidade", async () => {

        await ddl.create(Cidade).execute();

        const insertResult1 = await crud.insert(Cidade, ObjectToTest.cidade).execute();
        expect(insertResult1[0].rowsAffected).to.equal(1);
        const insertResult2 = await crud.insert(Cidade, {
            codeImport: 3,
            nome: "São João Batisa",
            uf: ObjectToTest.uf,
            subRegiao: ObjectToTest.subRegiao,
        } as Cidade).execute();
        expect(insertResult2[0].rowsAffected).to.equal(1);
        const insertResult3 = await crud.insert(Cidade, {
            codeImport: 4,
            nome: "São Paulo",
            uf: {
                codeImport: "SP",
                nome: "São Paulo"
            } as Uf,
            subRegiao: ObjectToTest.subRegiao,
        } as Cidade).execute();
        expect(insertResult3[0].rowsAffected).to.equal(1);

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
        expect(insertResult1[0].rowsAffected).to.equal(1);

        const queryResult = await crud.query(ContasReceber)
            .where(where => where.equal(x => x.cliente.codeImport, ObjectToTest.contasReceber.cliente.codeImport))
            .toList();

        expect(queryResult.length).to.equal(1);
        expect(queryResult[0].codeImport).to.equal(ObjectToTest.contasReceber.codeImport);
        expect(queryResult[0].dataRecebimento).to.equal(void 0);
    });

    it("HeaderSimple cascade", async () => {

        const createResult = await ddl.create(HeaderSimple).execute();
        expect(createResult.length).to.equal(2);

        const insertResult1 = await crud.insert(HeaderSimple, ObjectToTest.headerSimple).execute();
        expect(insertResult1.length).to.equal(ObjectToTest.headerSimple.items.length + 1);
        expect(insertResult1[0].rowsAffected).to.equal(1);
        ObjectToTest.headerSimple.items.forEach((value, index) => {
            expect(insertResult1[index + 1].rowsAffected).to.equal(1);
        });

        const headerSimple2 = {
            descricao: "Header 2",
            items: ["123", "456", "789", "10a"]
        } as HeaderSimple;

        const insertResult2 = await crud.insert(HeaderSimple, headerSimple2).execute();
        expect(insertResult2.length).to.equal(headerSimple2.items.length + 1);
        expect(insertResult2[0].rowsAffected).to.equal(1);
        headerSimple2.items.forEach((value, index) => {
            expect(insertResult2[index + 1].rowsAffected).to.equal(1);
        });

        const headerSimple3 = {
            descricao: "Header 3",
            items: ["a1", "b2"]
        } as HeaderSimple;

        const insertResult3 = await crud.insert(HeaderSimple, headerSimple3).execute();
        expect(insertResult3.length).to.equal(headerSimple3.items.length + 1);
        expect(insertResult3[0].rowsAffected).to.equal(1);
        headerSimple3.items.forEach((value, index) => {
            expect(insertResult3[index + 1].rowsAffected).to.equal(1);
        });

        const selectResult = await crud.query(HeaderSimple).toList();
        expect(selectResult.length).to.equal(3);

        expect(selectResult[0].items.length).to.equal(ObjectToTest.headerSimple.items.length);
        expect(selectResult[0].id).to.equal(ObjectToTest.headerSimple.id);
        expect(selectResult[0].descricao).to.equal(ObjectToTest.headerSimple.descricao);
        ObjectToTest.headerSimple.items.forEach((value, index) => {
            expect(selectResult[0].items[index]).to.equal(value);
        });

        expect(selectResult[1].items.length).to.equal(headerSimple2.items.length);
        expect(selectResult[1].id).to.equal(headerSimple2.id);
        expect(selectResult[1].descricao).to.equal(headerSimple2.descricao);
        headerSimple2.items.forEach((value, index) => {
            expect(selectResult[1].items[index]).to.equal(value);
        });

        expect(selectResult[2].items.length).to.equal(headerSimple3.items.length);
        expect(selectResult[2].id).to.equal(headerSimple3.id);
        expect(selectResult[2].descricao).to.equal(headerSimple3.descricao);
        headerSimple3.items.forEach((value, index) => {
            expect(selectResult[2].items[index]).to.equal(value);
        });

        headerSimple2.descricao = "Editado";
        const oldCountItems = headerSimple2.items.length;
        headerSimple2.items.splice(headerSimple2.items.length - 1, 1);
        headerSimple2.items = [...headerSimple2.items, "agora", "tem", "novo", "valor"];

        const updateResult = await crud.update(HeaderSimple, headerSimple2)
            .where(where => {
                where.equal(x => x.id, headerSimple2.id);
            })
            .execute();
        const countUpdateResultExtraItems = 2; /* Update (Main) e Delete (Items) */
        expect(updateResult.length).to.equal(headerSimple2.items.length + countUpdateResultExtraItems);
        /* Update (Main) */
        expect(updateResult[0].rowsAffected).to.equal(1);
        /* Delete (Items) */
        expect(updateResult[1].rowsAffected).to.equal(oldCountItems);
        headerSimple2.items.forEach((value, index) => {
            expect(updateResult[index + countUpdateResultExtraItems].rowsAffected).to.equal(1);
        });

        const selectUpdateResult = await crud.query(HeaderSimple)
            .where(where => {
                where.equal(x => x.id, headerSimple2.id);
            })
            .firstOrDefault();
        expect(selectUpdateResult.items.length).to.equal(headerSimple2.items.length);
        expect(selectUpdateResult.id).to.equal(headerSimple2.id);
        expect(selectUpdateResult.descricao).to.equal(headerSimple2.descricao);
        headerSimple2.items.forEach((value, index) => {
            expect(selectUpdateResult.items[index]).to.equal(value);
        });

        const deleteResult1 = await crud.delete(HeaderSimple, headerSimple2)
            .execute();
        expect(deleteResult1.length).to.equal(2);
        /* Main deleted */
        expect(deleteResult1[0].rowsAffected).to.equal(1);
        /* Itens deleted */
        expect(deleteResult1[1].rowsAffected).to.equal(headerSimple2.items.length);

        const deleteResult2 = await crud.deleteByKey(HeaderSimple, ObjectToTest.headerSimple.id)
            .execute();
        expect(deleteResult2.length).to.equal(2);
        /* Main deleted */
        expect(deleteResult2[0].rowsAffected).to.equal(1);
        /* Itens deleted */
        expect(deleteResult2[1].rowsAffected).to.equal(ObjectToTest.headerSimple.items.length);

        const selectResult2 = await crud.query(HeaderSimple).toList();
        expect(selectResult2.length).to.equal(1);
        expect(selectResult2[0].items.length).to.equal(headerSimple3.items.length);
        expect(selectResult2[0].id).to.equal(headerSimple3.id);
        expect(selectResult2[0].descricao).to.equal(headerSimple3.descricao);
        headerSimple3.items.forEach((value, index) => {
            expect(selectResult2[0].items[index]).to.equal(value);
        });

        /* Test select not cascade with data in itens */
        const selectResultNotCascade = await crud.query(HeaderSimple).toList(false);
        expect(selectResultNotCascade.length).to.equal(1);
        expect(selectResultNotCascade[0].items.length).to.equal(0);
        expect(selectResultNotCascade[0].id).to.equal(headerSimple3.id);
        expect(selectResultNotCascade[0].descricao).to.equal(headerSimple3.descricao);

        const dropResult = await ddl.drop(HeaderSimple).execute();
        expect(dropResult.length).to.equal(2);
    });

    it("HeaderSimple not cascade", async () => {

        const createResult = await ddl.create(HeaderSimple).execute(false);
        expect(createResult.length).to.equal(1);

        const insertResult1 = await crud.insert(HeaderSimple, ObjectToTest.headerSimple).execute(false);
        expect(insertResult1.length).to.equal(1);
        expect(insertResult1[0].rowsAffected).to.equal(1);

        const headerSimple2 = {
            descricao: "Header 2",
            items: ["123", "456", "789", "10a"]
        } as HeaderSimple;

        const insertResult2 = await crud.insert(HeaderSimple, headerSimple2).execute(false);
        expect(insertResult2.length).to.equal(1);
        expect(insertResult2[0].rowsAffected).to.equal(1);

        const headerSimple3 = {
            descricao: "Header 3",
            items: ["a1", "b2"]
        } as HeaderSimple;

        const insertResult3 = await crud.insert(HeaderSimple, headerSimple3).execute(false);
        expect(insertResult3.length).to.equal(1);
        expect(insertResult3[0].rowsAffected).to.equal(1);

        const selectResult = await crud.query(HeaderSimple).toList(false);
        expect(selectResult.length).to.equal(3);

        expect(selectResult[0].items.length).to.equal(0);
        expect(selectResult[0].id).to.equal(ObjectToTest.headerSimple.id);
        expect(selectResult[0].descricao).to.equal(ObjectToTest.headerSimple.descricao);

        expect(selectResult[1].items.length).to.equal(0);
        expect(selectResult[1].id).to.equal(headerSimple2.id);
        expect(selectResult[1].descricao).to.equal(headerSimple2.descricao);

        expect(selectResult[2].items.length).to.equal(0);
        expect(selectResult[2].id).to.equal(headerSimple3.id);
        expect(selectResult[2].descricao).to.equal(headerSimple3.descricao);

        headerSimple2.descricao = "Editado";
        headerSimple2.items.splice(headerSimple2.items.length - 1, 1);
        headerSimple2.items = [...headerSimple2.items, "agora", "tem", "novo", "valor"];

        const updateResult = await crud.update(HeaderSimple, headerSimple2)
            .where(where => {
                where.equal(x => x.id, headerSimple2.id);
            })
            .execute(false);
        expect(updateResult.length).to.equal(1);
        expect(updateResult[0].rowsAffected).to.equal(1);

        const selectUpdateResult = await crud.query(HeaderSimple)
            .where(where => {
                where.equal(x => x.id, headerSimple2.id);
            })
            .firstOrDefault(false);
        expect(selectUpdateResult.items.length).to.equal(0);
        expect(selectUpdateResult.id).to.equal(headerSimple2.id);
        expect(selectUpdateResult.descricao).to.equal(headerSimple2.descricao);

        const deleteResult1 = await crud.delete(HeaderSimple, headerSimple2)
            .execute(false);
        expect(deleteResult1.length).to.equal(1);
        /* Main deleted */
        expect(deleteResult1[0].rowsAffected).to.equal(1);

        const deleteResult2 = await crud.deleteByKey(HeaderSimple, ObjectToTest.headerSimple.id)
            .execute(false);
        expect(deleteResult2.length).to.equal(1);
        /* Main deleted */
        expect(deleteResult2[0].rowsAffected).to.equal(1);

        const selectResult2 = await crud.query(HeaderSimple).toList(false);
        expect(selectResult2.length).to.equal(1);
        expect(selectResult2[0].items.length).to.equal(0);
        expect(selectResult2[0].id).to.equal(headerSimple3.id);
        expect(selectResult2[0].descricao).to.equal(headerSimple3.descricao);

        const dropResult = await ddl.drop(HeaderSimple).execute(false);
        expect(dropResult.length).to.equal(1);
    });
});
