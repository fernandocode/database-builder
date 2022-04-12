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
import { firstValueFrom } from "rxjs";

describe("Managed Transaction", () => {
    let crud: Crud;
    let ddl: Ddl;
    let database: DatabaseObject;

    before(async () => {
        const mapper = getMapper();

        database = await new SQLiteDatabase().init();
        crud = new Crud({ sqliteLimitVariables: 10000 }, { database, getMapper: mapper, enableLog: false });
        ddl = new Ddl({ database, getMapper: mapper, enableLog: false });
    });

    beforeEach(async () => {
        await ddl.create(GuidClazz).execute().toPromise();
    });

    afterEach(async () => {
        await ddl.drop(GuidClazz).execute().toPromise();
    });

    it("Transaction Simple", async () => {

        const transaction = database.managedTransaction();

        const obj1 = Object.assign({}, ObjectToTest.guidClazz);
        transaction.add(
            crud
                .insert(GuidClazz, { toSave: obj1 })
        );

        const modelUpdate = {
            guid: "abc",
            description: "Teste Update"
        } as GuidClazz;
        transaction.add(
            crud
                .update(GuidClazz, { toSave: modelUpdate })
                .where(where => where.equal(x => x.guid, obj1.guid))
        );

        const modelUpdateByDescription = new GuidClazz(void 0, "Teste teste test");
        transaction.add(
            crud
                .update(GuidClazz, { toSave: modelUpdateByDescription })
                .where(where => where.equal(x => x.description, modelUpdate.description))
        );

        const resultTransaction = await transaction.commit().toPromise();
        expect(resultTransaction).to.equal(true);

        const queryUpdateResult = await crud.query(GuidClazz).toList().toPromise();
        expect(queryUpdateResult.length).to.equal(1);
        expect(queryUpdateResult[0].description).to.equal(modelUpdateByDescription.description);
        expect(queryUpdateResult[0].guid).to.equal(obj1.guid);
    });

    it("Transaction inactive", async () => {

        const transaction = database.managedTransaction();

        const obj1 = Object.assign({}, ObjectToTest.guidClazz);
        transaction.add(
            crud
                .insert(GuidClazz, { toSave: obj1 })
        );

        const resultTransaction = await transaction.commit().toPromise();
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

        const obj1 = Object.assign({}, ObjectToTest.guidClazz);
        const insertResult = await transaction.executeImmediate(
            crud
                .insert(GuidClazz, { toSave: obj1 })
        );

        expect(insertResult).to.have.lengthOf(1);
        expect(insertResult[0].insertId).to.have.lengthOf(36);
        expect(insertResult[0].insertId).to.equal(obj1.guid);

        const resultTransaction = await transaction.commit().toPromise();
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

    it("Transaction manual Insert Multiple", async () => {
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
                params: ["1f38715c-9daf-4e88-b402-055b94e7f8f6", "T 1"]
            },
            {
                query: "INSERT INTO GuidClazz (guid, description) VALUES (?, ?);",
                params: ["2f38715c-9daf-4e88-b402-055b94e7f8f6", "T 2"]
            },
            {
                query: "INSERT INTO GuidClazz (guid, description) VALUES (?, ?), (?, ?);",
                params: ["3f38715c-9daf-4e88-b402-055b94e7f8f6", "T 3",
                    "4f38715c-9daf-4e88-b402-055b94e7f8f6", "T 4"]
            },
            {
                query: "COMMIT TRANSACTION;",
                params: []
            }
        ];
        for (const command of commands) {
            await database.executeSql(command.query, command.params);
        }

        const resultList = await firstValueFrom(crud.query(GuidClazz).toList());

        expect(resultList.length).to.equal(4);

        expect(resultList[0].guid).to.equal(commands[2].params[0]);
        expect(resultList[0].description).to.equal(commands[2].params[1]);

        expect(resultList[1].guid).to.equal(commands[3].params[0]);
        expect(resultList[1].description).to.equal(commands[3].params[1]);

        expect(resultList[2].guid).to.equal(commands[4].params[0]);
        expect(resultList[2].description).to.equal(commands[4].params[1]);

        expect(resultList[3].guid).to.equal(commands[4].params[2]);
        expect(resultList[3].description).to.equal(commands[4].params[3]);
    });

    it("Managed Transaction Insert Multiple", async () => {
        const transaction = database.managedTransaction();
        transaction.addStatement("CREATE TABLE IF NOT EXISTS GuidClazz( guid TEXT NOT NULL PRIMARY KEY, description TEXT );", []);
        transaction.addStatement("INSERT INTO GuidClazz (guid, description) VALUES (?, ?), (?, ?), (?, ?), (?, ?);",
            [
                "f38715c-9daf-4e88-b402-055b94e7f8f6", "T 1",
                "2f38715c-9daf-4e88-b402-055b94e7f8f6", "T 2",
                "3f38715c-9daf-4e88-b402-055b94e7f8f6", "T 3",
                "4f38715c-9daf-4e88-b402-055b94e7f8f6", "T 4"
            ]);

        const stack = [... (transaction as any)._stack] as Array<{ statement: string, params: any[] }>;

        const resultTransaction = await firstValueFrom(transaction.commit());

        expect(resultTransaction).to.true;

        const resultList = await firstValueFrom(crud.query(GuidClazz).toList());

        expect(resultList.length).to.equal(4);

        expect(resultList[0].guid).to.equal(stack[1].params[0]);
        expect(resultList[0].description).to.equal(stack[1].params[1]);

        expect(resultList[1].guid).to.equal(stack[1].params[2]);
        expect(resultList[1].description).to.equal(stack[1].params[3]);

        expect(resultList[2].guid).to.equal(stack[1].params[4]);
        expect(resultList[2].description).to.equal(stack[1].params[5]);

        expect(resultList[3].guid).to.equal(stack[1].params[6]);
        expect(resultList[3].description).to.equal(stack[1].params[7]);
    });

    const createData = (index: number): any[] => {
        return [`${index}f38715c-9daf-4e88-b402-055b94e7f8f6`, `Teste testando se funciona ${index}`];
    };

    const createArrayData = (count: number): any[][] => {
        return Array.from({ length: count }, (_, i) => createData(i))
    };


    const dados = [
        ["1f38715c-9daf-4e88-b402-055b94e7f8f6", "T 1"],
        ["2f38715c-9daf-4e88-b402-055b94e7f8f6", "T 2"],
        ["3f38715c-9daf-4e88-b402-055b94e7f8f6", "T 3"],
        ["4f38715c-9daf-4e88-b402-055b94e7f8f6", "T 4"],
    ];

    it("Managed Transaction Insert Multiple new", async () => {

        // (this as any).timeout(100000);

        const transaction = database.managedTransaction();
        transaction.addStatement("CREATE TABLE IF NOT EXISTS GuidClazz( guid TEXT NOT NULL PRIMARY KEY, description TEXT );", []);

        const insertMultiple = (baseInsert: string, inserts: any[][]): { statement: string, params: any[] } => {
            return {
                statement: `${baseInsert} ${inserts.map(a => `(${a.map(_ => "?").join(",")})`)};`,
                params: [].concat(...inserts)
            };
        }
        const count = 5000;

        const insert = insertMultiple("INSERT INTO GuidClazz (guid, description) VALUES", createArrayData(count));
        transaction.addStatement(insert.statement, insert.params);

        const resultTransaction = await firstValueFrom(transaction.commit());

        expect(resultTransaction).to.true;

        const resultList = await firstValueFrom(crud.query(GuidClazz).toList());

        expect(resultList.length).to.equal(count);
    });

    it("Managed Transaction Insert Multiple old", async () => {
        const transaction = database.managedTransaction();
        transaction.addStatement("CREATE TABLE IF NOT EXISTS GuidClazz( guid TEXT NOT NULL PRIMARY KEY, description TEXT );", []);

        const insertSingle = (baseInsert: string, inserts: any[][]): { statement: string, params: any[] }[] => {
            return inserts.map(insert => {
                return {
                    statement: `${baseInsert} (${insert.map(_ => "?").join(",")});`,
                    params: insert
                };
            });
        }
        const count = 5000;

        const inserts = insertSingle("INSERT INTO GuidClazz (guid, description) VALUES", createArrayData(count));
        for (const insert of inserts) {
            transaction.addStatement(insert.statement, insert.params);
        }

        const resultTransaction = await firstValueFrom(transaction.commit());

        expect(resultTransaction).to.true;

        const resultList = await firstValueFrom(crud.query(GuidClazz).toList());

        expect(resultList.length).to.equal(count);
    });

    it("Transaction get guid id", async () => {

        const transaction = database.managedTransaction();

        const obj1 = Object.assign({}, ObjectToTest.guidClazz);
        // tslint:disable-next-line: no-unused-expression
        expect(obj1.guid).to.be.undefined;

        transaction.add(
            crud.insert(GuidClazz, { toSave: obj1 })
        );

        expect(obj1.guid).to.have.lengthOf(36);

        const resultTransaction = await transaction.commit().toPromise();
        expect(resultTransaction).to.equal(true);

        const queryUpdateResult = await crud.query(GuidClazz).firstOrDefault({ where: where => where.equal(x => x.guid, obj1.guid) }).toPromise();
        expect(queryUpdateResult.description).to.equal(obj1.description);
        expect(queryUpdateResult.guid).to.equal(obj1.guid);
    });

    it("Transaction error", async () => {

        const transaction = database.managedTransaction();

        const obj1 = Object.assign({}, ObjectToTest.guidClazz);

        transaction.add(
            crud
                .insert(GuidClazz, { toSave: obj1 })
        );
        // script with error, table not exist
        transaction.add(
            crud
                .insert(TestClazz, { toSave: ObjectToTest.testClazz })
        );

        const obj2 = Object.assign({}, ObjectToTest.guidClazz);

        transaction.add(
            crud
                .insert(GuidClazz, { toSave: obj2 })
        );
        try {
            await transaction.commit().toPromise();
        } catch (error) {
            expect("SQLITE_ERROR").to.equal((error as any).code);
            expect(obj1.guid).to.have.lengthOf(36);

            const queryUpdateResult = await crud.query(GuidClazz).firstOrDefault({ where: where => where.equal(x => x.guid, obj1.guid) }).toPromise();
            expect(queryUpdateResult.description).to.equal(obj1.description);
            expect(queryUpdateResult.guid).to.equal(obj1.guid);

            const resultRollback = await transaction.rollback();
            expect(resultRollback).to.equal(true);

            const queryUpdateResult2 = await crud.query(GuidClazz).firstOrDefault({ where: where => where.equal(x => x.guid, obj1.guid) }).toPromise();
            // tslint:disable-next-line: no-unused-expression
            expect(queryUpdateResult2).to.be.undefined;
            return;
        }
        expect.fail(void 0, void 0, "A transaction era para ter falhado");
    });

    it("Transaction rollback", async () => {

        const transaction = database.managedTransaction();

        const obj1 = Object.assign({}, ObjectToTest.guidClazz);

        transaction.add(
            crud
                .insert(GuidClazz, { toSave: obj1 })
        );

        const obj2 = Object.assign({}, ObjectToTest.guidClazz);

        transaction.add(
            crud
                .insert(GuidClazz, { toSave: obj2 })
        );
        const resultRollback = await transaction.rollback();
        expect(resultRollback).to.equal(true);

        const queryUpdateResult2 = await crud.query(GuidClazz).firstOrDefault({ where: where => where.equal(x => x.guid, obj1.guid) }).toPromise();
        // tslint:disable-next-line: no-unused-expression
        expect(queryUpdateResult2).to.be.undefined;
    });

    it("Transaction rollback (with execute immediate)", async () => {

        const transaction = database.managedTransaction();

        const obj1 = Object.assign({}, ObjectToTest.guidClazz);

        const resultImmediate = await transaction.executeImmediate(
            crud
                .insert(GuidClazz, { toSave: obj1 })
        );
        expect(resultImmediate.length).to.equal(1);
        expect(resultImmediate[0].rowsAffected).to.equal(1);

        const queryUpdateResult1 = await crud.query(GuidClazz).firstOrDefault({ where: where => where.equal(x => x.guid, obj1.guid) }).toPromise();
        expect(queryUpdateResult1.description).to.equal(obj1.description);
        expect(queryUpdateResult1.guid).to.equal(obj1.guid);

        const obj2 = Object.assign({}, ObjectToTest.guidClazz);

        transaction.add(
            crud
                .insert(GuidClazz, { toSave: obj2 })
        );
        const resultRollback = await transaction.rollback();
        expect(resultRollback).to.equal(true);

        const queryUpdateResult2 = await crud.query(GuidClazz).firstOrDefault({ where: where => where.equal(x => x.guid, obj1.guid) }).toPromise();
        // tslint:disable-next-line: no-unused-expression
        expect(queryUpdateResult2).to.be.undefined;
    });

    /**
     * - permitir apenas executar em transaction metodos sem retorno (não permitir adicionar select)
     * Na verdade foi implemtando um tratamento de tipos para o typescript, para apresentar um erro ao tentar adicionar a transaction algo como QueryBuilder
     * Mas em tempo de execução vai executar normalmente, mas não tem nenhuma forma de obter o resultado de uma consulta dentro de uma transaction, então por isso não deve parecer possivel
     * OK
     */

    it("Transaction deny query", async () => {

        const transaction = database.managedTransaction();

        transaction.add(ddl.create(GuidClazz));

        const obj1 = Object.assign({}, ObjectToTest.guidClazz);
        transaction.add(
            crud
                .insert(GuidClazz, { toSave: obj1 })
        );
        transaction.add(
            crud
                .query(GuidClazz) as any
        );

        const modelUpdate = {
            guid: "abc",
            description: "Teste Update"
        } as GuidClazz;
        transaction.add(
            crud
                .update(GuidClazz, { toSave: modelUpdate })
                .where(where => where.equal(x => x.guid, obj1.guid))
        );

        const modelUpdateByDescription = new GuidClazz(void 0, "Teste teste test");
        transaction.add(
            crud
                .update(GuidClazz, { toSave: modelUpdateByDescription })
                .where(where => where.equal(x => x.description, modelUpdate.description))
        );

        const resultTransaction = await transaction.commit().toPromise();
        expect(resultTransaction).to.equal(true);
    });

    /**
     * Implementado savepoint in transaction
     * https://sqlite.org/lang_savepoint.html
     */
    it("Transaction manual with savepoint", async () => {
        const commands: QueryCompiled[] = [
            {
                query: "BEGIN TRANSACTION;",
                params: []
            },
            {
                query: "INSERT INTO GuidClazz (guid, description) VALUES (?, ?);",
                params: ["1f38715c-9daf-4e88-b402-obj3", "Condicao Pagamento Obj3"]
            },
            {
                query: "SAVEPOINT \"obj1\";",
                params: []
            },
            {
                query: "INSERT INTO GuidClazz (guid, description) VALUES (?, ?);",
                params: ["1f38715c-9daf-4e88-b402-obj1", "Condicao Pagamento Obj1"]
            },
            {
                query: "SAVEPOINT \"obj2\";",
                params: []
            },
            {
                query: "INSERT INTO GuidClazz (guid, description) VALUES (?, ?);",
                params: ["1f38715c-9daf-4e88-b402-obj2", "Condicao Pagamento Obj2"]
            },
            {
                query: "ROLLBACK TRANSACTION TO SAVEPOINT \"obj2\";",
                params: []
            },
            {
                query: "RELEASE SAVEPOINT \"obj1\";",
                params: []
            },
            {
                query: "COMMIT TRANSACTION;",
                params: []
            }
        ];
        for (const command of commands) {
            await database.executeSql(command.query, command.params);
        }
        const result = await crud.query(GuidClazz).toList().toPromise();
        expect(result).to.have.lengthOf(2);
        expect(result[0].description).to.equal("Condicao Pagamento Obj3");
        expect(result[0].guid).to.equal("1f38715c-9daf-4e88-b402-obj3");
        expect(result[1].description).to.equal("Condicao Pagamento Obj1");
        expect(result[1].guid).to.equal("1f38715c-9daf-4e88-b402-obj1");
    });

    it("Transaction with savepoint (manual)", async () => {
        const obj3: GuidClazz = { guid: "1f38715c-9daf-4e88-b402-obj3", description: "Obj3" };
        const obj1: GuidClazz = { guid: "1f38715c-9daf-4e88-b402-obj1", description: "Obj1" };
        const obj2: GuidClazz = { guid: "1f38715c-9daf-4e88-b402-obj2", description: "Obj2" };
        const commands: QueryCompiled[] = [
            {
                query: "BEGIN TRANSACTION;",
                params: []
            },
            {
                query: `INSERT INTO GuidClazz (guid, description) VALUES ('${obj3.guid}', '${obj3.description}');SAVEPOINT "obj1";INSERT INTO GuidClazz (guid, description) VALUES ('${obj1.guid}', '${obj1.description}');RELEASE SAVEPOINT "obj1";`,
                params: []
            },
            {
                query: `SAVEPOINT "obj2"; INSERT INTO GuidClazz (guid, description) VALUES ('${obj2.guid}', '${obj2.description}'); ROLLBACK TRANSACTION TO SAVEPOINT "obj2";`,
                params: []
            },
            {
                query: "COMMIT TRANSACTION;",
                params: []
            }
        ];
        for (const command of commands) {
            await database.executeSql(command.query, command.params);
        }
        const result = await crud.query(GuidClazz).toList().toPromise();
        expect(result).to.have.lengthOf(2);
        expect(result[0].guid).to.equal(obj3.guid);
        expect(result[0].description).to.equal(obj3.description);
        expect(result[1].guid).to.equal(obj1.guid);
        expect(result[1].description).to.equal(obj1.description);
    });

    /**
     * Descontinuado pois não é suportado por todos os providers
     */
    // it("Transaction with savepoint 1", async () => {

    //     const transaction = database.managedTransaction();

    //     const obj3 = Object.assign({}, ObjectToTest.guidClazz, { description: "Obj3" });
    //     transaction.add(
    //         crud
    //             .insert(GuidClazz, { modelToSave: obj3 })
    //     );

    //     const obj1 = Object.assign({}, ObjectToTest.guidClazz, { description: "Obj1" });
    //     transaction.createSavePoint("obj1");
    //     transaction.add(
    //         crud
    //             .insert(GuidClazz, { modelToSave: obj1 })
    //     );

    //     const obj2 = Object.assign({}, ObjectToTest.guidClazz, { description: "Obj2" });
    //     transaction.createSavePoint("obj2");
    //     transaction.add(
    //         crud
    //             .insert(GuidClazz, { modelToSave: obj2 })
    //     );
    //     await transaction.rollback("obj2");
    //     await transaction.commit("obj1");

    //     const resultTransaction = await transaction.commit().toPromise();
    //     expect(resultTransaction).to.equal(true);

    //     const result = await crud.query(GuidClazz).toList().toPromise();
    //     expect(result).to.have.lengthOf(2);
    //     expect(result[0].guid).to.equal(obj3.guid);
    //     expect(result[0].description).to.equal(obj3.description);
    //     expect(result[1].guid).to.equal(obj1.guid);
    //     expect(result[1].description).to.equal(obj1.description);
    // });

    // it("Transaction with savepoint 2", async () => {

    //     const transaction = database.managedTransaction();

    //     const obj3 = Object.assign({}, ObjectToTest.guidClazz, { description: "Obj3" });
    //     transaction.add(
    //         crud
    //             .insert(GuidClazz, { modelToSave: obj3 })
    //     );

    //     const obj1 = Object.assign({}, ObjectToTest.guidClazz, { description: "Obj1" });
    //     transaction.createSavePoint("obj1");
    //     transaction.add(
    //         crud
    //             .insert(GuidClazz, { modelToSave: obj1 })
    //     );

    //     const obj2 = Object.assign({}, ObjectToTest.guidClazz, { description: "Obj2" });
    //     transaction.createSavePoint("obj2");
    //     transaction.add(
    //         crud
    //             .insert(GuidClazz, { modelToSave: obj2 })
    //     );
    //     await transaction.commit("obj2");
    //     await transaction.rollback("obj1");

    //     const resultTransaction = await transaction.commit().toPromise();
    //     expect(resultTransaction).to.equal(true);

    //     const result = await crud.query(GuidClazz).toList().toPromise();
    //     expect(result).to.have.lengthOf(1);
    //     expect(result[0].guid).to.equal(obj3.guid);
    //     expect(result[0].description).to.equal(obj3.description);
    // });
});
