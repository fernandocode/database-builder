import { expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import { Crud } from "../crud/crud";
import { getMapper } from "./mappers-table-new";
import { TestClazzRef } from "./models/test-clazz-ref";
import { Cidade } from "./models/cidade";
import { Uf } from "./models/uf";
import { SQLiteDatabase } from "./database/sqlite-database";
import { Ddl } from "../ddl/ddl";
import { async } from "rxjs/internal/scheduler/async";

describe("Compile", () => {
    let crud: Crud;
    let ddl: Ddl;

    beforeEach(async () => {
        const mapper = getMapper();

        const database = await new SQLiteDatabase().init();
        crud = new Crud(database, mapper, false);
        ddl = new Ddl(database, mapper, false);

        await ddl.create(Cidade).execute().toPromise();
        await ddl.create(Uf).execute().toPromise();
    });

    afterEach(async () => {
        await ddl.drop(Cidade).execute().toPromise();
        await ddl.drop(Uf).execute().toPromise();
    });

    // const crud = new Crud({} as any, getMapper());

    const createQueryTestClazzForTest = () => crud.query(TestClazz).select(x => x.internalKey);
    const createQueryCidadeForTest = () => crud.query(Cidade).select(x => x.nome);

    it("simple", () => {
        const query = createQueryTestClazzForTest();
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey FROM TestClazz AS tes");
    });

    it("simple with parameter", () => {
        const query = createQueryTestClazzForTest();
        query.where(where => where.equal(x => x.numero, 13));
        const result = query.compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(13);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey FROM TestClazz AS tes WHERE tes.numero = ?");
    });

    it("simple with join and parameter", () => {
        const query = createQueryTestClazzForTest();
        query.where(where => where.equal(x => x.numero, 13));
        query.join(TestClazzRef,
            on => on.equal(x => x.id, query.ref(x => x.referenceTest.id)),
            join => {
                join.select(x => x.description);
                join.where(where => where.equal(x => x.id, 144));
            });
        const result = query.compile();
        expect(result[0].params.length).to.equal(2);
        expect(result[0].params[0]).to.equal(13);
        expect(result[0].params[1]).to.equal(144);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes0.description AS tes0_description FROM TestClazz AS tes LEFT JOIN TestClazzRef AS tes0 ON (tes0.id = tes.referenceTest_id) WHERE tes.numero = ? AND tes0.id = ?");
    });

    it("simple with join, parameter and where default", () => {
        const query = createQueryCidadeForTest();
        query.where(where => where.less(x => x.population, 20));
        query.join(Uf,
            on => on.equal(x => x.codeImport, query.ref(x => x.uf.codeImport)),
            join => {
                join.select(x => x.nome);
                join.where(where => where.greatAndEqual(x => x.population, 200));
            });
        const result = query.compile();
        expect(result[0].params.length).to.equal(3);
        expect(result[0].params[0]).to.equal(20);
        expect(result[0].params[1]).to.equal(200);
        expect(result[0].params[2]).to.equal(0);
        expect(result[0].query).to.equal("SELECT cid.nome AS nome, uf.nome AS uf_nome FROM Cidade AS cid LEFT JOIN Uf AS uf ON (uf.codeImport = cid.uf_codeImport) WHERE cid.population < ? AND uf.population >= ? AND (cid.population > ?)");
    });

    it("multi", () => {
        const query = createQueryTestClazzForTest();
        const result1 = query.compile();
        expect(result1[0].params.length).to.equal(0);
        expect(result1[0].query).to.equal("SELECT tes.internalKey AS internalKey FROM TestClazz AS tes");
        const result2 = query.compile();
        expect(result2[0].params.length).to.equal(0);
        expect(result2[0].query).to.equal("SELECT tes.internalKey AS internalKey FROM TestClazz AS tes");
    });

    it("multi with parameter", () => {
        const query = createQueryTestClazzForTest();
        query.where(where => where.equal(x => x.numero, 13));
        const result1 = query.compile();
        expect(result1[0].params.length).to.equal(1);
        expect(result1[0].params[0]).to.equal(13);
        expect(result1[0].query).to.equal("SELECT tes.internalKey AS internalKey FROM TestClazz AS tes WHERE tes.numero = ?");
        const result2 = query.compile();
        expect(result2[0].params.length).to.equal(1);
        expect(result2[0].params[0]).to.equal(13);
        expect(result2[0].query).to.equal("SELECT tes.internalKey AS internalKey FROM TestClazz AS tes WHERE tes.numero = ?");
    });

    it("multi with join and parameter", () => {
        const query = createQueryTestClazzForTest();
        query.where(where => where.equal(x => x.numero, 13));
        query.join(TestClazzRef,
            on => on.equal(x => x.id, query.ref(x => x.referenceTest.id)),
            join => {
                join.select(x => x.description);
                join.where(where => where.equal(x => x.id, 144));
            });
        const result1 = query.compile();
        expect(result1[0].params.length).to.equal(2);
        expect(result1[0].params[0]).to.equal(13);
        expect(result1[0].params[1]).to.equal(144);
        expect(result1[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes0.description AS tes0_description FROM TestClazz AS tes LEFT JOIN TestClazzRef AS tes0 ON (tes0.id = tes.referenceTest_id) WHERE tes.numero = ? AND tes0.id = ?");

        const result2 = query.compile();
        expect(result2[0].params.length).to.equal(2);
        expect(result2[0].params[0]).to.equal(13);
        expect(result2[0].params[1]).to.equal(144);
        expect(result2[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes0.description AS tes0_description FROM TestClazz AS tes LEFT JOIN TestClazzRef AS tes0 ON (tes0.id = tes.referenceTest_id) WHERE tes.numero = ? AND tes0.id = ?");
    });

    it("multi with join, parameter and where default", async () => {
        const query = createQueryCidadeForTest();
        query.where(where => where.less(x => x.population, 20));
        query.join(Uf,
            on => on.equal(x => x.codeImport, query.ref(x => x.uf.codeImport)),
            join => {
                join.enableQueryFilters();
                join.select(x => x.nome);
                join.where(where => where.greatAndEqual(x => x.population, 200));
            });
        const result1 = query.compile();
        expect(result1[0].params.length).to.equal(3);
        expect(result1[0].params[0]).to.equal(20);
        expect(result1[0].params[1]).to.equal(200);
        expect(result1[0].params[2]).to.equal(0);
        expect(result1[0].query).to.equal("SELECT cid.nome AS nome, uf.nome AS uf_nome FROM Cidade AS cid LEFT JOIN Uf AS uf ON (uf.codeImport = cid.uf_codeImport) WHERE cid.population < ? AND uf.population >= ? AND (cid.population > ?)");

        // const resultExecute = await query.toList().toPromise();
        // console.log(resultExecute);
        const result2 = query.compile();
        expect(result2[0].params.length).to.equal(3);
        expect(result2[0].params[0]).to.equal(20);
        expect(result2[0].params[1]).to.equal(200);
        expect(result2[0].params[2]).to.equal(0);
        expect(result2[0].query).to.equal("SELECT cid.nome AS nome, uf.nome AS uf_nome FROM Cidade AS cid LEFT JOIN Uf AS uf ON (uf.codeImport = cid.uf_codeImport) WHERE cid.population < ? AND uf.population >= ? AND (cid.population > ?)");
    });

});
