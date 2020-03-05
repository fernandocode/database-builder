import { Ddl } from "./../ddl/ddl";
import { getMapper } from "./mappers-table-new";
import { Crud } from "../crud";
import { GuidClazz } from "./models/guid-clazz";
import { SQLiteDatabase } from "./database/sqlite-database";

describe("Log", () => {
    let crud: Crud;
    let ddl: Ddl;

    beforeEach(async () => {
        const mapper = getMapper();

        const database = await new SQLiteDatabase().init();
        crud = new Crud({ database, getMapper: mapper, enableLog: true });
        ddl = new Ddl({ database, getMapper: mapper, enableLog: true });
    });

    it("GuidClazz", async () => {

        await ddl.create(GuidClazz).execute().toPromise();

        // const obj1 = Object.assign({}, ObjectToTest.guidClazz);
        // const insertResult = await crud.insert(GuidClazz, { modelToSave: obj1 }).execute().toPromise();
        // expect(insertResult[0].rowsAffected).to.equal(1);

        // const queryInsertResult = await crud.query(GuidClazz).toList().toPromise();
        // expect(queryInsertResult.length).to.equal(1);
        // expect(queryInsertResult[0].description).to.equal(obj1.description);
        // expect(queryInsertResult[0].guid).to.equal(obj1.guid);

        // const modelUpdate = {
        //     guid: "abc",
        //     description: "Teste Update"
        // } as GuidClazz;
        // const updateResult = await crud.update(GuidClazz, { modelToSave: modelUpdate })
        //     .where(where => where.equal(x => x.guid, obj1.guid))
        //     .execute().toPromise();
        // expect(updateResult[0].rowsAffected).to.equal(1);

        // const queryUpdateResult = await crud.query(GuidClazz).toList().toPromise();
        // expect(queryUpdateResult.length).to.equal(1);
        // expect(queryUpdateResult[0].description).to.equal(modelUpdate.description);
        // expect(queryUpdateResult[0].guid).to.equal(obj1.guid);

        // const modelUpdateByDescription = new GuidClazz(void 0, "Teste teste test");
        // const updateByDescriptionResult = await crud.update(GuidClazz, { modelToSave: modelUpdateByDescription })
        //     .where(where => where.equal(x => x.description, modelUpdate.description))
        //     .execute().toPromise();
        // expect(updateByDescriptionResult[0].rowsAffected).to.equal(1);
        // expect(modelUpdateByDescription.guid).to.equal(void 0);
    });
});
