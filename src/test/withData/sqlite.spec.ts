import { Marca } from "../models/marca";
import { ContasAReceber } from "../models/contas-a-receber";
import { Ddl } from "../../ddl/ddl";
import { expect } from "chai";
import { Cidade } from "../models/cidade";
import { ObjectToTest } from "../objeto-to-test";
import { getMapper } from "../mappers-table-new";
import { Crud, JoinType } from "../../crud";
import { GuidClazz } from "../models/guid-clazz";
import { Uf } from "../models/uf";
import { HeaderSimple } from "../models/header-simple";
import { Referencia } from "../models/referencia";
import { Imagem } from "../models/imagem";
import { SQLiteDatabase } from "../database/sqlite-database";
import { Regiao } from "../models/regiao";
import { SubRegiao } from "../models/sub-regiao";
import { JoinQueryBuilder } from "../../crud/query/join-query-builder";
import { ModeloDetalheProduto } from "../models/modelo-detalhe-produto";
import { Utils } from "../../core/utils";
import { FieldType } from "../../core/enums/field-type";
import { Cliente } from "../models/cliente";
import { lastValueFrom } from "rxjs";


describe("SQLite", () => {
    let crud: Crud;
    let ddl: Ddl;

    beforeEach(async () => {
        const mapper = getMapper();

        const database = await new SQLiteDatabase().init();
        crud = new Crud({ database, getMapper: mapper, enableLog: false });
        ddl = new Ddl({ database, getMapper: mapper, enableLog: false });

        await lastValueFrom(ddl.create(Cliente).execute());
        await lastValueFrom(ddl.create(Cidade).execute());
        await lastValueFrom(ddl.create(Uf).execute());
        await lastValueFrom(ddl.create(SubRegiao).execute());
        await lastValueFrom(ddl.create(Regiao).execute());
    });

    const insertUf = async () => {
        const itemExist = await crud.query(Uf)
            .firstOrDefault({ where: w => w.equal(x => x.codeImport, ObjectToTest.uf.codeImport) }).toPromise();
        if (!itemExist) {
            const insert = crud.insert(Uf, { modelToSave: ObjectToTest.uf });
            const insertedResult = await lastValueFrom(insert.execute());
            expect(insertedResult[0].rowsAffected).to.equal(1);
        }
    };

    const insertSubRegiao = async () => {
        const itemExist = await lastValueFrom(crud.query(SubRegiao)
            .where(w => w.equal(x => x.codeImport, ObjectToTest.subRegiao.codeImport))
            .firstOrDefault());
        if (!itemExist) {
            const insert = crud.insert(SubRegiao, { modelToSave: ObjectToTest.subRegiao });
            const insertedResult = await lastValueFrom(insert.execute());
            expect(insertedResult[0].rowsAffected).to.equal(1);
        }
    };

    const insertRegiao = async () => {
        const itemExist = await lastValueFrom(crud.query(Regiao)
            .ignoreQueryFilters()
            .where(w => w.equal(x => x.codeImport, ObjectToTest.regiao.codeImport))
            .firstOrDefault());
        if (!itemExist) {
            const insert = crud.insert(Regiao, { modelToSave: ObjectToTest.regiao });
            const insertedResult = await lastValueFrom(insert.execute());
            expect(insertedResult[0].rowsAffected).to.equal(1);
        }
    };

    it("GuidClazz", async () => {

        await lastValueFrom(ddl.create(GuidClazz).execute());

        const obj1 = Object.assign({}, ObjectToTest.guidClazz);
        const insertResult = await lastValueFrom(crud.insert(GuidClazz, { modelToSave: obj1 }).execute());
        expect(insertResult[0].rowsAffected).to.equal(1);

        const queryInsertResult = await lastValueFrom(crud.query(GuidClazz).toList());
        expect(queryInsertResult.length).to.equal(1);
        expect(queryInsertResult[0].description).to.equal(obj1.description);
        expect(queryInsertResult[0].guid).to.equal(obj1.guid);

        const modelUpdate = {
            guid: "abc",
            description: "Teste Update"
        } as GuidClazz;
        const updateResult = await crud.update(GuidClazz, { modelToSave: modelUpdate })
            .where(where => where.equal(x => x.guid, obj1.guid))
            .execute().toPromise();
        expect(updateResult[0].rowsAffected).to.equal(1);

        const queryUpdateResult = await lastValueFrom(crud.query(GuidClazz).toList());
        expect(queryUpdateResult.length).to.equal(1);
        expect(queryUpdateResult[0].description).to.equal(modelUpdate.description);
        expect(queryUpdateResult[0].guid).to.equal(obj1.guid);

        const modelUpdateByDescription = new GuidClazz(void 0, "Teste teste test");
        const updateByDescriptionResult = await crud.update(GuidClazz, { modelToSave: modelUpdateByDescription })
            .where(where => where.equal(x => x.description, modelUpdate.description))
            .execute().toPromise();
        expect(updateByDescriptionResult[0].rowsAffected).to.equal(1);
        expect(modelUpdateByDescription.guid).to.equal(void 0);
    });

    it("Cidade", async () => {

        const subRegiaoKeyZero = {
            codeImport: 0,
            nome: "Leste Catarinense",
            regiao: ObjectToTest.regiao
        } as SubRegiao;

        const insertUf = await lastValueFrom(crud.insert(Uf, { modelToSave: ObjectToTest.uf }).execute());
        expect(insertUf[0].rowsAffected).to.equal(1);

        const insertSubRegiao = await lastValueFrom(crud.insert(SubRegiao, { modelToSave: subRegiaoKeyZero }).execute());
        expect(insertSubRegiao[0].rowsAffected).to.equal(1);

        const insertResult1 = await lastValueFrom(crud.insert(Cidade, { modelToSave: ObjectToTest.cidade }).execute());
        expect(insertResult1[0].rowsAffected).to.equal(1);
        const insertResult2 = await crud.insert(Cidade, {
            modelToSave: {
                codeImport: 3,
                nome: "São João Batisa",
                uf: ObjectToTest.uf,
                subRegiao: ObjectToTest.subRegiao,
            } as Cidade
        }).execute().toPromise();
        expect(insertResult2[0].rowsAffected).to.equal(1);

        // Caso de referencia nula test1
        const insertSaoPaulo = await crud.insert(Cidade, {
            modelToSave: {
                codeImport: 4,
                nome: "São Paulo",
                uf: null,
                subRegiao: void 0,
            } as Cidade
        })
            .execute().toPromise();
        expect(insertSaoPaulo[0].rowsAffected).to.equal(1);

        const querySaoPaulo = await crud.query(Cidade)
            .where(where => where.equal(x => x.codeImport, insertSaoPaulo[0].insertId))
            .ignoreQueryFilters()
            .mapper<Cidade>(map => map.map().result()).toPromise();
        expect(querySaoPaulo.length).to.equal(1);
        expect(querySaoPaulo[0].subRegiao).to.equal(null);
        expect(querySaoPaulo[0].uf).to.equal(null);

        // Caso de referencia nula test2
        const insertNovaTrento = await crud.insert(Cidade, {
            modelToSave: {
                codeImport: 5,
                nome: "Nova Trento",
                uf: ObjectToTest.uf,
                subRegiao: void 0,
            } as Cidade
        })
            .execute().toPromise();
        expect(insertNovaTrento[0].rowsAffected).to.equal(1);

        const queryNovaTrento = crud.query(Cidade);
        queryNovaTrento
            .ignoreQueryFilters()
            .join(Uf, where => where.equal(x => x.codeImport, queryNovaTrento.ref(x => x.uf.codeImport)), join => { join.projection(p => p.all()); })
            .where(where => where.equal(x => x.codeImport, insertNovaTrento[0].insertId))
            .projection(p => p.all());
        const resultNovaTrento = await queryNovaTrento.mapper<Cidade>(map => map.map()
            .map(Uf, x => x.uf)
            .result()).toPromise();
        expect(resultNovaTrento.length).to.equal(1);
        expect(resultNovaTrento[0].subRegiao).to.equal(null);
        expect(resultNovaTrento[0].uf.codeImport).to.equal(ObjectToTest.uf.codeImport);
        expect(resultNovaTrento[0].uf.nome).to.equal(ObjectToTest.uf.nome);
        expect(resultNovaTrento[0].uf.population).to.equal(ObjectToTest.uf.population);

        // Caso de referencia nula test3 - key referencia 0
        const insertCanelinha = await crud.insert(Cidade, {
            modelToSave: {
                codeImport: 6,
                nome: "Canelinha",
                uf: ObjectToTest.uf,
                subRegiao: subRegiaoKeyZero,
            } as Cidade
        })
            .execute().toPromise();
        expect(insertCanelinha[0].rowsAffected).to.equal(1);

        const queryCanelinha = crud.query(Cidade);
        queryCanelinha
            .ignoreQueryFilters()
            .join(SubRegiao, where => where.equal(x => x.codeImport, queryCanelinha.ref(x => x.subRegiao.codeImport)), join => { join.projection(p => p.all()); })
            .where(where => where.equal(x => x.codeImport, insertCanelinha[0].insertId))
            .projection(p => p.all());
        const resultCanelinha = await queryCanelinha.mapper<Cidade>(map => map.map()
            .map(SubRegiao, x => x.subRegiao)
            .result()).toPromise();
        expect(resultCanelinha.length).to.equal(1);
        expect(resultCanelinha[0].uf.codeImport).to.equal(ObjectToTest.uf.codeImport);
        expect(resultCanelinha[0].subRegiao.codeImport).to.equal(subRegiaoKeyZero.codeImport);
        expect(resultCanelinha[0].subRegiao.nome).to.equal(subRegiaoKeyZero.nome);

        const queryResult = await crud.query(Cidade)
            .where(where => where.equal(x => x.uf.codeImport, ObjectToTest.uf.codeImport))
            .ignoreQueryFilters()
            .toList().toPromise();
        expect(queryResult.length).to.equal(4);
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
        const insert = crud.insert(Cidade, { modelToSave: model4 });
        const insertResult4 = await lastValueFrom(insert.execute());
        expect(insertResult4[0].rowsAffected).to.equal(1);

        const queryResult4 = await crud.query(Cidade)
            .where(where => where.equal(x => x.codeImport, model4.codeImport))
            .ignoreQueryFilters()
            .firstOrDefault().toPromise();
        const queryResultNull = await crud.query(Cidade)
            .where(where => where.isNull(x => x.nome))
            .ignoreQueryFilters()
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

        const insert = crud.insert(Cidade, { modelToSave: model });
        const insertResult4 = await lastValueFrom(insert.execute());
        expect(insertResult4[0].rowsAffected).to.equal(1);

        const query = await crud.query(Cidade)
            .ignoreQueryFilters()
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

        await lastValueFrom(ddl.create(Marca).execute());
        const insert = crud.insert(Marca, { modelToSave: model });
        const insertResult4 = await lastValueFrom(insert.execute());
        expect(insertResult4[0].rowsAffected).to.equal(1);

        const queryItemEscolhaReferencia = crud
            .query(Marca)
            .projection(projection => {
                projection.add(x => x.codeImport);
            });
        const query = await crud.query(ModeloDetalheProduto, { alias: "mdtest" })
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

        const insert = crud.insert(Cidade, { modelToSave: model });
        const insertResult4 = await lastValueFrom(insert.execute());
        expect(insertResult4[0].rowsAffected).to.equal(1);

        const query = await crud.query(Cidade)
            .ignoreQueryFilters()
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
        await lastValueFrom(ddl.create(ContasAReceber).execute());

        const dados = Object.assign({}, ObjectToTest.contasReceber);
        dados.dataRecebimento = "2018-06-08T00:00:00Z";

        const insertResult1 = await lastValueFrom(crud.insert(ContasAReceber, { modelToSave: dados }).execute());
        expect(insertResult1[0].rowsAffected).to.equal(1);

        const queryResult = await crud.query(ContasAReceber)
            .where(where => where.equal(x => x.cliente.idErp, dados.cliente.idErp))
            .toList().toPromise();

        expect(queryResult.length).to.equal(1);
        expect(queryResult[0].idErp).to.equal(dados.idErp);
        expect(Utils.getValueType(queryResult[0].dataRecebimento, FieldType.DATE)?.[0]).to.equal(Utils.getValueType(dados.dataRecebimento, FieldType.DATE)?.[0]);
        expect(queryResult[0].dataVencimento.unix()).to.equal(dados.dataVencimento.unix());
    });

    it("HeaderSimple cascade", async () => {
        const createResult = await lastValueFrom(ddl.create(HeaderSimple).execute());
        expect(createResult.length).to.equal(2);

        const insertResult1 = await lastValueFrom(crud.insert(HeaderSimple, { modelToSave: ObjectToTest.headerSimple }).execute());
        expect(insertResult1.length).to.equal(ObjectToTest.headerSimple.items.length + 1);
        expect(insertResult1[0].rowsAffected).to.equal(1);
        ObjectToTest.headerSimple.items.forEach((value, index) => {
            expect(insertResult1[index + 1].rowsAffected).to.equal(1);
        });

        const headerSimple2 = {
            descricao: "Header 2",
            items: ["123", "456", "789", "10a"]
        } as HeaderSimple;

        const insertResult2 = await lastValueFrom(crud.insert(HeaderSimple, { modelToSave: headerSimple2 }).execute());
        expect(insertResult2.length).to.equal(headerSimple2.items.length + 1);
        expect(insertResult2[0].rowsAffected).to.equal(1);
        headerSimple2.items.forEach((value, index) => {
            expect(insertResult2[index + 1].rowsAffected).to.equal(1);
        });

        const headerSimple3 = {
            descricao: "Header 3",
            items: ["a1", "b2"]
        } as HeaderSimple;

        const insertResult3 = await lastValueFrom(crud.insert(HeaderSimple, { modelToSave: headerSimple3 }).execute());
        expect(insertResult3.length).to.equal(headerSimple3.items.length + 1);
        expect(insertResult3[0].rowsAffected).to.equal(1);
        headerSimple3.items.forEach((value, index) => {
            expect(insertResult3[index + 1].rowsAffected).to.equal(1);
        });

        const selectResult = await lastValueFrom(crud.query(HeaderSimple).toList());
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

        const update = crud.update(HeaderSimple, { modelToSave: headerSimple2 })
        .where(where => {
            where.equal(x => x.id, headerSimple2.id);
        });
        const updateResult = await update
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

        const deleteResult1 = await crud.delete(HeaderSimple, { modelToSave: headerSimple2 })
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

        const selectResult2 = await lastValueFrom(crud.query(HeaderSimple).toList());
        expect(selectResult2.length).to.equal(1);
        expect(selectResult2[0].items.length).to.equal(headerSimple3.items.length);
        expect(selectResult2[0].id).to.equal(headerSimple3.id);
        expect(selectResult2[0].descricao).to.equal(headerSimple3.descricao);
        headerSimple3.items.forEach((value, index) => {
            expect(selectResult2[0].items[index]).to.equal(value);
        });

        // mapper
        const selectResultMapper = await crud.query(HeaderSimple)
            .mapper<HeaderSimple>(row => {
                return row.map().result();
            })
            .toPromise();
        expect(selectResultMapper.length).to.equal(1);
        expect(selectResultMapper[0].items.length).to.equal(headerSimple3.items.length);
        expect(selectResultMapper[0].id).to.equal(headerSimple3.id);
        expect(selectResultMapper[0].descricao).to.equal(headerSimple3.descricao);
        headerSimple3.items.forEach((value, index) => {
            expect(selectResultMapper[0].items[index]).to.equal(value);
        });

        // mapper not cascade
        const selectResultMapperNotCascade = await crud.query(HeaderSimple)
            .mapper<HeaderSimple>(row => {
                return row.map().result();
            }, { cascade: false })
            .toPromise();
        expect(selectResultMapperNotCascade.length).to.equal(1);
        expect(selectResultMapperNotCascade[0].items.length).to.equal(0);
        expect(selectResultMapperNotCascade[0].id).to.equal(headerSimple3.id);
        expect(selectResultMapperNotCascade[0].descricao).to.equal(headerSimple3.descricao);

        /* Test select not cascade with data in itens */
        const selectResultNotCascade = await lastValueFrom(crud.query(HeaderSimple).toList({ cascade: false }));
        expect(selectResultNotCascade.length).to.equal(1);
        expect(selectResultNotCascade[0].items.length).to.equal(0);
        expect(selectResultNotCascade[0].id).to.equal(headerSimple3.id);
        expect(selectResultNotCascade[0].descricao).to.equal(headerSimple3.descricao);

        const dropResult = await lastValueFrom(ddl.drop(HeaderSimple).execute());
        expect(dropResult.length).to.equal(2);
    });

    it("HeaderSimple not cascade", async () => {

        const createResult = await lastValueFrom(ddl.create(HeaderSimple).execute({ cascade: false }));
        expect(createResult.length).to.equal(1);

        const insertResult1 = await lastValueFrom(crud.insert(HeaderSimple, { modelToSave: ObjectToTest.headerSimple }).execute({ cascade: false }));
        expect(insertResult1.length).to.equal(1);
        expect(insertResult1[0].rowsAffected).to.equal(1);

        const headerSimple2 = {
            descricao: "Header 2",
            items: ["123", "456", "789", "10a"]
        } as HeaderSimple;

        const insertResult2 = await lastValueFrom(crud.insert(HeaderSimple, { modelToSave: headerSimple2 }).execute({ cascade: false }));
        expect(insertResult2.length).to.equal(1);
        expect(insertResult2[0].rowsAffected).to.equal(1);

        const headerSimple3 = {
            descricao: "Header 3",
            items: ["a1", "b2"]
        } as HeaderSimple;

        const insertResult3 = await lastValueFrom(crud.insert(HeaderSimple, { modelToSave: headerSimple3 }).execute({ cascade: false }));
        expect(insertResult3.length).to.equal(1);
        expect(insertResult3[0].rowsAffected).to.equal(1);

        const selectResult = await lastValueFrom(crud.query(HeaderSimple).toList({ cascade: false }));
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

        const updateResult = await crud.update(HeaderSimple, { modelToSave: headerSimple2 })
            .where(where => {
                where.equal(x => x.id, headerSimple2.id);
            })
            .execute({ cascade: false }).toPromise();
        expect(updateResult.length).to.equal(1);
        expect(updateResult[0].rowsAffected).to.equal(1);

        const selectUpdateResult = await crud.query(HeaderSimple)
            .where(where => {
                where.equal(x => x.id, headerSimple2.id);
            })
            .firstOrDefault({ cascade: false }).toPromise();
        expect(selectUpdateResult.items.length).to.equal(0);
        expect(selectUpdateResult.id).to.equal(headerSimple2.id);
        expect(selectUpdateResult.descricao).to.equal(headerSimple2.descricao);

        const deleteResult1 = await crud.delete(HeaderSimple, { modelToSave: headerSimple2 })
            .execute({ cascade: false }).toPromise();
        expect(deleteResult1.length).to.equal(1);
        /* Main deleted */
        expect(deleteResult1[0].rowsAffected).to.equal(1);

        const deleteResult2 = await crud.deleteByKey(HeaderSimple, ObjectToTest.headerSimple.id)
            .execute({ cascade: false }).toPromise();
        expect(deleteResult2.length).to.equal(1);
        /* Main deleted */
        expect(deleteResult2[0].rowsAffected).to.equal(1);

        const selectResult2 = await lastValueFrom(crud.query(HeaderSimple).toList({ cascade: false }));
        expect(selectResult2.length).to.equal(1);
        expect(selectResult2[0].items.length).to.equal(0);
        expect(selectResult2[0].id).to.equal(headerSimple3.id);
        expect(selectResult2[0].descricao).to.equal(headerSimple3.descricao);

        const dropResult = await lastValueFrom(ddl.drop(HeaderSimple).execute({ cascade: false }));
        expect(dropResult.length).to.equal(1);
    });

    it("Referencia cascade (property compost)", async () => {

        const createResult = await lastValueFrom(ddl.create(Referencia).execute());
        expect(createResult.length).to.equal(3);

        const insertResult1 = await lastValueFrom(crud.insert(Referencia, { modelToSave: ObjectToTest.referencia }).execute());
        expect(insertResult1.length).to.equal(ObjectToTest.referencia.referenciasRelacionadas.length + ObjectToTest.referencia.restricaoGrade.length + 1);
        expect(insertResult1[0].rowsAffected).to.equal(1);
        [...ObjectToTest.referencia.referenciasRelacionadas, ...ObjectToTest.referencia.restricaoGrade].forEach((value, index) => {
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

        const insertResult2 = await lastValueFrom(crud.insert(Referencia, { modelToSave: referencia2 }).execute());
        expect(insertResult2.length).to.equal(referencia2.referenciasRelacionadas.length + referencia2.restricaoGrade.length + 1);
        expect(insertResult2[0].rowsAffected).to.equal(1);
        [...referencia2.referenciasRelacionadas, ...referencia2.restricaoGrade].forEach((value, index) => {
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

        const insertResult3 = await lastValueFrom(crud.insert(Referencia, { modelToSave: referencia3 }).execute());
        expect(insertResult3.length).to.equal(referencia3.referenciasRelacionadas.length + referencia3.restricaoGrade.length + 1);
        expect(insertResult3[0].rowsAffected).to.equal(1);
        [...referencia3.referenciasRelacionadas, ...referencia3.restricaoGrade].forEach((value, index) => {
            expect(insertResult3[index + 1].rowsAffected).to.equal(1);
        });

        const selectResult = await lastValueFrom(crud.query(Referencia).toList());
        expect(selectResult.length).to.equal(3);

        expect(selectResult[0].restricaoGrade.length).to.equal(ObjectToTest.referencia.restricaoGrade.length);
        expect(selectResult[0].referenciasRelacionadas.length).to.equal(ObjectToTest.referencia.referenciasRelacionadas.length);
        expect(selectResult[0].codeImport).to.equal(ObjectToTest.referencia.codeImport);
        expect(selectResult[0].descricao).to.equal(ObjectToTest.referencia.descricao);
        ObjectToTest.referencia.restricaoGrade.forEach((value, index) => {
            expect(selectResult[0].restricaoGrade[index]).to.equal(value);
        });
        ObjectToTest.referencia.referenciasRelacionadas.forEach((value, index) => {
            expect(selectResult[0].referenciasRelacionadas[index].codeImport).to.equal(value.codeImport);
        });

        expect(selectResult[1].restricaoGrade.length).to.equal(referencia2.restricaoGrade.length);
        expect(selectResult[1].referenciasRelacionadas.length).to.equal(referencia2.referenciasRelacionadas.length);
        expect(selectResult[1].codeImport).to.equal(referencia2.codeImport);
        expect(selectResult[1].descricao).to.equal(referencia2.descricao);
        referencia2.restricaoGrade.forEach((value, index) => {
            expect(selectResult[1].restricaoGrade[index]).to.equal(value);
        });
        referencia2.referenciasRelacionadas.forEach((value, index) => {
            expect(selectResult[1].referenciasRelacionadas[index].codeImport).to.equal(value.codeImport);
        });

        expect(selectResult[2].restricaoGrade.length).to.equal(referencia3.restricaoGrade.length);
        expect(selectResult[2].referenciasRelacionadas.length).to.equal(referencia3.referenciasRelacionadas.length);
        expect(selectResult[2].codeImport).to.equal(referencia3.codeImport);
        expect(selectResult[2].descricao).to.equal(referencia3.descricao);
        referencia3.restricaoGrade.forEach((value, index) => {
            expect(selectResult[2].restricaoGrade[index]).to.equal(value);
        });
        referencia3.referenciasRelacionadas.forEach((value, index) => {
            expect(selectResult[2].referenciasRelacionadas[index].codeImport).to.equal(value.codeImport);
        });

        referencia2.descricao = "Editado";
        referencia2.restricaoGrade.splice(referencia2.restricaoGrade.length - 1, 1);
        referencia2.restricaoGrade = [...referencia2.restricaoGrade, "234"];
        referencia2.referenciasRelacionadas.splice(referencia2.referenciasRelacionadas.length - 1, 1);
        referencia2.referenciasRelacionadas = [...referencia2.referenciasRelacionadas, {
            codeImport: 222
        } as Referencia];

        const updateResult = await crud.update(Referencia, { modelToSave: referencia2 })
            .where(where => {
                where.equal(x => x.codeImport, referencia2.codeImport);
            })
            .execute().toPromise();
        const countUpdateResultExtraItems = 3; /* Update (Main) e Delete (Items(restricaoGrade e referenciasRelacionadas)) */
        expect(updateResult.length).to.equal(referencia2.referenciasRelacionadas.length + referencia2.restricaoGrade.length + countUpdateResultExtraItems);
        /* Update (Main) */
        expect(updateResult[0].rowsAffected).to.equal(1);
        /* Delete (Items) */
        expect(updateResult[1].rowsAffected).to.equal(referencia2.restricaoGrade.length);
        expect(updateResult[referencia2.restricaoGrade.length + countUpdateResultExtraItems - 1].rowsAffected).to.equal(referencia2.referenciasRelacionadas.length);
        referencia2.restricaoGrade.forEach((value, index) => {
            expect(updateResult[index + countUpdateResultExtraItems - 1].rowsAffected).to.equal(1);
        });
        referencia2.referenciasRelacionadas.forEach((value, index) => {
            expect(updateResult[index + referencia2.restricaoGrade.length + countUpdateResultExtraItems].rowsAffected).to.equal(1);
        });

        const selectUpdateResult = await crud.query(Referencia)
            .where(where => {
                where.equal(x => x.codeImport, referencia2.codeImport);
            })
            .firstOrDefault().toPromise();
        expect(selectUpdateResult.restricaoGrade.length).to.equal(referencia2.restricaoGrade.length);
        expect(selectUpdateResult.referenciasRelacionadas.length).to.equal(referencia2.referenciasRelacionadas.length);
        expect(selectUpdateResult.codeImport).to.equal(referencia2.codeImport);
        expect(selectUpdateResult.descricao).to.equal(referencia2.descricao);
        referencia2.restricaoGrade.forEach((value, index) => {
            expect(selectUpdateResult.restricaoGrade[index]).to.equal(value);
        });
        referencia2.referenciasRelacionadas.forEach((value, index) => {
            expect(selectUpdateResult.referenciasRelacionadas[index].codeImport).to.equal(value.codeImport);
        });

        const deleteResult1 = await crud.delete(Referencia, { modelToSave: referencia2 })
            .execute().toPromise();
        expect(deleteResult1.length).to.equal(3);
        /* Main deleted */
        expect(deleteResult1[0].rowsAffected).to.equal(1);
        /* Itens deleted */
        expect(deleteResult1[1].rowsAffected).to.equal(referencia2.restricaoGrade.length);
        expect(deleteResult1[2].rowsAffected).to.equal(referencia2.referenciasRelacionadas.length);

        const deleteResult2 = await crud.deleteByKey(Referencia, ObjectToTest.referencia.codeImport)
            .execute().toPromise();
        expect(deleteResult2.length).to.equal(3);
        /* Main deleted */
        expect(deleteResult2[0].rowsAffected).to.equal(1);
        /* Itens deleted */
        expect(deleteResult2[1].rowsAffected).to.equal(ObjectToTest.referencia.restricaoGrade.length);
        expect(deleteResult2[2].rowsAffected).to.equal(ObjectToTest.referencia.referenciasRelacionadas.length);

        const selectResult2 = await lastValueFrom(crud.query(Referencia).toList());
        expect(selectResult2.length).to.equal(1);
        expect(selectResult2[0].restricaoGrade.length).to.equal(referencia3.restricaoGrade.length);
        expect(selectResult2[0].referenciasRelacionadas.length).to.equal(referencia3.referenciasRelacionadas.length);
        expect(selectResult2[0].codeImport).to.equal(referencia3.codeImport);
        expect(selectResult2[0].descricao).to.equal(referencia3.descricao);
        referencia3.restricaoGrade.forEach((value, index) => {
            expect(selectResult2[0].restricaoGrade[index]).to.equal(value);
        });
        referencia3.referenciasRelacionadas.forEach((value, index) => {
            expect(selectResult2[0].referenciasRelacionadas[index].codeImport).to.equal(value.codeImport);
        });

        /* Test select not cascade with data in itens */
        const selectResultNotCascade = await lastValueFrom(crud.query(Referencia).toList({ cascade: false }));
        expect(selectResultNotCascade.length).to.equal(1);
        expect(selectResultNotCascade[0].restricaoGrade.length).to.equal(0);
        expect(selectResultNotCascade[0].referenciasRelacionadas.length).to.equal(0);
        expect(selectResultNotCascade[0].codeImport).to.equal(referencia3.codeImport);
        expect(selectResultNotCascade[0].descricao).to.equal(referencia3.descricao);

        const dropResult = await lastValueFrom(ddl.drop(Referencia).execute());
        expect(dropResult.length).to.equal(3);
    });

    it("Where default in join", async () => {

        await insertUf();

        await insertSubRegiao();

        await insertRegiao();

        const cidade = {
            codeImport: 150,
            nome: "Teste 150",
            population: 0,
            uf: ObjectToTest.uf,
            subRegiao: ObjectToTest.subRegiao,
        } as Cidade;

        const cliente = {
            idErp: 1,
            razaoSocial: "Razão",
            nomeFantasia: "Apelido",
            cidade,
            deleted: false
        } as Cliente;

        const insertCidade = crud.insert(Cidade, { modelToSave: cidade });
        const insertResultCidade = await lastValueFrom(insertCidade.execute());
        expect(insertResultCidade[0].rowsAffected).to.equal(1);

        const insertCliente = crud.insert(Cliente, { modelToSave: cliente });
        const insertResultCliente = await lastValueFrom(insertCliente.execute());
        expect(insertResultCliente[0].rowsAffected).to.equal(1);

        const query = await crud.query(Cliente)
            .projection(p => p.all())
            .where(where => where.equal(x => x.idErp, cliente.idErp));
        let joinCidade: JoinQueryBuilder<Cidade>;
        let joinSubRegiao: JoinQueryBuilder<SubRegiao>;
        query.join(
            Cidade,
            on => on.equal(x => x.codeImport, query.ref(x => x.cidade.codeImport)),
            join => {
                join.select(x => x.nome, x => x.uf.codeImport, x => x.subRegiao.codeImport);
                joinCidade = join;
            }
        );
        query.join(
            Uf,
            on => on.equal(x => x.codeImport, joinCidade.ref(x => x.uf.codeImport)),
            join => {
                join.projection(projection => {
                    projection.add(x => x.nome);
                });
            }
        );
        query.join(
            SubRegiao,
            on => on.equal(x => x.codeImport, joinCidade.ref(x => x.subRegiao.codeImport)),
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
                }).enableQueryFilters().setParamsQueryFilter({ startWith: "N" });
            }
        );
        const queryResult = await query.mapper<Cliente>(row => {
            const result = row
                .map()
                .map(Cidade, x => x.cidade)
                .map(Uf, x => x.cidade.uf, "uf")
                .map(SubRegiao, x => x.cidade.subRegiao)
                .map(Regiao, x => x.cidade.subRegiao.regiao)
                .result();
            return result;
        }).toPromise();

        expect(queryResult.length).to.equal(1);
        expect(queryResult[0].idErp).to.equal(cliente.idErp);
        expect(queryResult[0].nomeFantasia).to.equal(cliente.nomeFantasia);
        expect(queryResult[0].deleted).to.equal(cliente.deleted);
        expect(queryResult[0].cidade.codeImport).to.equal(cliente.cidade.codeImport);
        expect(queryResult[0].cidade.nome).to.equal(cliente.cidade.nome);
        expect(queryResult[0].cidade.population).to.equal(cliente.cidade.population);
        expect(queryResult[0].cidade.uf.codeImport).to.equal(cliente.cidade.uf.codeImport);
        expect(queryResult[0].cidade.uf.nome).to.equal(cliente.cidade.uf.nome);
        expect(queryResult[0].cidade.subRegiao.codeImport).to.equal(cliente.cidade.subRegiao.codeImport);
        expect(queryResult[0].cidade.subRegiao.nome).to.equal(cliente.cidade.subRegiao.nome);
        expect(queryResult[0].cidade.subRegiao.regiao.codeImport).to.equal(new Regiao().codeImport);
        expect(queryResult[0].cidade.subRegiao.regiao.nome).to.equal(new Regiao().nome);
    });
});
