import { Ddl } from "./../ddl/ddl";
import { getMapper } from "./mappers-table-new";
import { Crud } from "../crud";
import { GuidClazz } from "./models/guid-clazz";
import { SQLiteDatabase } from "./database/sqlite-database";
import { DatabaseObject } from "../definitions";
import { SingleTransactionManager } from "../transaction/single-transaction-manager";
import { Observable } from "rxjs";
import { forkJoinSafe } from "../safe-utils";
import { HeaderSimple } from "./models/header-simple";
import { Referencia } from "./models/referencia";
import { GuidClazzHasMany } from "./models/guid-clazz-has-many";

import * as chaiAsPromised from "chai-as-promised";
import * as chai from "chai";
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Single Transaction Manager", function () {
    this.timeout(999999);

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
                    .insert(GuidClazz, { toSave: obj1 })
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

    it("cascade mapper transaction autoincrement", async () => {
        const createResult = await ddl.create(HeaderSimple).execute().toPromise();
        expect(createResult.length).to.equal(2);

        const observers: Array<Observable<boolean>> = [];
        const objectsSaved: HeaderSimple[] = [];
        const countTransactions = 100;

        for (let index = 0; index < countTransactions; index++) {
            const transaction = database.managedTransaction();
            const headerSimple2 = {
                descricao: "Header 2",
                items: ["123", "456", "789", "10a"]
            } as HeaderSimple;
            objectsSaved.push(headerSimple2);
            transaction.add(
                crud.insert(HeaderSimple, { toSave: headerSimple2 })
            );
            observers.push(transaction.commit());
        }

        return expect(forkJoinSafe(observers).toPromise()).to.be.rejectedWith(`Insert cascading with autoincrement mapper not supported with transaction. (Found in "INSERT INTO ItemHeaderSimple (indexArray, value, HeaderSimple_id) VALUES (?, ?, ?)", params: [0,123,[0,insertId]], paramIndex: 2)`);
    });

    it("cascade mapper transaction guid", async () => {
        const createResult = await ddl.create(GuidClazzHasMany).execute().toPromise();
        expect(createResult.length).to.equal(2);

        const observers: Array<Observable<boolean>> = [];
        const objectsSaved: GuidClazzHasMany[] = [];
        const countTransactions = 100;

        for (let index = 0; index < countTransactions; index++) {
            const transaction = database.managedTransaction();
            const guidClass = {
                description: "Guid 2",
                items: ["123", "456", "789", "10a"]
            } as GuidClazzHasMany;
            objectsSaved.push(guidClass);
            transaction.add(
                crud.insert(GuidClazzHasMany, { toSave: guidClass })
            );
            observers.push(transaction.commit());
        }
        const result = await forkJoinSafe(observers).toPromise();
        expect(result.length).to.equal(countTransactions);

        const objSaved = await crud.query(GuidClazzHasMany).where(where => where.equal(x => x.guid, objectsSaved[countTransactions - 1].guid)).firstOrDefault().toPromise();
        expect(objSaved.description).to.equal(objectsSaved[countTransactions - 1].description);
        expect(objSaved.items.length).to.equal(objectsSaved[countTransactions - 1].items.length);
        expect(objSaved.items[0]).to.equal(objectsSaved[countTransactions - 1].items[0]);

        const dropResult = await ddl.drop(GuidClazzHasMany).execute().toPromise();
        expect(dropResult.length).to.equal(2);
    });

    it("cascade mapper transaction assigned", async () => {
        const createResult = await ddl.create(Referencia).execute().toPromise();
        expect(createResult.length).to.equal(3);

        const observers: Array<Observable<boolean>> = [];
        const objectsSaved: Referencia[] = [];
        const countTransactions = 100;

        for (let index = 0; index < countTransactions; index++) {
            const transaction = database.managedTransaction();
            const referencia = {
                codeImport: index + 1,
                codigo: "abc",
                descricao: "Header 2",
                restricaoGrade: ["123", "456", "789", "10a"],
                referenciasRelacionadas: [
                    {
                        codeImport: 30
                    } as Referencia,
                    {
                        codeImport: 40
                    } as Referencia
                ]
            } as Referencia;
            objectsSaved.push(referencia);
            transaction.add(
                crud.insert(Referencia, { toSave: referencia })
            );
            observers.push(transaction.commit());
        }
        const result = await forkJoinSafe(observers).toPromise();
        expect(result.length).to.equal(countTransactions);

        const objSaved = await crud.query(Referencia).where(where => where.equal(x => x.codeImport, objectsSaved[countTransactions - 1].codeImport)).firstOrDefault().toPromise();
        expect(objSaved.descricao).to.equal(objectsSaved[countTransactions - 1].descricao);
        expect(objSaved.restricaoGrade.length).to.equal(objectsSaved[countTransactions - 1].restricaoGrade.length);
        expect(objSaved.restricaoGrade[0]).to.equal(objectsSaved[countTransactions - 1].restricaoGrade[0]);
        expect(objSaved.referenciasRelacionadas.length).to.equal(objectsSaved[countTransactions - 1].referenciasRelacionadas.length);
        expect(objSaved.referenciasRelacionadas[0].codeImport).to.equal(objectsSaved[countTransactions - 1].referenciasRelacionadas[0].codeImport);

        const dropResult = await ddl.drop(Referencia).execute().toPromise();
        expect(dropResult.length).to.equal(3);
    });

});
