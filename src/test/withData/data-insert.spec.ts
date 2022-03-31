import { expect } from "chai";
import { firstValueFrom } from "rxjs";
import { Crud } from "../../crud";
import { Ddl } from "../../ddl";
import { SQLiteDatabase } from "../database/sqlite-database";
import { getMapper } from "../mappers-table-new";
import { GuidClazz } from "../models/guid-clazz";
import { GuidClazzHasMany } from "../models/guid-clazz-has-many";
import { HeaderSimple } from "../models/header-simple";
import { ReferencesModelTest } from "../models/reference-model-test";
import { ObjectToTest } from "../objeto-to-test";

describe("Insert with Data", () => {
    let crud: Crud;
    let ddl: Ddl;

    beforeEach(async () => {
        const mapper = getMapper();

        const database = await new SQLiteDatabase().init();
        crud = new Crud({ sqliteLimitVariables: 10000 }, { database, getMapper: mapper, enableLog: false });
        ddl = new Ddl({ database, getMapper: mapper, enableLog: false });
    });

    it("Guid insert and set id guid inserted", async () => {
        await firstValueFrom(ddl.create(GuidClazz).execute());
        try {
            const obj1 = Object.assign({}, ObjectToTest.guidClazz);
            const insertResult = await firstValueFrom(crud.insert(GuidClazz, { toSave: obj1 }).execute());
            expect(insertResult[0].rowsAffected).to.equal(1);
            expect(obj1.guid).to.not.null;

            const queryInsertResult = await firstValueFrom(crud.query(GuidClazz).toList());
            expect(queryInsertResult.length).to.equal(1);
            expect(queryInsertResult[0].description).to.equal(obj1.description);
            expect(queryInsertResult[0].guid).to.equal(obj1.guid);
        }
        finally {
            await firstValueFrom(ddl.drop(GuidClazz).execute());
        }
    });

    it("Guid insert and set id guid inserted with optimized insert", async () => {
        await firstValueFrom(ddl.create(GuidClazz).execute());
        try {
            const toInsert = [
                { description: "Item 1" },
                { description: "Item 2" },
                { description: "Item 3" }
            ] as GuidClazz[];
            const insertResult = await firstValueFrom(crud.insert(GuidClazz, { toSave: toInsert }).execute());
            expect(insertResult.length).to.equal(1);
            expect(insertResult[0].rowsAffected).to.equal(toInsert.length);
            expect(toInsert.every(x => x.guid != null)).to.true;

            const queryInsertResult = await firstValueFrom(crud.query(GuidClazz).toList());
            expect(queryInsertResult.length).to.equal(toInsert.length);
            for (let index = 0; index < toInsert.length; index++) {
                expect(queryInsertResult[index].description).to.equal(toInsert[index].description);
                expect(queryInsertResult[index].guid).to.equal(toInsert[index].guid);
            }
        }
        finally {
            await firstValueFrom(ddl.drop(GuidClazz).execute());
        }
    });

    it("insert in batch and set id guid inserted with optimized insert", async () => {
        await firstValueFrom(ddl.create(GuidClazzHasMany).execute());

        try {
            const toInsert = [
                {
                    description: "Header 1",
                    items: ["123", "456"]
                },
                {
                    description: "Header 2",
                    items: ["789", "0ab", "cde"]
                },
                {
                    description: "Header 3",
                    items: ["fgh", "456"]
                },
                {
                    description: "Header 4",
                    items: []
                }
            ] as Array<GuidClazzHasMany>;

            const insertResult = await firstValueFrom(crud.insert(GuidClazzHasMany, { toSave: toInsert }).execute());
            expect(insertResult.length).to.equal(2);
            expect(insertResult[0].rowsAffected).to.equal(toInsert.length);
            // vem o ultimo id
            expect(insertResult[0].insertId).to.equal(toInsert[toInsert.length - 1].guid);

            expect(toInsert.every(x => x.guid != null)).to.true;

            const queryInsertResult = await firstValueFrom(crud.query(GuidClazzHasMany).toList());
            expect(queryInsertResult.length).to.equal(toInsert.length);
            for (let index = 0; index < toInsert.length; index++) {
                expect(queryInsertResult[index].description).to.equal(toInsert[index].description);
                expect(queryInsertResult[index].guid).to.equal(toInsert[index].guid);
                expect(queryInsertResult[index].items.join("|")).to.equal(toInsert[index].items.join("|"));
            }
        }
        finally {
            await firstValueFrom(ddl.drop(GuidClazzHasMany).execute());
        }
    });

    it("insert in batch and set id autoincrement inserted with optimized insert", async () => {
        await firstValueFrom(ddl.create(HeaderSimple).execute());
        try {
            const toInsert = [
                {
                    descricao: "Header 1",
                    items: ["123", "456"]
                },
                {
                    descricao: "Header 2",
                    items: ["789", "0ab", "cde"]
                },
                {
                    descricao: "Header 3",
                    items: ["fgh", "456"]
                }
            ] as Array<HeaderSimple>;

            const insertResult = await firstValueFrom(crud.insert(HeaderSimple, { toSave: toInsert }).execute());
            expect(insertResult.length).to.equal(2);
            expect(insertResult[0].rowsAffected).to.equal(toInsert.length);
            expect(insertResult[0].insertId).to.equal(toInsert.length);

            expect(toInsert.every(x => x.id != null)).to.true;

            const queryInsertResult = await firstValueFrom(crud.query(HeaderSimple).toList());
            expect(queryInsertResult.length).to.equal(toInsert.length);
            for (let index = 0; index < toInsert.length; index++) {
                expect(queryInsertResult[index].descricao).to.equal(toInsert[index].descricao);
                expect(queryInsertResult[index].id).to.equal(toInsert[index].id);
                expect(queryInsertResult[index].items.join("|")).to.equal(toInsert[index].items.join("|"));
            }
        }
        finally {
            await firstValueFrom(ddl.drop(HeaderSimple).execute());
        }
    });

    it("Autoincrement insert and set id autoincrement inserted", async () => {
        await firstValueFrom(ddl.create(ReferencesModelTest).execute());

        const obj1 = { name: "test 1" } as ReferencesModelTest;
        const insertResult = await firstValueFrom(crud.insert(ReferencesModelTest, { toSave: obj1 }).execute());
        expect(insertResult[0].rowsAffected).to.equal(1);
        expect(obj1.id).to.not.null;

        const queryInsertResult = await firstValueFrom(crud.query(ReferencesModelTest).toList());
        expect(queryInsertResult.length).to.equal(1);
        expect(queryInsertResult[0].name).to.equal(obj1.name);
        expect(queryInsertResult[0].id).to.equal(obj1.id);
    });

    it("Autoincrement insert and set id autoincrement inserted with optimized insert", async () => {
        await firstValueFrom(ddl.create(ReferencesModelTest).execute());

        const toInsert = [
            { name: "Item 1" },
            { name: "Item 2" },
            { name: "Item 3" }
        ] as ReferencesModelTest[];
        const insertResult = await firstValueFrom(crud.insert(ReferencesModelTest, { toSave: toInsert }).execute());
        expect(insertResult.length).to.equal(1);
        expect(insertResult[0].rowsAffected).to.equal(toInsert.length);
        expect(toInsert.every(x => x.id != null)).to.true;

        const queryInsertResult = await firstValueFrom(crud.query(ReferencesModelTest).toList());
        expect(queryInsertResult.length).to.equal(toInsert.length);
        for (let index = 0; index < toInsert.length; index++) {
            expect(queryInsertResult[index].name).to.equal(toInsert[index].name);
            expect(queryInsertResult[index].id).to.equal(toInsert[index].id);
        }
    });
});