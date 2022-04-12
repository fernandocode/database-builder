import { Ddl } from "./../ddl/ddl";
import { expect } from "chai";
import { getMapper } from "./mappers-table-new";
import { Crud, JoinType } from "../crud";
import { HeaderSimple } from "./models/header-simple";
import { SQLiteDatabase } from "./database/sqlite-database";
import { RefToHeaderSimple } from "./models/ref-to-header-simple";
import { RowResult } from "../core/row-result";
import { ReplacementParam } from "../core/replacement-param";
import { firstValueFrom } from "rxjs";

describe("Cascade", () => {
    let crud: Crud;
    let ddl: Ddl;

    beforeEach(async () => {
        const mapper = getMapper();

        const database = await new SQLiteDatabase().init();
        crud = new Crud({ sqliteLimitVariables: 10000 }, { database, getMapper: mapper, enableLog: false });
        ddl = new Ddl({ database, getMapper: mapper, enableLog: false });
    });

    it("Insert Cascade optimized", () => {
        const headerSimple2 = {
            descricao: "Header 2",
            items: ["123", "456", "789", "10a"]
        } as HeaderSimple;

        const insertCompiled = crud.insert(HeaderSimple, { toSave: headerSimple2 }).compile();
        expect(insertCompiled.length).to.equal(2);
        expect(JSON.stringify(insertCompiled[0].params)).to.equal(JSON.stringify([
            headerSimple2.descricao
        ]));
        expect(JSON.stringify(insertCompiled[1].params)).to.equal(JSON.stringify([
            0,
            headerSimple2.items[0],
            new ReplacementParam("0", "insertId"),
            1,
            headerSimple2.items[1],
            new ReplacementParam("0", "insertId"),
            2,
            headerSimple2.items[2],
            new ReplacementParam("0", "insertId"),
            3,
            headerSimple2.items[3],
            new ReplacementParam("0", "insertId")
        ]));
        expect(insertCompiled[0].query).to.equal("INSERT INTO HeaderSimple (descricao) VALUES (?)");
        expect(insertCompiled[1].query).to.equal("INSERT INTO ItemHeaderSimple (indexArray, value, HeaderSimple_id) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?)");
    });

    it("Insert Cascade optimized items empty", () => {
        const headerSimple2 = {
            descricao: "Header 2",
            items: []
        } as HeaderSimple;

        const insertCompiled = crud.insert(HeaderSimple, { toSave: headerSimple2 }).compile();

        expect(insertCompiled.length).to.equal(1);
        expect(JSON.stringify(insertCompiled[0].params)).to.equal(JSON.stringify([
            headerSimple2.descricao
        ]));
        expect(insertCompiled[0].query).to.equal("INSERT INTO HeaderSimple (descricao) VALUES (?)");
    });

    it("Insert Cascade optimized header in batch", () => {
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
            },
            {
                descricao: "Header 4",
                items: []
            }
        ] as Array<HeaderSimple>;

        const insertCompiled = crud.insert(HeaderSimple, { toSave: toInsert }).compile();

        expect(insertCompiled.length).to.equal(2);
        expect(insertCompiled[0].query).to.equal("INSERT INTO HeaderSimple (descricao) VALUES (?), (?), (?), (?)");
        expect(insertCompiled[0].params.join("|")).to.equal(toInsert.map(x => x.descricao).join("|"));
        
        expect(insertCompiled[1].query).to.equal("INSERT INTO ItemHeaderSimple (indexArray, value, HeaderSimple_id) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?)");
        expect(insertCompiled[1].params[0]).to.equal(0);
        expect(insertCompiled[1].params[1]).to.equal(toInsert[0].items[0]);
        expect((insertCompiled[1].params[2] as ReplacementParam).properties.join("|")).to.equal(["0", "insertId"].join("|"));
        expect(insertCompiled[1].params[3]).to.equal(1);
        expect(insertCompiled[1].params[4]).to.equal(toInsert[0].items[1]);
        expect((insertCompiled[1].params[5] as ReplacementParam).properties.join("|")).to.equal(["0", "insertId"].join("|"));

        expect(insertCompiled[1].params[6]).to.equal(0);
        expect(insertCompiled[1].params[7]).to.equal(toInsert[1].items[0]);
        expect((insertCompiled[1].params[8] as ReplacementParam).properties.join("|")).to.equal(["1", "insertId"].join("|"));
        expect(insertCompiled[1].params[9]).to.equal(1);
        expect(insertCompiled[1].params[10]).to.equal(toInsert[1].items[1]);
        expect((insertCompiled[1].params[11] as ReplacementParam).properties.join("|")).to.equal(["1", "insertId"].join("|"));
        expect(insertCompiled[1].params[12]).to.equal(2);
        expect(insertCompiled[1].params[13]).to.equal(toInsert[1].items[2]);
        expect((insertCompiled[1].params[14] as ReplacementParam).properties.join("|")).to.equal(["1", "insertId"].join("|"));

        expect(insertCompiled[1].params[15]).to.equal(0);
        expect(insertCompiled[1].params[16]).to.equal(toInsert[2].items[0]);
        expect((insertCompiled[1].params[17] as ReplacementParam).properties.join("|")).to.equal(["2", "insertId"].join("|"));
        expect(insertCompiled[1].params[18]).to.equal(1);
        expect(insertCompiled[1].params[19]).to.equal(toInsert[2].items[1]);
        expect((insertCompiled[1].params[20] as ReplacementParam).properties.join("|")).to.equal(["2", "insertId"].join("|"));
    });

    it("Insert Cascade set columns (ignore cascade)", () => {
        const headerSimple2 = {
            descricao: "Header 2",
            items: ["123", "456", "789", "10a"]
        } as HeaderSimple;

        const insertCommand = crud.insert(HeaderSimple, { toSave: headerSimple2 })
            .columns(column => column.set(x => x.descricao));
        const insertCompiled = insertCommand.compile();
        expect(insertCompiled.length).to.equal(1);
        expect(JSON.stringify(insertCompiled[0].params)).to.equal(JSON.stringify([
            headerSimple2.descricao
        ]));
        expect(insertCompiled[0].query).to.equal("INSERT INTO HeaderSimple (descricao) VALUES (?)");
    });

    it("Update Cascade optimized", () => {
        const headerSimple2 = {
            id: 123,
            descricao: "Editado",
            items: ["123", "adadad", "789", "10a"]
        } as HeaderSimple;

        const updateCompiled = crud.update(HeaderSimple, { toSave: headerSimple2 })
            .where(where => {
                where.equal(x => x.id, headerSimple2.id);
            }).compile();
        expect(updateCompiled.length).to.equal(3);
        expect(updateCompiled[0].params[0]).to.equal(headerSimple2.descricao);
        expect(JSON.stringify(updateCompiled[0].params)).to.equal(JSON.stringify([
            headerSimple2.descricao,
            headerSimple2.id
        ]));
        expect(JSON.stringify(updateCompiled[1].params)).to.equal(JSON.stringify([
            headerSimple2.id
        ]));
        expect(JSON.stringify(updateCompiled[2].params)).to.equal(JSON.stringify([
            0,
            headerSimple2.items[0],
            headerSimple2.id,
            1,
            headerSimple2.items[1],
            headerSimple2.id,
            2,
            headerSimple2.items[2],
            headerSimple2.id,
            3,
            headerSimple2.items[3],
            headerSimple2.id
        ]));
        expect(updateCompiled[0].query).to.equal("UPDATE HeaderSimple SET descricao = ? WHERE id = ?");
        expect(updateCompiled[1].query).to.equal("DELETE FROM ItemHeaderSimple WHERE HeaderSimple_id = ?");
        expect(updateCompiled[2].query).to.equal("INSERT INTO ItemHeaderSimple (indexArray, value, HeaderSimple_id) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?)");
    });

    it("Update Cascade set columns (ignore cascade)", () => {
        const headerSimple2 = {
            id: 123,
            descricao: "Editado",
            items: ["123", "adadad", "789", "10a"]
        } as HeaderSimple;

        const updateCompiled = crud.update(HeaderSimple, { toSave: headerSimple2 })
            .columns(column => column.set(x => x.descricao))
            .where(where => {
                where.equal(x => x.id, headerSimple2.id);
            }).compile();
        expect(updateCompiled.length).to.equal(1);
        expect(JSON.stringify(updateCompiled[0].params)).to.equal(JSON.stringify([
            headerSimple2.descricao,
            headerSimple2.id
        ]));
        expect(updateCompiled[0].query).to.equal("UPDATE HeaderSimple SET descricao = ? WHERE id = ?");
    });

    it("Cascade execute with result", async () => {
        try {
            const createResult = await firstValueFrom(ddl.create(HeaderSimple).execute());
            expect(createResult.length).to.equal(2);

            const headerSimple = {
                descricao: "Exemplo",
                items: ["jão", "juca", "zé"]
            } as HeaderSimple;

            const insertResult = await firstValueFrom(crud.insert(HeaderSimple, { toSave: headerSimple }).execute());
            expect(insertResult.length).to.equal(2);
            expect(insertResult[0].rowsAffected).to.equal(1);
            expect(insertResult[0].insertId).to.equal(1);
            expect(insertResult[1].rowsAffected).to.equal(headerSimple.items.length);
            expect(insertResult[1].insertId).to.equal(headerSimple.items.length);
        } finally {
            const dropResult = await ddl.drop(HeaderSimple).execute().toPromise();
            expect(dropResult.length).to.equal(2);
        }
    });

    // #1800
    it("Cascade in left outer join", async () => {
        const createRefResult = await ddl.create(RefToHeaderSimple).execute().toPromise();
        expect(createRefResult.length).to.equal(1);
        const createResult = await ddl.create(HeaderSimple).execute().toPromise();
        expect(createResult.length).to.equal(2);

        const refToHeaderSimple = {
            headerSimple: {
                descricao: "Exemplo",
                items: ["jão", "juca", "zé"]
            } as HeaderSimple
        } as RefToHeaderSimple;

        const insertResult = await crud.insert(HeaderSimple, { toSave: refToHeaderSimple.headerSimple }).execute().toPromise();
        expect(insertResult.length).to.equal(2);
        expect(insertResult[0].rowsAffected).to.equal(1);
        expect(insertResult[1].rowsAffected).to.equal(refToHeaderSimple.headerSimple.items.length);

        const insertRefResult = await crud.insert(RefToHeaderSimple, { toSave: refToHeaderSimple }).execute().toPromise();
        expect(insertRefResult.length).to.equal(1);

        const query = crud.query(RefToHeaderSimple);
        query
            .join(HeaderSimple,
                on => on.equal(x => x.id, query.ref(x => x.headerSimple.id)),
                join => join.projection(p => p.all()), JoinType.LEFT)
            // TODO: #1802 - fazer implementação de possibilidade de realizar Fetch em relações, isso ira criar associação com as tabelas e buscas os dados relacionados, verificar como funciona no NHibernate QueryOver
            // .fetch(x => x.items)
            ;
        const selectResult = await query
            .projection(p => p.all())
            .mapper((row: RowResult<RefToHeaderSimple>) => {
                return row
                    .map()
                    .map(HeaderSimple, x => x.headerSimple)
                    .result();
            })
            .toPromise();

        expect(selectResult.length).to.equal(1);
        expect(selectResult[0].id).to.equal(refToHeaderSimple.id);
        expect(selectResult[0].headerSimple.id).to.equal(refToHeaderSimple.headerSimple.id);
        expect(selectResult[0].headerSimple.descricao).to.equal(refToHeaderSimple.headerSimple.descricao);

        // TODO: quando houver a possibilidade de fetch deve retornar os items do headerSimple
        // expect(selectResult[0].headerSimple.items.length).to.equal(refToHeaderSimple.headerSimple.items.length);
        // refToHeaderSimple.headerSimple.items.forEach((value, index) => {
        //     expect(selectResult[0].headerSimple.items[index]).to.equal(value);
        // });

        const dropRefResult = await ddl.drop(RefToHeaderSimple).execute().toPromise();
        expect(dropRefResult.length).to.equal(1);
        const dropResult = await ddl.drop(HeaderSimple).execute().toPromise();
        expect(dropResult.length).to.equal(2);
    });
});