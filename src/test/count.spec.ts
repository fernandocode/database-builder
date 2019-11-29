import { expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import { Crud } from "../crud/crud";
import { getMapper } from "./mappers-table-new";
import { Ddl } from "../ddl/ddl";
import { SQLiteDatabase } from "./database/sqlite-database";
import { Cliente } from "./models/cliente";
import { Cidade } from "./models/cidade";
import { ObjectToTest } from "./objeto-to-test";

describe("Count", () => {
    let crud: Crud;
    let ddl: Ddl;

    before(async () => {
        const mapper = getMapper();

        const database = await new SQLiteDatabase().init();
        crud = new Crud(database, mapper, false);
        ddl = new Ddl(database, mapper, false);
    });

    beforeEach(async () => {
        await ddl.create(Cliente).execute().toPromise();
        await ddl.create(Cidade).execute().toPromise();
    });

    afterEach(async () => {
        await ddl.drop(Cliente).execute().toPromise();
        await ddl.drop(Cidade).execute().toPromise();
    });

    it("count default", async () => {
        const countExpected = 20;
        for (let index = 1; index <= countExpected; index++) {
            const cidade = Object.assign({}, ObjectToTest.cidade);
            cidade.codeImport = index;
            await crud.insert(Cidade, cidade).execute().toPromise();
        }
        const query = crud.query(Cidade).ignoreQueryFilters();
        const resultCount = await query.count().toPromise();
        await crud.delete(Cidade).execute().toPromise();
        expect(resultCount).to.equal(countExpected);
    });

    it("count with where inner", async () => {
        const countExpected = 20;
        for (let index = 1; index <= countExpected; index++) {
            const cidade = Object.assign({}, ObjectToTest.cidade);
            cidade.codeImport = index;
            await crud.insert(Cidade, cidade).execute().toPromise();
        }
        const query = crud.query(Cidade).ignoreQueryFilters();
        const resultCount = await query.count(where => where.lessAndEqual(x => x.codeImport, countExpected / 2)).toPromise();
        await crud.delete(Cidade).execute().toPromise();
        expect(resultCount).to.equal(countExpected / 2);
    });

    it("count with where normal", async () => {
        const countExpected = 20;
        for (let index = 1; index <= countExpected; index++) {
            const cidade = Object.assign({}, ObjectToTest.cidade);
            cidade.codeImport = index;
            await crud.insert(Cidade, cidade).execute().toPromise();
        }
        const query = crud.query(Cidade).ignoreQueryFilters();
        const resultCount = await query
            .where(where => where.lessAndEqual(x => x.codeImport, countExpected / 2))
            .count().toPromise();
        await crud.delete(Cidade).execute().toPromise();
        expect(resultCount).to.equal(countExpected / 2);
    });

    it("count with two where (inner and normal)", async () => {
        const countExpected = 20;
        for (let index = 1; index <= countExpected; index++) {
            const cidade = Object.assign({}, ObjectToTest.cidade);
            cidade.codeImport = index;
            await crud.insert(Cidade, cidade).execute().toPromise();
        }
        const query = crud.query(Cidade).ignoreQueryFilters();
        const resultCount = await query
            .where(where => where.lessAndEqual(x => x.codeImport, countExpected / 2))
            .count(where => where.great(x => x.codeImport, countExpected / 4)).toPromise();
        await crud.delete(Cidade).execute().toPromise();
        expect(resultCount).to.equal(countExpected / 4);
    });

    it("count with two where (inner and normal) and with query filter", async () => {
        const countExpected = 20;
        for (let index = 1; index <= countExpected; index++) {
            const cidade = Object.assign({}, ObjectToTest.cidade);
            cidade.codeImport = index;
            cidade.population = index === 7 ? 10 : 0;
            await crud.insert(Cidade, cidade).execute().toPromise();
        }
        const query = crud.query(Cidade);
        const resultCount = await query
            .where(where => where.lessAndEqual(x => x.codeImport, countExpected / 2))
            .count(where => where.great(x => x.codeImport, countExpected / 4)).toPromise();
        await crud.delete(Cidade).execute().toPromise();
        expect(resultCount).to.equal(1);
    });

    it("count with where and with query filter", async () => {
        const countExpected = 20;
        for (let index = 1; index <= countExpected; index++) {
            const cidade = Object.assign({}, ObjectToTest.cidade);
            cidade.codeImport = index;
            cidade.population = index % 2 === 0 ? 10 : 0;
            await crud.insert(Cidade, cidade).execute().toPromise();
        }
        const query = crud.query(Cidade);
        const resultCount = await query.count(where => where.lessAndEqual(x => x.codeImport, countExpected / 2)).toPromise();
        await crud.delete(Cidade).execute().toPromise();
        expect(resultCount).to.equal(countExpected / 4);
    });

});
