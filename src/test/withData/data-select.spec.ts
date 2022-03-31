import { Ddl } from "../../ddl/ddl";
import { expect } from "chai";
import { Cidade } from "../models/cidade";
import { getMapper } from "../mappers-table-new";
import { Uf } from "../models/uf";
import { SQLiteDatabase } from "../database/sqlite-database";
import { Regiao } from "../models/regiao";
import { SubRegiao } from "../models/sub-regiao";
import { Cliente } from "../models/cliente";
import { lastValueFrom } from "rxjs";
import { Crud } from "../../crud";

describe("DataSelect", () => {
    let crud: Crud;
    let ddl: Ddl;

    beforeEach(async () => {
        const mapper = getMapper();

        const database = await new SQLiteDatabase().init();
        crud = new Crud({ sqliteLimitVariables: 10000 }, { database, getMapper: mapper, enableLog: false });
        ddl = new Ddl({ database, getMapper: mapper, enableLog: false });

        await lastValueFrom(ddl.create(Cliente).execute());
        await lastValueFrom(ddl.create(Cidade).execute());
        await lastValueFrom(ddl.create(Uf).execute());
        await lastValueFrom(ddl.create(SubRegiao).execute());
        await lastValueFrom(ddl.create(Regiao).execute());
    });

    it("select toSingle", async () => {
        const cidade = { nome: "Petrolina", codeImport: 123, population: 735646, subRegiao: { codeImport: 234 }, uf: { codeImport: "AC" } } as Cidade;
        const insert = crud.insert(Cidade, {
            toSave: cidade
        });
        const insertedResult = await lastValueFrom(insert.execute());
        expect(insertedResult[0].rowsAffected).to.equal(1);

        const resultCidadeNome = await lastValueFrom(crud.query(Cidade)
            .select(x => x.nome)
            .toSingle()
        );
        expect(resultCidadeNome).to.not.null;
        expect(resultCidadeNome).to.equal(cidade.nome);
    });

    it("select mapper single", async () => {
        const cidade = { nome: "Petrolina", codeImport: 123, population: 735646, subRegiao: { codeImport: 234 }, uf: { codeImport: "AC" } } as Cidade;
        const insert = crud.insert(Cidade, {
            toSave: cidade
        });
        const insertedResult = await lastValueFrom(insert.execute());
        expect(insertedResult[0].rowsAffected).to.equal(1);

        const resultCidadeNome = await lastValueFrom(crud.query(Cidade)
            .select(x => x.nome)
            .mapper<string>(r => r.single<string>())
        );
        expect(resultCidadeNome).to.length(1);
        expect(resultCidadeNome[0]).to.equal(cidade.nome);
    });

    it("select toSingleList", async () => {
        const cidade = { nome: "Petrolina", codeImport: 123, population: 735646, subRegiao: { codeImport: 234 }, uf: { codeImport: "AC" } } as Cidade;
        const insert = crud.insert(Cidade, {
            toSave: cidade
        });
        const insertedResult = await lastValueFrom(insert.execute());
        expect(insertedResult[0].rowsAffected).to.equal(1);

        const resultCidadeNome = await lastValueFrom(crud.query(Cidade)
            .select(x => x.nome)
            .toSingleList()
        );
        expect(resultCidadeNome).to.length(1);
        expect(resultCidadeNome[0]).to.equal(cidade.nome);
    });
});
