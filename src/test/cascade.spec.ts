import { Ddl } from "./../ddl/ddl";
import { expect } from "chai";
import { getMapper } from "./mappers-table-new";
import { Crud, JoinType } from "../crud";
import { HeaderSimple } from "./models/header-simple";
import { SQLiteDatabase } from "./database/sqlite-database";
import { RefToHeaderSimple } from "./models/ref-to-header-simple";
import { RowResult } from "../core/row-result";
import { ReplacementParam } from "../core/replacement-param";

describe("Cascade", () => {
    let crud: Crud;
    let ddl: Ddl;

    beforeEach(async () => {
        const mapper = getMapper();

        const database = await new SQLiteDatabase().init();
        crud = new Crud({ database, getMapper: mapper, enableLog: false });
        ddl = new Ddl({ database, getMapper: mapper, enableLog: false });
    });

    it("Insert Cascade", () => {
        const headerSimple2 = {
            descricao: "Header 2",
            items: ["123", "456", "789", "10a"]
        } as HeaderSimple;

        const insertCompiled = crud.insert(HeaderSimple, { modelToSave: headerSimple2 })
            .columns(x => x.set(x => x.descricao)).compile();
        expect(insertCompiled.length).to.equal(5);
        expect(insertCompiled[0].params.toString()).to.equal([
            headerSimple2.descricao
        ].toString());
        expect(insertCompiled[1].params.toString()).to.equal([
            0,
            headerSimple2.items[0],
            new ReplacementParam("0", "insertId")
        ].toString());
        expect(insertCompiled[0].query).to.equal("INSERT INTO HeaderSimple (descricao) VALUES (?)");
        expect(insertCompiled[1].query).to.equal("INSERT INTO ItemHeaderSimple (indexArray, value, HeaderSimple_id) VALUES (?, ?, ?)");
    });

    it("Update Cascade", () => {
        const headerSimple2 = {
            id: 123,
            descricao: "Editado",
            items: ["123", "adadad", "789", "10a"]
        } as HeaderSimple;

        const updateCompiled = crud.update(HeaderSimple, { modelToSave: headerSimple2 })
            .where(where => {
                where.equal(x => x.id, headerSimple2.id);
            }).compile();
        expect(updateCompiled.length).to.equal(6);
        expect(updateCompiled[0].params[0]).to.equal(headerSimple2.descricao);
        expect(updateCompiled[0].params.toString()).to.equal([
            headerSimple2.descricao,
            headerSimple2.id
        ].toString());
        expect(updateCompiled[1].params.toString()).to.equal([
            headerSimple2.id
        ].toString());
        expect(updateCompiled[2].params.toString()).to.equal([
            0,
            headerSimple2.items[0],
            headerSimple2.id
        ].toString());
        expect(updateCompiled[0].query).to.equal("UPDATE HeaderSimple SET descricao = ? WHERE id = ?");
        expect(updateCompiled[1].query).to.equal("DELETE FROM ItemHeaderSimple WHERE HeaderSimple_id = ?");
        expect(updateCompiled[2].query).to.equal("INSERT INTO ItemHeaderSimple (indexArray, value, HeaderSimple_id) VALUES (?, ?, ?)");
    });

    // #1800
    it("cascade in left outer join", async () => {
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

        const insertResult = await crud.insert(HeaderSimple, { modelToSave: refToHeaderSimple.headerSimple }).execute().toPromise();
        expect(insertResult.length).to.equal(refToHeaderSimple.headerSimple.items.length + 1);
        expect(insertResult[0].rowsAffected).to.equal(1);
        refToHeaderSimple.headerSimple.items.forEach((value, index) => {
            expect(insertResult[index + 1].rowsAffected).to.equal(1);
        });

        const insertRefResult = await crud.insert(RefToHeaderSimple, { modelToSave: refToHeaderSimple }).execute().toPromise();
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