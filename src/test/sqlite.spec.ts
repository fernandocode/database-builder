import { Marca } from "./models/marca";
import { ContasAReceber } from "./models/contas-a-receber";
import { Ddl } from "./../ddl/ddl";
import { expect } from "chai";
import { Cidade } from "./models/cidade";
import { ObjectToTest } from "./objeto-to-test";
import { getMapper } from "./mappers-table-new";
import { Crud, JoinType } from "../crud";
import { GuidClazz } from "./models/guid-clazz";
import { Uf } from "./models/uf";
import { HeaderSimple } from "./models/header-simple";
import { Referencia } from "./models/referencia";
import { Imagem } from "./models/imagem";
import { SQLiteDatabase } from "./database/sqlite-database";
import { Regiao } from "./models/regiao";
import { SubRegiao } from "./models/sub-regiao";
import { JoinQueryBuilder } from "../crud/query/join-query-builder";
import { ModeloDetalheProduto } from "./models/modelo-detalhe-produto";

describe("SQLite", async () => {
    const mapper = getMapper();

    const database = await new SQLiteDatabase().init();
    const crud = new Crud(database, mapper, false);
    const ddl = new Ddl(database, mapper, false);

    const insertUf = async () => {
        await ddl.create(Uf).execute().toPromise();
        const itemExist = await crud.query(Uf)
            .where(w => w.equal(x => x.codeImport, ObjectToTest.uf.codeImport))
            .firstOrDefault().toPromise();
        if (!itemExist) {
            const insert = crud.insert(Uf, ObjectToTest.uf);
            const insertedResult = await insert.execute().toPromise();
            expect(insertedResult[0].rowsAffected).to.equal(1);
        }
    };

    const insertSubRegiao = async () => {
        await ddl.create(SubRegiao).execute().toPromise();
        const itemExist = await crud.query(SubRegiao)
            .where(w => w.equal(x => x.codeImport, ObjectToTest.subRegiao.codeImport))
            .firstOrDefault().toPromise();
        if (!itemExist) {
            const insert = crud.insert(SubRegiao, ObjectToTest.subRegiao);
            const insertedResult = await insert.execute().toPromise();
            expect(insertedResult[0].rowsAffected).to.equal(1);
        }
    };

    const insertRegiao = async () => {
        await ddl.create(Regiao).execute().toPromise();
        const itemExist = await crud.query(Regiao)
            .where(w => w.equal(x => x.codeImport, ObjectToTest.regiao.codeImport))
            .firstOrDefault().toPromise();
        if (!itemExist) {
            const insert = crud.insert(Regiao, ObjectToTest.regiao);
            const insertedResult = await insert.execute().toPromise();
            expect(insertedResult[0].rowsAffected).to.equal(1);
        }
    };

    it("GuidClazz", async () => {

        await ddl.create(GuidClazz).execute().toPromise();

        const insertResult = await crud.insert(GuidClazz, ObjectToTest.guidClazz).execute().toPromise();
        expect(insertResult[0].rowsAffected).to.equal(1);

        const queryInsertResult = await crud.query(GuidClazz).toList().toPromise();
        expect(queryInsertResult.length).to.equal(1);
        expect(queryInsertResult[0].description).to.equal(ObjectToTest.guidClazz.description);
        expect(queryInsertResult[0].guid).to.equal(ObjectToTest.guidClazz.guid);

        const modelUpdate = {
            guid: "abc",
            description: "Teste Update"
        } as GuidClazz;
        const updateResult = await crud.update(GuidClazz, modelUpdate)
            .where(where => where.equal(x => x.guid, ObjectToTest.guidClazz.guid))
            .execute().toPromise();
        expect(updateResult[0].rowsAffected).to.equal(1);

        const queryUpdateResult = await crud.query(GuidClazz).toList().toPromise();
        expect(queryUpdateResult.length).to.equal(1);
        expect(queryUpdateResult[0].description).to.equal(modelUpdate.description);
        expect(queryUpdateResult[0].guid).to.equal(ObjectToTest.guidClazz.guid);

        const modelUpdateByDescription = new GuidClazz(void 0, "Teste teste test");
        const updateByDescriptionResult = await crud.update(GuidClazz, modelUpdateByDescription)
            .where(where => where.equal(x => x.description, modelUpdate.description))
            .execute().toPromise();
        expect(updateByDescriptionResult[0].rowsAffected).to.equal(1);
        expect(modelUpdateByDescription.guid).to.equal(void 0);
    });

    it("Cidade", async () => {

        await ddl.create(Cidade).execute().toPromise();
        await ddl.create(Uf).execute().toPromise();

        const insertUf = await crud.insert(Uf, ObjectToTest.uf).execute().toPromise();
        expect(insertUf[0].rowsAffected).to.equal(1);

        const insertResult1 = await crud.insert(Cidade, ObjectToTest.cidade).execute().toPromise();
        expect(insertResult1[0].rowsAffected).to.equal(1);
        const insertResult2 = await crud.insert(Cidade, {
            codeImport: 3,
            nome: "São João Batisa",
            uf: ObjectToTest.uf,
            subRegiao: ObjectToTest.subRegiao,
        } as Cidade).execute().toPromise();
        expect(insertResult2[0].rowsAffected).to.equal(1);

        // Caso de referencia nula test1
        const insertSaoPaulo = await crud.insert(Cidade, {
            codeImport: 4,
            nome: "São Paulo",
            uf: null,
            subRegiao: void 0,
        } as Cidade)
            .execute().toPromise();
        expect(insertSaoPaulo[0].rowsAffected).to.equal(1);

        const querySaoPaulo = await crud.query(Cidade)
            .where(where => where.equal(x => x.codeImport, insertSaoPaulo[0].insertId))
            .mapper<Cidade>(map => map.map().result()).toPromise();
        expect(querySaoPaulo.length).to.equal(1);
        expect(querySaoPaulo[0].subRegiao).to.equal(null);
        expect(querySaoPaulo[0].uf).to.equal(null);

        // Caso de referencia nula test2
        const insertNovaTrento = await crud.insert(Cidade, {
            codeImport: 5,
            nome: "Nova Trento",
            uf: ObjectToTest.uf,
            subRegiao: void 0,
        } as Cidade)
            .execute().toPromise();
        expect(insertNovaTrento[0].rowsAffected).to.equal(1);

        const queryNovaTrento = crud.query(Cidade);
        queryNovaTrento
            .join(Uf, where => where.equal(x => x.codeImport, queryNovaTrento.ref(x => x.uf.codeImport)), join => { join.projection(p => p.all()) })
            .where(where => where.equal(x => x.codeImport, insertNovaTrento[0].insertId))
            .projection(p => p.all());
        const resultNovaTrento = await queryNovaTrento.mapper<Cidade>(map => map.map()
        .map(Uf, x => x.uf)
        .result()).toPromise();
        expect(resultNovaTrento.length).to.equal(1);
        expect(resultNovaTrento[0].subRegiao).to.equal(null);
        expect(resultNovaTrento[0].uf.codeImport).to.equal("SC");
        expect(resultNovaTrento[0].uf.nome).to.equal(ObjectToTest.uf.nome);
        expect(resultNovaTrento[0].uf.population).to.equal(ObjectToTest.uf.population);

        const queryResult = await crud.query(Cidade)
            .where(where => where.equal(x => x.uf.codeImport, ObjectToTest.uf.codeImport))
            .toList().toPromise();
        expect(queryResult.length).to.equal(3);
        for (const itemResult of queryResult) {
            expect(itemResult.uf.codeImport).to.equal(ObjectToTest.uf.codeImport);
        }
        expect(queryResult[0].codeImport).to.equal(ObjectToTest.cidade.codeImport);

        const model4 = {
            codeImport: 99,
            nome: undefined,
            uf: ObjectToTest.uf,
            subRegiao: ObjectToTest.subRegiao,
        } as Cidade;
        const insert = crud.insert(Cidade, model4);
        const insertResult4 = await insert.execute().toPromise();
        expect(insertResult4[0].rowsAffected).to.equal(1);

        const queryResult4 = await crud.query(Cidade)
            .where(where => where.equal(x => x.codeImport, model4.codeImport))
            .firstOrDefault().toPromise();
        const queryResultNull = await crud.query(Cidade)
            .where(where => where.isNull(x => x.nome))
            .toList().toPromise();

        expect(queryResult4.nome).to.equal(null);
        expect(queryResultNull.length).to.equal(1);
    });

    it("Cidade read reference without join", async () => {

        await insertUf();

        await insertSubRegiao();

        await insertRegiao();

        const model = {
            codeImport: 120,
            nome: "Teste 120",
            population: 12,
            uf: ObjectToTest.uf,
            subRegiao: ObjectToTest.subRegiao,
        } as Cidade;

        const insert = crud.insert(Cidade, model);
        const insertResult4 = await insert.execute().toPromise();
        expect(insertResult4[0].rowsAffected).to.equal(1);

        const query = await crud.query(Cidade)
            .projection(p => p.all())
            .where(where => where.equal(x => x.codeImport, model.codeImport));
        let joinSubRegiao: JoinQueryBuilder<SubRegiao>;
        query.join(
            SubRegiao,
            on => on.equal(x => x.codeImport, query.ref(x => x.subRegiao.codeImport)),
            join => {
                join.projection(projection => {
                    projection.add(x => x.nome);
                });
                joinSubRegiao = join;
            }
        );
        query.join(
            Regiao,
            on => on.equal(x => x.codeImport, joinSubRegiao.ref(x => x.regiao.codeImport)),
            join => {
                join.projection(projection => {
                    projection.all();
                });
            }
        );
        const queryResult = await query.mapper<Cidade>(row => {
            const result = row
                .map()
                .map(Uf, x => x.uf, "uf")
                .map(SubRegiao, x => x.subRegiao)
                .map(Regiao, x => x.subRegiao.regiao)
                .result();
            return result;
        }).toPromise();
        expect(queryResult.length).to.equal(1);
        expect(queryResult[0].codeImport).to.equal(model.codeImport);
        expect(queryResult[0].nome).to.equal(model.nome);
        expect(queryResult[0].population).to.equal(model.population);
        expect(queryResult[0].uf.codeImport).to.equal(model.uf.codeImport);
        expect(queryResult[0].subRegiao.codeImport).to.equal(model.subRegiao.codeImport);
        expect(queryResult[0].subRegiao.nome).to.equal(model.subRegiao.nome);
        expect(queryResult[0].subRegiao.regiao.codeImport).to.equal(model.subRegiao.regiao.codeImport);
        expect(queryResult[0].subRegiao.regiao.nome).to.equal(model.subRegiao.regiao.nome);
    });

    it("mapper model readonly with from in other query", async () => {

        const model = {
            codeImport: 343,
            descricao: "testsnfsf"
        } as Marca;

        await ddl.create(Marca).execute().toPromise();
        const insert = crud.insert(Marca, model);
        const insertResult4 = await insert.execute().toPromise();
        expect(insertResult4[0].rowsAffected).to.equal(1);

        const queryItemEscolhaReferencia = crud
            .query(Marca)
            .projection(projection => {
                projection.add(x => x.codeImport);
            });
        const query = await crud.query(ModeloDetalheProduto, "mdtest")
            .from(
                queryItemEscolhaReferencia
            )
            .projection(projection => {
                projection.add(x => x.codeImport);
            })
            .where(where => where.equal(x => x.codeImport, model.codeImport));
        const queryResult = await query.mapper<ModeloDetalheProduto>(row => {
            const result = row
                .map()
                .result();
            return result;
        }).toPromise();
        expect(queryResult.length).to.equal(1);
        expect(queryResult[0].codeImport).to.equal(model.codeImport);
    });

    it("Cidade join to mappper", async () => {

        await insertUf();

        await insertSubRegiao();

        await insertRegiao();

        const model = {
            codeImport: 101,
            nome: "Teste 101",
            population: 10,
            uf: ObjectToTest.uf,
            subRegiao: ObjectToTest.subRegiao,
        } as Cidade;

        const insert = crud.insert(Cidade, model);
        const insertResult4 = await insert.execute().toPromise();
        expect(insertResult4[0].rowsAffected).to.equal(1);

        const query = await crud.query(Cidade)
            .projection(p => p.all())
            .where(where => where.equal(x => x.codeImport, model.codeImport));
        query.join(
            Uf,
            on => on.equal(x => x.codeImport, query.ref(x => x.uf.codeImport)),
            join => {
                join.select(x => x.nome);
                join.select(x => x.population);
            },
            JoinType.LEFT,
            "unidade_federativa"
        );
        let joinSubRegiao: JoinQueryBuilder<SubRegiao>;
        query.join(
            SubRegiao,
            on => on.equal(x => x.codeImport, query.ref(x => x.subRegiao.codeImport)),
            join => {
                join.projection(projection => {
                    projection.add(x => x.nome);
                });
                joinSubRegiao = join;
            }
        );
        query.join(
            Regiao,
            on => on.equal(x => x.codeImport, joinSubRegiao.ref(x => x.regiao.codeImport)),
            join => {
                join.projection(projection => {
                    projection.all();
                });
            }
        );
        const queryResult = await query.mapper<Cidade>(row => {
            const result = row
                .map()
                .map(Uf, x => x.uf)
                .map(SubRegiao, x => x.subRegiao)
                .map(Regiao, x => x.subRegiao.regiao)
                .result();
            return result;
        }).toPromise();
        expect(queryResult.length).to.equal(1);
        expect(queryResult[0].codeImport).to.equal(model.codeImport);
        expect(queryResult[0].nome).to.equal(model.nome);
        expect(queryResult[0].population).to.equal(model.population);
        expect(queryResult[0].uf.codeImport).to.equal(model.uf.codeImport);
        expect(queryResult[0].uf.nome).to.equal(model.uf.nome);
        expect(queryResult[0].uf.population).to.equal(model.uf.population);
        expect(queryResult[0].subRegiao.codeImport).to.equal(model.subRegiao.codeImport);
        expect(queryResult[0].subRegiao.nome).to.equal(model.subRegiao.nome);
        expect(queryResult[0].subRegiao.regiao.codeImport).to.equal(model.subRegiao.regiao.codeImport);
        expect(queryResult[0].subRegiao.regiao.nome).to.equal(model.subRegiao.regiao.nome);
    });

    it("ContasAReceber", async () => {

        await ddl.create(ContasAReceber).execute().toPromise();

        const insertResult1 = await crud.insert(ContasAReceber, ObjectToTest.contasReceber).execute().toPromise();
        expect(insertResult1[0].rowsAffected).to.equal(1);

        const queryResult = await crud.query(ContasAReceber)
            .where(where => where.equal(x => x.cliente.idErp, ObjectToTest.contasReceber.cliente.idErp))
            .toList().toPromise();

        expect(queryResult.length).to.equal(1);
        expect(queryResult[0].idErp).to.equal(ObjectToTest.contasReceber.idErp);
        expect(queryResult[0].dataRecebimento).to.equal(void 0);
        expect(queryResult[0].dataVencimento.unix()).to.equal(ObjectToTest.contasReceber.dataVencimento.unix());
    });

    it("HeaderSimple cascade", async () => {

        const createResult = await ddl.create(HeaderSimple).execute().toPromise();
        expect(createResult.length).to.equal(2);

        const insertResult1 = await crud.insert(HeaderSimple, ObjectToTest.headerSimple).execute().toPromise();
        expect(insertResult1.length).to.equal(ObjectToTest.headerSimple.items.length + 1);
        expect(insertResult1[0].rowsAffected).to.equal(1);
        ObjectToTest.headerSimple.items.forEach((value, index) => {
            expect(insertResult1[index + 1].rowsAffected).to.equal(1);
        });

        const headerSimple2 = {
            descricao: "Header 2",
            items: ["123", "456", "789", "10a"]
        } as HeaderSimple;

        const insertResult2 = await crud.insert(HeaderSimple, headerSimple2).execute().toPromise();
        expect(insertResult2.length).to.equal(headerSimple2.items.length + 1);
        expect(insertResult2[0].rowsAffected).to.equal(1);
        headerSimple2.items.forEach((value, index) => {
            expect(insertResult2[index + 1].rowsAffected).to.equal(1);
        });

        const headerSimple3 = {
            descricao: "Header 3",
            items: ["a1", "b2"]
        } as HeaderSimple;

        const insertResult3 = await crud.insert(HeaderSimple, headerSimple3).execute().toPromise();
        expect(insertResult3.length).to.equal(headerSimple3.items.length + 1);
        expect(insertResult3[0].rowsAffected).to.equal(1);
        headerSimple3.items.forEach((value, index) => {
            expect(insertResult3[index + 1].rowsAffected).to.equal(1);
        });

        const selectResult = await crud.query(HeaderSimple).toList().toPromise();
        expect(selectResult.length).to.equal(3);

        expect(selectResult[0].items.length).to.equal(ObjectToTest.headerSimple.items.length);
        expect(selectResult[0].id).to.equal(ObjectToTest.headerSimple.id);
        expect(selectResult[0].descricao).to.equal(ObjectToTest.headerSimple.descricao);
        ObjectToTest.headerSimple.items.forEach((value, index) => {
            expect(selectResult[0].items[index]).to.equal(value);
        });

        expect(selectResult[1].items.length).to.equal(headerSimple2.items.length);
        expect(selectResult[1].id).to.equal(headerSimple2.id);
        expect(selectResult[1].descricao).to.equal(headerSimple2.descricao);
        headerSimple2.items.forEach((value, index) => {
            expect(selectResult[1].items[index]).to.equal(value);
        });

        expect(selectResult[2].items.length).to.equal(headerSimple3.items.length);
        expect(selectResult[2].id).to.equal(headerSimple3.id);
        expect(selectResult[2].descricao).to.equal(headerSimple3.descricao);
        headerSimple3.items.forEach((value, index) => {
            expect(selectResult[2].items[index]).to.equal(value);
        });

        headerSimple2.descricao = "Editado";
        const oldCountItems = headerSimple2.items.length;
        headerSimple2.items.splice(headerSimple2.items.length - 1, 1);
        headerSimple2.items = [...headerSimple2.items, "agora", "tem", "novo", "valor"];

        const updateResult = await crud.update(HeaderSimple, headerSimple2)
            .where(where => {
                where.equal(x => x.id, headerSimple2.id);
            })
            .execute().toPromise();
        const countUpdateResultExtraItems = 2; /* Update (Main) e Delete (Items) */
        expect(updateResult.length).to.equal(headerSimple2.items.length + countUpdateResultExtraItems);
        /* Update (Main) */
        expect(updateResult[0].rowsAffected).to.equal(1);
        /* Delete (Items) */
        expect(updateResult[1].rowsAffected).to.equal(oldCountItems);
        headerSimple2.items.forEach((value, index) => {
            expect(updateResult[index + countUpdateResultExtraItems].rowsAffected).to.equal(1);
        });

        const selectUpdateResult = await crud.query(HeaderSimple)
            .where(where => {
                where.equal(x => x.id, headerSimple2.id);
            })
            .firstOrDefault().toPromise();
        expect(selectUpdateResult.items.length).to.equal(headerSimple2.items.length);
        expect(selectUpdateResult.id).to.equal(headerSimple2.id);
        expect(selectUpdateResult.descricao).to.equal(headerSimple2.descricao);
        headerSimple2.items.forEach((value, index) => {
            expect(selectUpdateResult.items[index]).to.equal(value);
        });

        const deleteResult1 = await crud.delete(HeaderSimple, headerSimple2)
            .execute().toPromise();
        expect(deleteResult1.length).to.equal(2);
        /* Main deleted */
        expect(deleteResult1[0].rowsAffected).to.equal(1);
        /* Itens deleted */
        expect(deleteResult1[1].rowsAffected).to.equal(headerSimple2.items.length);

        const deleteResult2 = await crud.deleteByKey(HeaderSimple, ObjectToTest.headerSimple.id)
            .execute().toPromise();
        expect(deleteResult2.length).to.equal(2);
        /* Main deleted */
        expect(deleteResult2[0].rowsAffected).to.equal(1);
        /* Itens deleted */
        expect(deleteResult2[1].rowsAffected).to.equal(ObjectToTest.headerSimple.items.length);

        const selectResult2 = await crud.query(HeaderSimple).toList().toPromise();
        expect(selectResult2.length).to.equal(1);
        expect(selectResult2[0].items.length).to.equal(headerSimple3.items.length);
        expect(selectResult2[0].id).to.equal(headerSimple3.id);
        expect(selectResult2[0].descricao).to.equal(headerSimple3.descricao);
        headerSimple3.items.forEach((value, index) => {
            expect(selectResult2[0].items[index]).to.equal(value);
        });

        /* Test select not cascade with data in itens */
        const selectResultNotCascade = await crud.query(HeaderSimple).toList(false).toPromise();
        expect(selectResultNotCascade.length).to.equal(1);
        expect(selectResultNotCascade[0].items.length).to.equal(0);
        expect(selectResultNotCascade[0].id).to.equal(headerSimple3.id);
        expect(selectResultNotCascade[0].descricao).to.equal(headerSimple3.descricao);

        const dropResult = await ddl.drop(HeaderSimple).execute().toPromise();
        expect(dropResult.length).to.equal(2);
    });

    it("HeaderSimple not cascade", async () => {

        const createResult = await ddl.create(HeaderSimple).execute(false).toPromise();
        expect(createResult.length).to.equal(1);

        const insertResult1 = await crud.insert(HeaderSimple, ObjectToTest.headerSimple).execute(false).toPromise();
        expect(insertResult1.length).to.equal(1);
        expect(insertResult1[0].rowsAffected).to.equal(1);

        const headerSimple2 = {
            descricao: "Header 2",
            items: ["123", "456", "789", "10a"]
        } as HeaderSimple;

        const insertResult2 = await crud.insert(HeaderSimple, headerSimple2).execute(false).toPromise();
        expect(insertResult2.length).to.equal(1);
        expect(insertResult2[0].rowsAffected).to.equal(1);

        const headerSimple3 = {
            descricao: "Header 3",
            items: ["a1", "b2"]
        } as HeaderSimple;

        const insertResult3 = await crud.insert(HeaderSimple, headerSimple3).execute(false).toPromise();
        expect(insertResult3.length).to.equal(1);
        expect(insertResult3[0].rowsAffected).to.equal(1);

        const selectResult = await crud.query(HeaderSimple).toList(false).toPromise();
        expect(selectResult.length).to.equal(3);

        expect(selectResult[0].items.length).to.equal(0);
        expect(selectResult[0].id).to.equal(ObjectToTest.headerSimple.id);
        expect(selectResult[0].descricao).to.equal(ObjectToTest.headerSimple.descricao);

        expect(selectResult[1].items.length).to.equal(0);
        expect(selectResult[1].id).to.equal(headerSimple2.id);
        expect(selectResult[1].descricao).to.equal(headerSimple2.descricao);

        expect(selectResult[2].items.length).to.equal(0);
        expect(selectResult[2].id).to.equal(headerSimple3.id);
        expect(selectResult[2].descricao).to.equal(headerSimple3.descricao);

        headerSimple2.descricao = "Editado";
        headerSimple2.items.splice(headerSimple2.items.length - 1, 1);
        headerSimple2.items = [...headerSimple2.items, "agora", "tem", "novo", "valor"];

        const updateResult = await crud.update(HeaderSimple, headerSimple2)
            .where(where => {
                where.equal(x => x.id, headerSimple2.id);
            })
            .execute(false).toPromise();
        expect(updateResult.length).to.equal(1);
        expect(updateResult[0].rowsAffected).to.equal(1);

        const selectUpdateResult = await crud.query(HeaderSimple)
            .where(where => {
                where.equal(x => x.id, headerSimple2.id);
            })
            .firstOrDefault(false).toPromise();
        expect(selectUpdateResult.items.length).to.equal(0);
        expect(selectUpdateResult.id).to.equal(headerSimple2.id);
        expect(selectUpdateResult.descricao).to.equal(headerSimple2.descricao);

        const deleteResult1 = await crud.delete(HeaderSimple, headerSimple2)
            .execute(false).toPromise();
        expect(deleteResult1.length).to.equal(1);
        /* Main deleted */
        expect(deleteResult1[0].rowsAffected).to.equal(1);

        const deleteResult2 = await crud.deleteByKey(HeaderSimple, ObjectToTest.headerSimple.id)
            .execute(false).toPromise();
        expect(deleteResult2.length).to.equal(1);
        /* Main deleted */
        expect(deleteResult2[0].rowsAffected).to.equal(1);

        const selectResult2 = await crud.query(HeaderSimple).toList(false).toPromise();
        expect(selectResult2.length).to.equal(1);
        expect(selectResult2[0].items.length).to.equal(0);
        expect(selectResult2[0].id).to.equal(headerSimple3.id);
        expect(selectResult2[0].descricao).to.equal(headerSimple3.descricao);

        const dropResult = await ddl.drop(HeaderSimple).execute(false).toPromise();
        expect(dropResult.length).to.equal(1);
    });

    it("Referencia cascade (property compost)", async () => {

        const createResult = await ddl.create(Referencia).execute().toPromise();
        expect(createResult.length).to.equal(2);

        const insertResult1 = await crud.insert(Referencia, ObjectToTest.referencia).execute().toPromise();
        expect(insertResult1.length).to.equal(ObjectToTest.referencia.referenciasRelacionadas.length + 1);
        expect(insertResult1[0].rowsAffected).to.equal(1);
        ObjectToTest.referencia.referenciasRelacionadas.forEach((value, index) => {
            expect(insertResult1[index + 1].rowsAffected).to.equal(1);
        });

        const referencia2 = {
            codeImport: 200,
            codigo: "fffff",
            descricao: "Referencia 2",
            restricaoGrade: ["41", "42", "43", "44", "45"],
            referenciasRelacionadas: [
                {
                    codeImport: 201
                } as Referencia,
                {
                    codeImport: 203
                } as Referencia,
                {
                    codeImport: 205
                } as Referencia,
                {
                    codeImport: 207
                } as Referencia,
            ],
            imagem: {
                internalKey: 40
            } as Imagem,
            deleted: false
        } as Referencia;

        const insertResult2 = await crud.insert(Referencia, referencia2).execute().toPromise();
        expect(insertResult2.length).to.equal(referencia2.referenciasRelacionadas.length + 1);
        expect(insertResult2[0].rowsAffected).to.equal(1);
        referencia2.referenciasRelacionadas.forEach((value, index) => {
            expect(insertResult2[index + 1].rowsAffected).to.equal(1);
        });

        const referencia3 = {
            codeImport: 300,
            codigo: "aaaaaa",
            descricao: "Referencia 3",
            restricaoGrade: ["21", "22", "23", "24", "25"],
            referenciasRelacionadas: [
                {
                    codeImport: 301
                } as Referencia,
                {
                    codeImport: 303
                } as Referencia,
                {
                    codeImport: 305
                } as Referencia,
                {
                    codeImport: 307
                } as Referencia,
            ],
            imagem: {
                internalKey: 50
            } as Imagem,
            deleted: false
        } as Referencia;

        const insertResult3 = await crud.insert(Referencia, referencia3).execute().toPromise();
        expect(insertResult3.length).to.equal(referencia3.referenciasRelacionadas.length + 1);
        expect(insertResult3[0].rowsAffected).to.equal(1);
        referencia3.referenciasRelacionadas.forEach((value, index) => {
            expect(insertResult3[index + 1].rowsAffected).to.equal(1);
        });

        const selectResult = await crud.query(Referencia).toList().toPromise();
        expect(selectResult.length).to.equal(3);

        expect(selectResult[0].referenciasRelacionadas.length).to.equal(ObjectToTest.referencia.referenciasRelacionadas.length);
        expect(selectResult[0].codeImport).to.equal(ObjectToTest.referencia.codeImport);
        expect(selectResult[0].descricao).to.equal(ObjectToTest.referencia.descricao);
        ObjectToTest.referencia.referenciasRelacionadas.forEach((value, index) => {
            expect(selectResult[0].referenciasRelacionadas[index].codeImport).to.equal(value.codeImport);
        });

        expect(selectResult[1].referenciasRelacionadas.length).to.equal(referencia2.referenciasRelacionadas.length);
        expect(selectResult[1].codeImport).to.equal(referencia2.codeImport);
        expect(selectResult[1].descricao).to.equal(referencia2.descricao);
        referencia2.referenciasRelacionadas.forEach((value, index) => {
            expect(selectResult[1].referenciasRelacionadas[index].codeImport).to.equal(value.codeImport);
        });

        expect(selectResult[2].referenciasRelacionadas.length).to.equal(referencia3.referenciasRelacionadas.length);
        expect(selectResult[2].codeImport).to.equal(referencia3.codeImport);
        expect(selectResult[2].descricao).to.equal(referencia3.descricao);
        referencia3.referenciasRelacionadas.forEach((value, index) => {
            expect(selectResult[2].referenciasRelacionadas[index].codeImport).to.equal(value.codeImport);
        });

        referencia2.descricao = "Editado";
        const oldCountItems = referencia2.referenciasRelacionadas.length;
        referencia2.referenciasRelacionadas.splice(referencia2.referenciasRelacionadas.length - 1, 1);
        referencia2.referenciasRelacionadas = [...referencia2.referenciasRelacionadas, {
            codeImport: 222
        } as Referencia];

        const updateResult = await crud.update(Referencia, referencia2)
            .where(where => {
                where.equal(x => x.codeImport, referencia2.codeImport);
            })
            .execute().toPromise();
        const countUpdateResultExtraItems = 2; /* Update (Main) e Delete (Items) */
        expect(updateResult.length).to.equal(referencia2.referenciasRelacionadas.length + countUpdateResultExtraItems);
        /* Update (Main) */
        expect(updateResult[0].rowsAffected).to.equal(1);
        /* Delete (Items) */
        expect(updateResult[1].rowsAffected).to.equal(oldCountItems);
        referencia2.referenciasRelacionadas.forEach((value, index) => {
            expect(updateResult[index + countUpdateResultExtraItems].rowsAffected).to.equal(1);
        });

        const selectUpdateResult = await crud.query(Referencia)
            .where(where => {
                where.equal(x => x.codeImport, referencia2.codeImport);
            })
            .firstOrDefault().toPromise();
        expect(selectUpdateResult.referenciasRelacionadas.length).to.equal(referencia2.referenciasRelacionadas.length);
        expect(selectUpdateResult.codeImport).to.equal(referencia2.codeImport);
        expect(selectUpdateResult.descricao).to.equal(referencia2.descricao);
        referencia2.referenciasRelacionadas.forEach((value, index) => {
            expect(selectUpdateResult.referenciasRelacionadas[index].codeImport).to.equal(value.codeImport);
        });

        const deleteResult1 = await crud.delete(Referencia, referencia2)
            .execute().toPromise();
        expect(deleteResult1.length).to.equal(2);
        /* Main deleted */
        expect(deleteResult1[0].rowsAffected).to.equal(1);
        /* Itens deleted */
        expect(deleteResult1[1].rowsAffected).to.equal(referencia2.referenciasRelacionadas.length);

        const deleteResult2 = await crud.deleteByKey(Referencia, ObjectToTest.referencia.codeImport)
            .execute().toPromise();
        expect(deleteResult2.length).to.equal(2);
        /* Main deleted */
        expect(deleteResult2[0].rowsAffected).to.equal(1);
        /* Itens deleted */
        expect(deleteResult2[1].rowsAffected).to.equal(ObjectToTest.referencia.referenciasRelacionadas.length);

        const selectResult2 = await crud.query(Referencia).toList().toPromise();
        expect(selectResult2.length).to.equal(1);
        expect(selectResult2[0].referenciasRelacionadas.length).to.equal(referencia3.referenciasRelacionadas.length);
        expect(selectResult2[0].codeImport).to.equal(referencia3.codeImport);
        expect(selectResult2[0].descricao).to.equal(referencia3.descricao);
        referencia3.referenciasRelacionadas.forEach((value, index) => {
            expect(selectResult2[0].referenciasRelacionadas[index].codeImport).to.equal(value.codeImport);
        });

        /* Test select not cascade with data in itens */
        const selectResultNotCascade = await crud.query(Referencia).toList(false).toPromise();
        expect(selectResultNotCascade.length).to.equal(1);
        expect(selectResultNotCascade[0].referenciasRelacionadas.length).to.equal(0);
        expect(selectResultNotCascade[0].codeImport).to.equal(referencia3.codeImport);
        expect(selectResultNotCascade[0].descricao).to.equal(referencia3.descricao);

        const dropResult = await ddl.drop(Referencia).execute().toPromise();
        expect(dropResult.length).to.equal(2);
    });
});
