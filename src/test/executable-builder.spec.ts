import { ExecutableBuilder, QueryCompiled } from "../core";
import { expect } from "chai";
import { SQLiteDatabase } from "./database/sqlite-database";
import { DatabaseObject } from "../definitions";

describe("ExecutableBuilder", () => {

    let database: DatabaseObject;

    beforeEach(async () => {
        database = await new SQLiteDatabase().init();
        console.log("database", database);
    });

    it("build sql batch", () => {

        const execute = new ExecutableBuilder(true);
        const compiled = [
            {
                query: "DROP TABLE IF EXISTS MyTable",
                params: []
            } as QueryCompiled,
            {
                query: "CREATE TABLE MyTable (SampleColumn)",
                params: []
            } as QueryCompiled,
            {
                query: "INSERT INTO MyTable VALUES (?)",
                params: [2]
            } as QueryCompiled,
            {
                query: "teste ?",
                params: [1]
            } as QueryCompiled,
            {
                query: "INSERT INTO MyTable VALUES (?, ?)",
                params: [1, "dgghde dg"]
            } as QueryCompiled
        ];
        const result = (execute as any).buildSqlBatch(compiled);
        expect(result.length).to.equal(compiled.length);
        expect(result[0]).to.equal(compiled[0].query);
        expect(result[1]).to.equal(compiled[1].query);
        expect(result[2].length).to.equal(2);
        expect(result[2][0]).to.equal(compiled[2].query);
        expect(result[2][1].toString()).to.equal(compiled[2].params.toString());
        expect(result[3].length).to.equal(2);
        expect(result[3][0]).to.equal(compiled[3].query);
        expect(result[3][1].toString()).to.equal(compiled[3].params.toString());
        expect(result[4].length).to.equal(2);
        expect(result[4][0]).to.equal(compiled[4].query);
        expect(result[4][1].toString()).to.equal(compiled[4].params.toString());
    });

    it("executeBatch", async () => {
        const execute = new ExecutableBuilder(true);
        const compiled = [
            {
                query: "DROP TABLE IF EXISTS MyTable",
                params: []
            } as QueryCompiled,
            {
                query: "CREATE TABLE MyTable (Id, Name)",
                params: []
            } as QueryCompiled,
            {
                query: "INSERT INTO MyTable VALUES (?, ?)",
                params: [2, "Test"]
            } as QueryCompiled
        ];
        const result = await execute.executeBatch(compiled, database).toPromise();
        console.log("result", result.length, result);
        console.log("equal", result.length, compiled.length);
        expect(result.length).to.equal(compiled.length);
        expect(result[2].rowsAffected).to.equal(1);
        expect(result[2].insertId).to.equal(1);
    });

});
