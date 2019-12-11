import { Ddl } from "./../ddl/ddl";
import { expect } from "chai";
import { getMapper } from "./mappers-table-new";
import { Crud } from "../crud";
import { GuidClazz } from "./models/guid-clazz";
import { SQLiteDatabase } from "./database/sqlite-database";
import { DatabaseObject } from "../definitions";
import { SingleTransactionManager } from "../transaction/single-transaction-manager";
import { Observable } from "rxjs";
import { forkJoinSafe } from "../safe-utils";

describe("Single Transaction Manager", function () {
    this.enableTimeouts(false);

    let crud: Crud;
    let ddl: Ddl;
    let database: DatabaseObject;

    before(async () => {
        const mapper = getMapper();

        database = await new SQLiteDatabase().init();
        crud = new Crud({ database, getMapper: mapper, enableLog: false });
        ddl = new Ddl({ database, getMapper: mapper, enableLog: false });
    });

    beforeEach(async () => {
        await ddl.create(GuidClazz).execute().toPromise();
    });

    afterEach(async () => {
        await ddl.drop(GuidClazz).execute().toPromise();
    });

    it("Check execute multiple observers sequentially", async () => {
        const randomInterval = (min: number, max: number): number => {
            return Math.floor(Math.random() * (max - min + 1) + min);
        };
        const single = new SingleTransactionManager();
        const observers: Array<Observable<boolean>> = [];
        const countObservers = 100;

        let statusTransaction: "started" | "finished" = "finished";
        const setStatusTransaction = (value: "started" | "finished") => {
            if (statusTransaction === value) {
                throw new Error(`Trying ${value} transaction with status ${statusTransaction}`);
            }
            statusTransaction = value;
        };
        for (let index = 0; index < countObservers; index++) {
            const value = randomInterval(5, 50);
            const observer = new Observable<boolean>(
                observer => {
                    setStatusTransaction("started");
                    setTimeout(() => {
                        observer.next(true);
                        setStatusTransaction("finished");
                        observer.complete();
                    }, value);
                });
            observers.push(single.commitOnStack(observer));
        }
        const result = await forkJoinSafe(observers).toPromise();
        expect(result.length).to.equal(countObservers);
    });

    it("Check execute multiple transaction sequentially", async () => {

        const observers: Array<Observable<boolean>> = [];
        const countTransactions = 1000;

        for (let index = 0; index < countTransactions; index++) {

            const transaction = database.managedTransaction();
            const obj1 = {
                description: `Description $index: ${index}`
            } as GuidClazz;
            transaction.add(
                crud
                    .insert(GuidClazz, { modelToSave: obj1 })
            );
            observers.push(transaction.commit());
        }
        const result = await forkJoinSafe(observers).toPromise();
        expect(result.length).to.equal(countTransactions);

        const list = await crud.query(GuidClazz).toList().toPromise();
        expect(list.length).to.equal(countTransactions);
        expect(list[0].description).to.equal(`Description $index: 0`);
        expect(list[countTransactions - 1].description).to.equal(`Description $index: ${countTransactions - 1}`);

        const deleteResult = await crud.delete(GuidClazz).execute().toPromise();
        expect(deleteResult.length).to.equal(1);
        expect(deleteResult[0].rowsAffected).to.equal(countTransactions);
    });

});
