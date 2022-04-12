import { Ddl } from "./../ddl/ddl";
import { getMapper } from "./mappers-table-new";
import { Crud } from "../crud";
import { GuidClazz } from "./models/guid-clazz";
import { SQLiteDatabase } from "./database/sqlite-database";
import * as sinon from "sinon";
import { SinonSandbox } from "sinon";
import { DatabaseObject } from "../definitions/database-definition";
import { ObjectToTest } from "./objeto-to-test";

describe("Log", () => {
    let crud: Crud;
    let ddl: Ddl;
    let database: DatabaseObject;

    let sandbox: SinonSandbox;
    before(async () => {
        sandbox = sinon.createSandbox();

        const mapper = getMapper();

        database = await new SQLiteDatabase().init();
        crud = new Crud({ sqliteLimitVariables: 10000 }, { database, getMapper: mapper, enableLog: true });
        ddl = new Ddl({ database, getMapper: mapper, enableLog: true });
    });

    beforeEach(async () => {
        sandbox.restore();
    });

    it("log with execute", async () => {
        const log = sandbox.spy(console, "log");

        await ddl.create(GuidClazz).execute().toPromise();

        const obj1 = Object.assign({}, ObjectToTest.guidClazz);
        const resultInsert = await crud.insert(GuidClazz, { toSave: obj1 }).execute().toPromise();

        const expectedCreate: any = {
            query:
                "CREATE TABLE IF NOT EXISTS GuidClazz( guid TEXT NOT NULL PRIMARY KEY, description TEXT )",
            params: []
        };

        const expectedInsert: any = {
            params:
                [obj1.guid,
                obj1.description],
            query: "INSERT INTO GuidClazz (guid, description) VALUES (?, ?)"
        };

        if (!log.calledWith(expectedCreate)) {
            throw new Error(`expected: ${JSON.stringify(expectedCreate)}`);
        }

        if (!log.calledWith(expectedInsert)) {
            throw new Error(`expected: ${JSON.stringify(expectedInsert)}`);
        }
    });

    // TODO:
    // it("log with transaction", async () => {
    //     const log = sandbox.spy(console, "log");

    //     const transaction = database.managedTransaction();

    //     await ddl.create(GuidClazz).execute().toPromise();

    //     const obj1 = Object.assign({}, ObjectToTest.guidClazz);
    //     transaction.add(
    //         crud
    //             .insert(GuidClazz, { modelToSave: obj1 })
    //     );
    //     const resultInsert = await transaction.commit().toPromise();

    //     const expectedCreate: any = {
    //         query:
    //             "CREATE TABLE IF NOT EXISTS GuidClazz( guid TEXT NOT NULL PRIMARY KEY, description TEXT )",
    //         params: []
    //     };

    //     const expectedInsert: any = {
    //         params:
    //             [obj1.guid,
    //             obj1.description],
    //         query: "INSERT INTO GuidClazz (guid, description) VALUES (?, ?)"
    //     };

    //     if (!log.calledWith(expectedCreate)) {
    //         throw new Error(`expected: ${JSON.stringify(expectedCreate)}`);
    //     }

    //     if (!log.calledWith(expectedInsert)) {
    //         throw new Error(`expected: ${JSON.stringify(expectedInsert)}`);
    //     }
    // });
});
