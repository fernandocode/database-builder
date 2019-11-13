import { Ddl } from "./../ddl/ddl";
import { expect } from "chai";
import { ObjectToTest } from "./objeto-to-test";
import { getMapper } from "./mappers-table-new";
import { Crud } from "../crud";
import { GuidClazz } from "./models/guid-clazz";
import { SQLiteDatabase } from "./database/sqlite-database";
import { DatabaseObject } from "../definitions";
import { QueryCompiled } from "../core";
import { TestClazz } from "./models/test-clazz";

describe("Managed Transaction", () => {
    let crud: Crud;
    let ddl: Ddl;
    let database: DatabaseObject;

    before(async () => {
        const mapper = getMapper();

        database = await new SQLiteDatabase().init();
        crud = new Crud(database, mapper, false);
        ddl = new Ddl(database, mapper, false);
    });

    beforeEach(async () => {
        await ddl.create(GuidClazz).execute().toPromise();
    });

    afterEach(async () => {
        await ddl.drop(GuidClazz).execute().toPromise();
    });

    it("Transaction Simple", async () => {

        const transaction = database.managedTransaction();

        // transaction.add(ddl.create(GuidClazz));

        const obj1 = Object.assign({}, ObjectToTest.guidClazz);
        transaction.add(
            crud
                .insert(GuidClazz, obj1)
        );

        const modelUpdate = {
            guid: "abc",
            description: "Teste Update"
        } as GuidClazz;
        transaction.add(
            crud
                .update(GuidClazz, modelUpdate)
                .where(where => where.equal(x => x.guid, obj1.guid))
        );

        const modelUpdateByDescription = new GuidClazz(void 0, "Teste teste test");
        transaction.add(
            crud
                .update(GuidClazz, modelUpdateByDescription)
                .where(where => where.equal(x => x.description, modelUpdate.description))
        );

        const resultTransaction = await transaction.commit();
        expect(resultTransaction).to.equal(true);

        const queryUpdateResult = await crud.query(GuidClazz).toList().toPromise();
        expect(queryUpdateResult.length).to.equal(1);
        expect(queryUpdateResult[0].description).to.equal(modelUpdateByDescription.description);
        expect(queryUpdateResult[0].guid).to.equal(obj1.guid);

        // const deleteResult = await ddl.drop(GuidClazz).execute().toPromise();
        // expect(deleteResult.length).to.equal(1);
        // expect(deleteResult[0].rowsAffected).to.equal(1);
    });

    it("Transaction inactive", async () => {

        const transaction = database.managedTransaction();

        // transaction.add(ddl.create(GuidClazz));

        const obj1 = Object.assign({}, ObjectToTest.guidClazz);
        transaction.add(
            crud
                .insert(GuidClazz, obj1)
        );

        const resultTransaction = await transaction.commit();
        expect(resultTransaction).to.equal(true);

        const queryUpdateResult = await crud.query(GuidClazz).toList().toPromise();
        expect(queryUpdateResult.length).to.equal(1);
        expect(queryUpdateResult[0].description).to.equal(obj1.description);
        expect(queryUpdateResult[0].guid).to.equal(obj1.guid);

        expect(() => transaction.add(ddl.drop(GuidClazz))).to.throw(`Transaction (id: ${transaction.id}) is no longer active, and can no longer be used`);

        const deleteResult = await ddl.drop(GuidClazz).execute().toPromise();
        expect(deleteResult.length).to.equal(1);
        expect(deleteResult[0].rowsAffected).to.equal(1);
    });

    it("Transaction execute immediate", async () => {

        const transaction = database.managedTransaction();

        // transaction.add(ddl.create(GuidClazz));

        const obj1 = Object.assign({}, ObjectToTest.guidClazz);
        const insertResult = await transaction.executeImmediate(
            crud
                .insert(GuidClazz, obj1)
        );

        expect(insertResult).to.have.lengthOf(1);
        expect(insertResult[0].insertId).to.have.lengthOf(36);
        expect(insertResult[0].insertId).to.equal(obj1.guid);

        const resultTransaction = await transaction.commit();
        expect(resultTransaction).to.equal(true);
    });

    it("Transaction manual", async () => {
        const commands: QueryCompiled[] = [
            {
                query: "BEGIN TRANSACTION;",
                params: []
            },
            {
                query: "CREATE TABLE IF NOT EXISTS GuidClazz( guid TEXT NOT NULL PRIMARY KEY, description TEXT );",
                params: []
            },
            {
                query: "INSERT INTO GuidClazz (guid, description) VALUES (?, ?);",
                params: ["1f38715c-9daf-4e88-b402-055b94e7f8f6", "Condicao Pagamento 25"]
            },
            {
                query: "COMMIT TRANSACTION;",
                params: []
            }
        ];
        for (const command of commands) {
            await database.executeSql(command.query, command.params);
        }
    });

    it("Transaction get guid id", async () => {

        const transaction = database.managedTransaction();

        // transaction.add(ddl.create(GuidClazz));

        const obj1 = Object.assign({}, ObjectToTest.guidClazz);
        // tslint:disable-next-line: no-unused-expression
        expect(obj1.guid).to.be.undefined;

        transaction.add(
            crud.insert(GuidClazz, obj1)
        );

        expect(obj1.guid).to.have.lengthOf(36);

        const resultTransaction = await transaction.commit();
        expect(resultTransaction).to.equal(true);

        const queryUpdateResult = await crud.query(GuidClazz).firstOrDefault(where => where.equal(x => x.guid, obj1.guid)).toPromise();
        expect(queryUpdateResult.description).to.equal(obj1.description);
        expect(queryUpdateResult.guid).to.equal(obj1.guid);

        // await ddl.drop(GuidClazz).execute().toPromise();
    });

    it("Transaction_error", async () => {

        // await ddl.create(GuidClazz).execute().toPromise();

        const transaction = database.managedTransaction();

        const obj1 = Object.assign({}, ObjectToTest.guidClazz);

        transaction.add(
            crud
                .insert(GuidClazz, obj1)
        );
        // script with error, table not exist
        transaction.add(
            crud
                .insert(TestClazz, ObjectToTest.testClazz)
        );

        const obj2 = Object.assign({}, ObjectToTest.guidClazz);

        transaction.add(
            crud
                .insert(GuidClazz, obj2)
        );
        try {
            // transaction.test();
            await transaction.commit();
        } catch (error) {
            expect("SQLITE_ERROR").to.equal(error.code);
            expect(obj1.guid).to.have.lengthOf(36);

            const queryUpdateResult = await crud.query(GuidClazz).firstOrDefault(where => where.equal(x => x.guid, obj1.guid)).toPromise();
            expect(queryUpdateResult.description).to.equal(obj1.description);
            expect(queryUpdateResult.guid).to.equal(obj1.guid);

            const resultRollback = await transaction.rollback();
            expect(resultRollback).to.equal(true);

            const queryUpdateResult2 = await crud.query(GuidClazz).firstOrDefault(where => where.equal(x => x.guid, obj1.guid)).toPromise();
            // tslint:disable-next-line: no-unused-expression
            expect(queryUpdateResult2).to.be.undefined;
            return;
        }
        expect.fail(void 0, void 0, "A transaction era para ter falhado");
    });

    it("Transaction rollback", async () => {

        // await ddl.create(GuidClazz).execute().toPromise();

        const transaction = database.managedTransaction();

        const obj1 = Object.assign({}, ObjectToTest.guidClazz);

        transaction.add(
            crud
                .insert(GuidClazz, obj1)
        );

        const obj2 = Object.assign({}, ObjectToTest.guidClazz);

        transaction.add(
            crud
                .insert(GuidClazz, obj2)
        );
        const resultRollback = await transaction.rollback();
        expect(resultRollback).to.equal(true);

        const queryUpdateResult2 = await crud.query(GuidClazz).firstOrDefault(where => where.equal(x => x.guid, obj1.guid)).toPromise();
        // tslint:disable-next-line: no-unused-expression
        expect(queryUpdateResult2).to.be.undefined;
    });

    it("Transaction rollback (with execute immediate)", async () => {

        // await ddl.create(GuidClazz).execute().toPromise();

        const transaction = database.managedTransaction();

        const obj1 = Object.assign({}, ObjectToTest.guidClazz);

        await transaction.executeImmediate(
            crud
                .insert(GuidClazz, obj1)
        );

        const queryUpdateResult1 = await crud.query(GuidClazz).firstOrDefault(where => where.equal(x => x.guid, obj1.guid)).toPromise();
        expect(queryUpdateResult1.description).to.equal(obj1.description);
        expect(queryUpdateResult1.guid).to.equal(obj1.guid);

        const obj2 = Object.assign({}, ObjectToTest.guidClazz);

        transaction.add(
            crud
                .insert(GuidClazz, obj2)
        );
        const resultRollback = await transaction.rollback();
        expect(resultRollback).to.equal(true);

        const queryUpdateResult2 = await crud.query(GuidClazz).firstOrDefault(where => where.equal(x => x.guid, obj1.guid)).toPromise();
        // tslint:disable-next-line: no-unused-expression
        expect(queryUpdateResult2).to.be.undefined;
    });

    /**
     * - permitir apenas executar em transaction metodos sem retorno (não permitir adicionar select)
     * Na verdade foi implemtando um tratamento de tipos para o typescript, para apresentar um erro ao tentar adicionar a transaction algo como QueryBuilder
     * Mas em tempo de execução vai executar normalmente, mas não tem nenhuma forma de obter o resultado de uma consulta dentro de uma transaction, então por isso não deve parecer possivel
     * OK
     */

    // it("Transaction deny query", async () => {

    //     const transaction = database.managedTransaction();

    //     transaction.add(ddl.create(GuidClazz));

    //     const obj1 = Object.assign({}, ObjectToTest.guidClazz);
    //     transaction.add(
    //         crud
    //             .insert(GuidClazz, obj1)
    //     );
    //     transaction.add(
    //         crud
    //             .query(GuidClazz)
    //     );

    //     const modelUpdate = {
    //         guid: "abc",
    //         description: "Teste Update"
    //     } as GuidClazz;
    //     transaction.add(
    //         crud
    //             .update(GuidClazz, modelUpdate)
    //             .where(where => where.equal(x => x.guid, obj1.guid))
    //     );

    //     const modelUpdateByDescription = new GuidClazz(void 0, "Teste teste test");
    //     transaction.add(
    //         crud
    //             .update(GuidClazz, modelUpdateByDescription)
    //             .where(where => where.equal(x => x.description, modelUpdate.description))
    //     );

    //     // transaction.add(ddl.drop(GuidClazz));

    //     const resultTransaction = await transaction.commit();
    //     expect(resultTransaction).to.equal(true);
    //     console.log(resultTransaction);

    //     // const queryUpdateResult = await crud.query(GuidClazz).toList().toPromise();
    //     // expect(queryUpdateResult.length).to.equal(1);
    //     // expect(queryUpdateResult[0].description).to.equal(modelUpdateByDescription.description);
    //     // expect(queryUpdateResult[0].guid).to.equal(obj1.guid);

    //     // const deleteResult = await ddl.drop(GuidClazz).execute().toPromise();
    //     // expect(deleteResult.length).to.equal(1);
    //     // expect(deleteResult[0].rowsAffected).to.equal(1);
    // });

    /**
     * TODO: implementar savepoint in transaction
     * https://sqlite.org/lang_savepoint.html
     */

    it("Transaction manual with savepoint", async () => {
        const commands: QueryCompiled[] = [
            {
                query: "BEGIN TRANSACTION;",
                params: []
            },
            {
                query: "INSERT INTO GuidClazz (guid, description) VALUES (?, ?); SAVEPOINT \"obj1\"; INSERT INTO GuidClazz (guid, description) VALUES (?, ?);RELEASE SAVEPOINT \"obj1\"",
                params: [
                    "a2d7e71f-ca4e-4dd0-86f0-d0359ab91d04",
                    "Obj3",
                    "a098153a-b86e-44d7-83ba-e5b948c6c051",
                    "Obj1"
                ]
            },
            // {
            //     query: "INSERT INTO GuidClazz (guid, description) VALUES (?, ?); SAVEPOINT \"obj1\"; INSERT INTO GuidClazz (guid, description) VALUES (?, ?);",
            //     params: [
            //         "a2d7e71f-ca4e-4dd0-86f0-d0359ab91d04",
            //         "Obj3",
            //         "a098153a-b86e-44d7-83ba-e5b948c6c051",
            //         "Obj1"
            //     ]
            // },
            // {
            //     query: "INSERT INTO GuidClazz (guid, description) VALUES (?, ?);",
            //     params: [
            //         "a2d7e71f-ca4e-4dd0-86f0-d0359ab91d04",
            //         "Obj3"
            //     ]
            // },
            // {
            //     query: "SAVEPOINT \"obj1\";",
            //     params: [
            //     ]
            // },
            // {
            //     query: "INSERT INTO GuidClazz (guid, description) VALUES (?, ?);",
            //     params: [
            //         "a098153a-b86e-44d7-83ba-e5b948c6c051",
            //         "Obj1"
            //     ]
            // },
            // {
            //     query: "RELEASE SAVEPOINT \"obj1\"",
            //     params: []
            // },
            // {
            //     query: "INSERT INTO GuidClazz (guid, description) VALUES (?, ?);",
            //     params: ["1f38715c-9daf-4e88-b402-obj3", "Condicao Pagamento Obj3"]
            // },
            // {
            //     query: "SAVEPOINT \"obj1\";",
            //     params: []
            // },
            // {
            //     query: "INSERT INTO GuidClazz (guid, description) VALUES (?, ?);",
            //     params: ["1f38715c-9daf-4e88-b402-obj1", "Condicao Pagamento Obj1"]
            // },
            // {
            //     query: "SAVEPOINT \"obj2\";",
            //     params: []
            // },
            // {
            //     query: "INSERT INTO GuidClazz (guid, description) VALUES (?, ?);",
            //     params: ["1f38715c-9daf-4e88-b402-obj2", "Condicao Pagamento Obj2"]
            // },
            // {
            //     query: "ROLLBACK TRANSACTION TO SAVEPOINT \"obj2\";",
            //     params: []
            // },
            // {
            //     query: "RELEASE SAVEPOINT \"obj1\";",
            //     params: []
            // },
            {
                query: "COMMIT TRANSACTION;",
                params: []
            }
        ];
        for (const command of commands) {
            await database.executeSql(command.query, command.params);
        }
        const r = await crud.query(GuidClazz).toList().toPromise();
        console.log("result:::", r);
    });

    it("Transaction_with_savepoint", async () => {

        const transaction = database.managedTransaction();

        const obj3 = Object.assign({}, ObjectToTest.guidClazz, { description: "Obj3" });
        transaction.add(
            crud
                .insert(GuidClazz, obj3)
        );

        const obj1 = Object.assign({}, ObjectToTest.guidClazz, { description: "Obj1" });
        transaction.createSavePoint("obj1");
        transaction.add(
            crud
                .insert(GuidClazz, obj1)
        );
        await transaction.commit("obj1");

        // const obj2 = Object.assign({}, ObjectToTest.guidClazz, { description: "Obj2" });
        // transaction.createSavePoint("obj2");
        // transaction.add(
        //     crud
        //         .insert(GuidClazz, obj2)
        // );
        // await transaction.rollback("obj2");

        const resultTransaction = await transaction.commit();
        expect(resultTransaction).to.equal(true);

        const result = await crud.query(GuidClazz).toList().toPromise();
        expect(result.length).to.equal(1);
        // expect(result.length).to.equal(2);
        expect(result[0].description).to.equal(obj3.description);
        expect(result[0].guid).to.equal(obj3.guid);
        // expect(result[1].description).to.equal(obj1.description);
        // expect(result[1].guid).to.equal(obj1.guid);

        // const modelUpdate = {
        //     description: "Teste Update"
        // } as GuidClazz;
        // transaction.add(
        //     crud
        //         .update(GuidClazz, modelUpdate)
        //         .where(where => where.equal(x => x.guid, obj1.guid))
        // );

        // const modelUpdateByDescription = new GuidClazz(void 0, "Teste teste test");
        // transaction.add(
        //     crud
        //         .update(GuidClazz, modelUpdateByDescription)
        //         .where(where => where.equal(x => x.description, modelUpdate.description))
        // );

        // const resultTransaction = await transaction.commit();
        // expect(resultTransaction).to.equal(true);

        // const queryUpdateResult = await crud.query(GuidClazz).toList().toPromise();
        // expect(queryUpdateResult.length).to.equal(2);
        // expect(queryUpdateResult[0].description).to.equal(modelUpdateByDescription.description);
        // expect(queryUpdateResult[0].guid).to.equal(obj1.guid);

        // const deleteResult = await ddl.drop(GuidClazz).execute().toPromise();
        // expect(deleteResult.length).to.equal(1);
        // expect(deleteResult[0].rowsAffected).to.equal(1);
    });
});
