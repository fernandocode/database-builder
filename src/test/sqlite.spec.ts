import { ContasReceber } from "./models/contas-receber";
import { Ddl } from "./../ddl/ddl";
import { expect } from "chai";
import { Cidade } from "./models/cidade";
import { ObjectToTest } from "./objeto-to-test";
import { getMapper } from "./mappers-table-new";
import { Crud } from "../crud";
import { GuidClazz } from "./models/guid-clazz";
import { Uf } from "./models/uf";
import { HeaderSimple } from "./models/header-simple";
import { Referencia } from "./models/referencia";
import { Imagem } from "./models/imagem";
import { SQLiteDatabase } from "./database/sqlite-database";

describe("SQLite", async () => {
    const mapper = getMapper();

    const database = await new SQLiteDatabase().init();
    // const database = new SQLiteDatabase();
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

        const model4 = {
            codeImport: 99,
            nome: undefined,
            uf: ObjectToTest.uf,
            subRegiao: ObjectToTest.subRegiao,
        } as Cidade;
        const insert = crud.insert(Cidade, model4);
        // const insertCompile = insert.compile()[0];
        // console.log(insertCompile.query);
        // console.log(insertCompile.params);
        const insertResult4 = await insert.execute();
        expect(insertResult4[0].rowsAffected).to.equal(1);

        const queryResult4 = await crud.query(Cidade)
            .where(where => where.equal(x => x.codeImport, model4.codeImport))
            .firstOrDefault();
        const queryResultNull = await crud.query(Cidade)
            .where(where => where.isNull(x => x.nome))
            .toList();

        expect(queryResult4.nome).to.equal(null);
        expect(queryResultNull.length).to.equal(1);
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

    it("Referencia cascade (property compost)", async () => {

        ddl.enableLog = true;
        const createResult = await ddl.create(Referencia).execute();
        expect(createResult.length).to.equal(2);

        crud.enableLog = true;
        const insertResult1 = await crud.insert(Referencia, ObjectToTest.referencia).execute();
        expect(insertResult1.length).to.equal(ObjectToTest.referencia.referenciasRelacionadas.length + 1);
        expect(insertResult1[0].rowsAffected).to.equal(1);
        ObjectToTest.referencia.referenciasRelacionadas.forEach((value, index) => {
            expect(insertResult1[index + 1].rowsAffected).to.equal(1);
        });

        const referencia2 = {
            codeImport: 200,
            codigo: "fffff",
            descricao: "Referencia 2",
            restricaoGrade: ["41", "42", "43", "44", "45"],
            referenciasRelacionadas: [
                {
                    codeImport: 201
                } as Referencia,
                {
                    codeImport: 203
                } as Referencia,
                {
                    codeImport: 205
                } as Referencia,
                {
                    codeImport: 207
                } as Referencia,
            ],
            imagem: {
                internalKey: 40
            } as Imagem,
            deleted: false
        } as Referencia;

        const insertResult2 = await crud.insert(Referencia, referencia2).execute();
        expect(insertResult2.length).to.equal(referencia2.referenciasRelacionadas.length + 1);
        expect(insertResult2[0].rowsAffected).to.equal(1);
        referencia2.referenciasRelacionadas.forEach((value, index) => {
            expect(insertResult2[index + 1].rowsAffected).to.equal(1);
        });

        const referencia3 = {
            codeImport: 300,
            codigo: "aaaaaa",
            descricao: "Referencia 3",
            restricaoGrade: ["21", "22", "23", "24", "25"],
            referenciasRelacionadas: [
                {
                    codeImport: 301
                } as Referencia,
                {
                    codeImport: 303
                } as Referencia,
                {
                    codeImport: 305
                } as Referencia,
                {
                    codeImport: 307
                } as Referencia,
            ],
            imagem: {
                internalKey: 50
            } as Imagem,
            deleted: false
        } as Referencia;

        const insertResult3 = await crud.insert(Referencia, referencia3).execute();
        expect(insertResult3.length).to.equal(referencia3.referenciasRelacionadas.length + 1);
        expect(insertResult3[0].rowsAffected).to.equal(1);
        referencia3.referenciasRelacionadas.forEach((value, index) => {
            expect(insertResult3[index + 1].rowsAffected).to.equal(1);
        });

        const selectResult = await crud.query(Referencia).toList();
        expect(selectResult.length).to.equal(3);

        expect(selectResult[0].referenciasRelacionadas.length).to.equal(ObjectToTest.referencia.referenciasRelacionadas.length);
        expect(selectResult[0].codeImport).to.equal(ObjectToTest.referencia.codeImport);
        expect(selectResult[0].descricao).to.equal(ObjectToTest.referencia.descricao);
        ObjectToTest.referencia.referenciasRelacionadas.forEach((value, index) => {
            expect(selectResult[0].referenciasRelacionadas[index].codeImport).to.equal(value.codeImport);
        });

        expect(selectResult[1].referenciasRelacionadas.length).to.equal(referencia2.referenciasRelacionadas.length);
        expect(selectResult[1].codeImport).to.equal(referencia2.codeImport);
        expect(selectResult[1].descricao).to.equal(referencia2.descricao);
        referencia2.referenciasRelacionadas.forEach((value, index) => {
            expect(selectResult[1].referenciasRelacionadas[index].codeImport).to.equal(value.codeImport);
        });

        expect(selectResult[2].referenciasRelacionadas.length).to.equal(referencia3.referenciasRelacionadas.length);
        expect(selectResult[2].codeImport).to.equal(referencia3.codeImport);
        expect(selectResult[2].descricao).to.equal(referencia3.descricao);
        referencia3.referenciasRelacionadas.forEach((value, index) => {
            expect(selectResult[2].referenciasRelacionadas[index].codeImport).to.equal(value.codeImport);
        });

        referencia2.descricao = "Editado";
        const oldCountItems = referencia2.referenciasRelacionadas.length;
        referencia2.referenciasRelacionadas.splice(referencia2.referenciasRelacionadas.length - 1, 1);
        referencia2.referenciasRelacionadas = [...referencia2.referenciasRelacionadas, {
            codeImport: 222
        } as Referencia];

        const updateResult = await crud.update(Referencia, referencia2)
            .where(where => {
                where.equal(x => x.codeImport, referencia2.codeImport);
            })
            .execute();
        const countUpdateResultExtraItems = 2; /* Update (Main) e Delete (Items) */
        expect(updateResult.length).to.equal(referencia2.referenciasRelacionadas.length + countUpdateResultExtraItems);
        /* Update (Main) */
        expect(updateResult[0].rowsAffected).to.equal(1);
        /* Delete (Items) */
        expect(updateResult[1].rowsAffected).to.equal(oldCountItems);
        referencia2.referenciasRelacionadas.forEach((value, index) => {
            expect(updateResult[index + countUpdateResultExtraItems].rowsAffected).to.equal(1);
        });

        const selectUpdateResult = await crud.query(Referencia)
            .where(where => {
                where.equal(x => x.codeImport, referencia2.codeImport);
            })
            .firstOrDefault();
        expect(selectUpdateResult.referenciasRelacionadas.length).to.equal(referencia2.referenciasRelacionadas.length);
        expect(selectUpdateResult.codeImport).to.equal(referencia2.codeImport);
        expect(selectUpdateResult.descricao).to.equal(referencia2.descricao);
        referencia2.referenciasRelacionadas.forEach((value, index) => {
            expect(selectUpdateResult.referenciasRelacionadas[index].codeImport).to.equal(value.codeImport);
        });

        const deleteResult1 = await crud.delete(Referencia, referencia2)
            .execute();
        expect(deleteResult1.length).to.equal(2);
        /* Main deleted */
        expect(deleteResult1[0].rowsAffected).to.equal(1);
        /* Itens deleted */
        expect(deleteResult1[1].rowsAffected).to.equal(referencia2.referenciasRelacionadas.length);

        const deleteResult2 = await crud.deleteByKey(Referencia, ObjectToTest.referencia.codeImport)
            .execute();
        expect(deleteResult2.length).to.equal(2);
        /* Main deleted */
        expect(deleteResult2[0].rowsAffected).to.equal(1);
        /* Itens deleted */
        expect(deleteResult2[1].rowsAffected).to.equal(ObjectToTest.referencia.referenciasRelacionadas.length);

        const selectResult2 = await crud.query(Referencia).toList();
        expect(selectResult2.length).to.equal(1);
        expect(selectResult2[0].referenciasRelacionadas.length).to.equal(referencia3.referenciasRelacionadas.length);
        expect(selectResult2[0].codeImport).to.equal(referencia3.codeImport);
        expect(selectResult2[0].descricao).to.equal(referencia3.descricao);
        referencia3.referenciasRelacionadas.forEach((value, index) => {
            expect(selectResult2[0].referenciasRelacionadas[index].codeImport).to.equal(value.codeImport);
        });

        /* Test select not cascade with data in itens */
        const selectResultNotCascade = await crud.query(Referencia).toList(false);
        expect(selectResultNotCascade.length).to.equal(1);
        expect(selectResultNotCascade[0].referenciasRelacionadas.length).to.equal(0);
        expect(selectResultNotCascade[0].codeImport).to.equal(referencia3.codeImport);
        expect(selectResultNotCascade[0].descricao).to.equal(referencia3.descricao);

        const dropResult = await ddl.drop(Referencia).execute();
        expect(dropResult.length).to.equal(2);
    });
});
