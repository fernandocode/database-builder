import { PlanRef } from "./../core/plan-ref";
import { ReferencesModelTest } from "./models/reference-model-test";
import { expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import { ColumnRef } from "../core/column-ref";
import { JoinType } from "../crud/enums/join-type";
import { Cliente } from "./models/cliente";
import { Cidade } from "./models/cidade";
import { Uf } from "./models/uf";
import { JoinQueryBuilder } from "../crud/query/join-query-builder";
import { Crud } from "../crud/crud";
import { getMapper } from "./mappers-table-new";
import { Estrutura } from "./models/estrutura";
import { Referencia } from "./models/referencia";
import { Imagem } from "./models/imagem";
import { TestClazzRef } from "./models/test-clazz-ref";
import { TestClazzRefCode } from "./models/test-clazz-ref-code";
import { ContasAReceber } from "./models/contas-a-receber";
import { Query, QueryBuilder } from "../crud";
import { MetadataTable } from "../metadata-table";
import { QueryHelper } from "../core/query-helper";
import { TypeWhere } from '../core/utils';
import { ProjectionsHelper } from '../core/projections-helper';

describe("Query", () => {

    const crud = new Crud({ sqliteLimitVariables: 10000 }, { getMapper: getMapper() });

    it("none", () => {
        const query = crud.query(TestClazz);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes");
    });

    it("query clone", () => {
        const query = crud.query(TestClazz);
        const queryClone1 = query.clone();
        const queryClone2 = query.clone();
        queryClone1.where(where => where.equal(x => x.id, 1));
        queryClone2.where(where => where.great(x => x.numero, 4));
        queryClone1.select(x => x.id);
        queryClone2.select(x => x.numero);
        const result1 = queryClone1.compile();
        expect(result1[0].params.length).to.equal(1);
        expect(result1[0].params[0]).to.equal(1);
        expect(result1[0].query).to.equal("SELECT tes.id AS id FROM TestClazz AS tes WHERE tes.id = ?");
        const result2 = queryClone2.compile();
        expect(result2[0].params.length).to.equal(1);
        expect(result2[0].params[0]).to.equal(4);
        expect(result2[0].query).to.equal("SELECT tes.numero AS numero FROM TestClazz AS tes WHERE tes.numero > ?");
    });

    it("query-builder clone", () => {
        const query = new QueryBuilder(TestClazz, getMapper().get(TestClazz).mapperTable, void 0,
            (tKey: (new () => any) | string): MetadataTable<any> => {
                return getMapper().get(tKey);
            });
        const queryClone1 = query.clone();
        const queryClone2 = query.clone();
        queryClone1.where(where => where.equal(x => x.id, 1));
        queryClone2.where(where => where.great(x => x.numero, 4));
        queryClone1.select(x => x.id);
        queryClone2.select(x => x.numero);
        const result1 = queryClone1.compile();
        expect(result1.params.length).to.equal(1);
        expect(result1.params[0]).to.equal(1);
        expect(result1.query).to.equal("SELECT tes.id AS id FROM TestClazz AS tes WHERE tes.id = ?");
        const result2 = queryClone2.compile();
        expect(result2.params.length).to.equal(1);
        expect(result2.params[0]).to.equal(4);
        expect(result2.query).to.equal("SELECT tes.numero AS numero FROM TestClazz AS tes WHERE tes.numero > ?");
    });

    it("query in query", () => {
        const queryTest = crud.query(TestClazz);
        const query = crud.query(queryTest);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes0.internalKey AS internalKey, tes0.id AS id, tes0.description AS description, tes0.date AS date, tes0.dateMoment AS dateMoment, tes0.dateDate AS dateDate, tes0.numero AS numero, tes0.referenceTest_id AS referenceTest_id, tes0.referenceTestCode_code AS referenceTestCode_code, tes0.dateStr AS dateStr FROM (SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes) AS tes0");
    });

    it("join default (LEFT)", () => {
        const query = crud.query(TestClazz);
        query.select(
            x => x.id,
            x => x.description,
            x => x.disabled);
        query.join(ReferencesModelTest,
            on => on.equal(x => x.id, query.ref(x => x.referenceTest.id)),
            join => {
                join.select(x => x.name, x => x.id);
                join.desc(x => x.id);
            });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.id AS id, tes.description AS description, tes.disabled AS disabled, ref.name AS ref_name, ref.id AS ref_id FROM TestClazz AS tes LEFT JOIN ReferencesModelTest AS ref ON (ref.id = tes.referenceTest_id) ORDER BY ref.id DESC");
    });

    it("join alias default", () => {
        const query = crud.query(TestClazz);
        query.select(
            x => x.id,
            x => x.description
        );
        query.join(TestClazzRef,
            on => on.equal(x => x.id, query.ref(x => x.referenceTest.id)),
            join => {
                join.select(x => x.description);
            });
        query.join(TestClazzRefCode,
            on => on.equal(x => x.code, query.ref(x => x.referenceTestCode.code)),
            join => {
                join.select(x => x.description);
                join.desc(x => x.code);
            });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.id AS id, tes.description AS description, tes0.description AS tes0_description, tes1.description AS tes1_description FROM TestClazz AS tes LEFT JOIN TestClazzRef AS tes0 ON (tes0.id = tes.referenceTest_id) LEFT JOIN TestClazzRefCode AS tes1 ON (tes1.code = tes.referenceTestCode_code) ORDER BY tes1.code DESC");
    });

    it("join (LEFT)", () => {
        const query = crud.query(TestClazz);
        query.select(
            x => x.id,
            x => x.description,
            x => x.disabled);
        query.join(ReferencesModelTest,
            on => on.equal(x => x.id, query.ref(x => x.referenceTest.id)),
            join => {
                join.select(x => x.name, x => x.id);
                join.desc(x => x.id);
            }, JoinType.LEFT);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.id AS id, tes.description AS description, tes.disabled AS disabled, ref.name AS ref_name, ref.id AS ref_id FROM TestClazz AS tes LEFT JOIN ReferencesModelTest AS ref ON (ref.id = tes.referenceTest_id) ORDER BY ref.id DESC");
    });

    it("join (RIGHT)", () => {
        const query = crud.query(TestClazz);
        query.select(
            x => x.id,
            x => x.description,
            x => x.disabled);
        query.join(ReferencesModelTest,
            on => on.equal(x => x.id, query.ref(x => x.referenceTest.id)),
            join => {
                join.select(x => x.name, x => x.id);
                join.desc(x => x.id);
            }, JoinType.RIGHT);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.id AS id, tes.description AS description, tes.disabled AS disabled, ref.name AS ref_name, ref.id AS ref_id FROM TestClazz AS tes RIGHT JOIN ReferencesModelTest AS ref ON (ref.id = tes.referenceTest_id) ORDER BY ref.id DESC");
    });

    it("join (INNER)", () => {
        const query = crud.query(TestClazz);
        query.select(
            x => x.id,
            x => x.description,
            x => x.disabled);
        query.join(ReferencesModelTest,
            on => on.equal(x => x.id, query.ref(x => x.referenceTest.id)),
            join => {
                join.select(x => x.name, x => x.id);
                join.desc(x => x.id);
            }, JoinType.INNER);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.id AS id, tes.description AS description, tes.disabled AS disabled, ref.name AS ref_name, ref.id AS ref_id FROM TestClazz AS tes INNER JOIN ReferencesModelTest AS ref ON (ref.id = tes.referenceTest_id) ORDER BY ref.id DESC");
    });

    it("join (FULL_OUTER)", () => {
        const query = crud.query(TestClazz);
        query.select(
            x => x.id,
            x => x.description,
            x => x.disabled);
        query.join(ReferencesModelTest,
            on => on.equal(x => x.id, query.ref(x => x.referenceTest.id)),
            join => {
                join.select(x => x.name, x => x.id);
                join.desc(x => x.id);
            }, JoinType.FULL_OUTER);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.id AS id, tes.description AS description, tes.disabled AS disabled, ref.name AS ref_name, ref.id AS ref_id FROM TestClazz AS tes FULL OUTER JOIN ReferencesModelTest AS ref ON (ref.id = tes.referenceTest_id) ORDER BY ref.id DESC");
    });

    it("from", () => {
        const query = crud.query(TestClazz, { alias: "p" });
        query.from(
            crud.query(ReferencesModelTest)
                .select(x => x.id, x => x.name)
                .where(w => w.equal(x => x.name, "AbC"))
        );
        query.where(where => where.great(x => x.id, 2));
        const result = query.compile();
        expect(result[0].params.length).to.equal(2);
        expect(result[0].params[0]).to.equal("AbC");
        expect(result[0].params[1]).to.equal(2);
        expect(result[0].query).to.equal("SELECT p.internalKey AS internalKey, p.id AS id, p.description AS description, p.date AS date, p.dateMoment AS dateMoment, p.dateDate AS dateDate, p.numero AS numero, p.referenceTest_id AS referenceTest_id, p.referenceTestCode_code AS referenceTestCode_code, p.dateStr AS dateStr FROM (SELECT ref.id AS id, ref.name AS name FROM ReferencesModelTest AS ref WHERE ref.name = ?) AS p WHERE p.id > ?");
    });

    it("union", () => {
        const query = crud.query(TestClazz, { alias: "p" });
        query.union(
            crud.query(ReferencesModelTest)
                .select(x => x.id, x => x.name)
                .where(w => w.equal(x => x.name, "AbC"))
        );
        query.where(where => where.great(x => x.id, 2));
        const result = query.compile();
        expect(result[0].params.length).to.equal(2);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].params[1]).to.equal("AbC");
        expect(result[0].query).to.equal("SELECT p.internalKey AS internalKey, p.id AS id, p.description AS description, p.date AS date, p.dateMoment AS dateMoment, p.dateDate AS dateDate, p.numero AS numero, p.referenceTest_id AS referenceTest_id, p.referenceTestCode_code AS referenceTestCode_code, p.dateStr AS dateStr FROM TestClazz AS p WHERE p.id > ? UNION SELECT ref.id AS id, ref.name AS name FROM ReferencesModelTest AS ref WHERE ref.name = ?");
    });

    it("union all", () => {
        const query = crud.query(TestClazz, { alias: "p" });
        query.unionAll(
            crud.query(ReferencesModelTest)
                .select(x => x.id, x => x.name)
                .where(w => w.equal(x => x.name, "AbC"))
        );
        query.where(where => where.great(x => x.id, 2));
        const result = query.compile();
        expect(result[0].params.length).to.equal(2);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].params[1]).to.equal("AbC");
        expect(result[0].query).to.equal("SELECT p.internalKey AS internalKey, p.id AS id, p.description AS description, p.date AS date, p.dateMoment AS dateMoment, p.dateDate AS dateDate, p.numero AS numero, p.referenceTest_id AS referenceTest_id, p.referenceTestCode_code AS referenceTestCode_code, p.dateStr AS dateStr FROM TestClazz AS p WHERE p.id > ? UNION ALL SELECT ref.id AS id, ref.name AS name FROM ReferencesModelTest AS ref WHERE ref.name = ?");
    });

    it("union all and union", () => {
        const query = crud.query(TestClazz, { alias: "p" });
        query.unionAll(
            crud.query(ReferencesModelTest)
                .select(x => x.id, x => x.name)
                .where(w => w.equal(x => x.name, "AbC"))
        );
        query.union(
            crud.query(ReferencesModelTest)
                .select(x => x.id)
                .where(w => w.equal(x => x.id, 10))
        );
        query.where(where => where.great(x => x.id, 2));
        const result = query.compile();
        expect(result[0].params.length).to.equal(3);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].params[1]).to.equal("AbC");
        expect(result[0].params[2]).to.equal(10);
        expect(result[0].query).to.equal("SELECT p.internalKey AS internalKey, p.id AS id, p.description AS description, p.date AS date, p.dateMoment AS dateMoment, p.dateDate AS dateDate, p.numero AS numero, p.referenceTest_id AS referenceTest_id, p.referenceTestCode_code AS referenceTestCode_code, p.dateStr AS dateStr FROM TestClazz AS p WHERE p.id > ? UNION ALL SELECT ref.id AS id, ref.name AS name FROM ReferencesModelTest AS ref WHERE ref.name = ? UNION SELECT ref.id AS id FROM ReferencesModelTest AS ref WHERE ref.id = ?");
    });

    it("join where concat columns", () => {
        const query = crud.query(TestClazz);
        query.select(
            x => x.id,
            x => x.description,
            x => x.disabled);
        query.join(ReferencesModelTest,
            on => on.equal(x => x.id, query.ref(x => x.referenceTest.id)),
            join => {
                join.select(x => x.name, x => x.id);
                join.where(where => {
                    where.contains(new ColumnRef(`${query.ref(x => x.description).result()} || '|' || ${join.ref(x => x.name).result()}`), "abcd");
                });
            });
        const result = query.compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal("%abcd%");
        expect(result[0].query).to.equal("SELECT tes.id AS id, tes.description AS description, tes.disabled AS disabled, ref.name AS ref_name, ref.id AS ref_id FROM TestClazz AS tes LEFT JOIN ReferencesModelTest AS ref ON (ref.id = tes.referenceTest_id) WHERE tes.description || '|' || ref.name LIKE ?");
    });

    it("join where concat columns with coalesce", () => {
        const query = crud.query(TestClazz);
        query.select(
            x => x.id,
            x => x.description,
            x => x.disabled);
        query.join(ReferencesModelTest,
            on => on.equal(x => x.id, query.ref(x => x.referenceTest.id)),
            join => {
                join.select(x => x.name, x => x.id);
                join.where(where => {
                    where.contains(new ColumnRef(`${where.coalesce(query.ref(x => x.description).result(), ["a1"]).resultWithoutParams()[0]} || '|' || ${where.coalesce(join.ref(x => x.name).result(), ["b2"]).resultWithoutParams()[0]}`), "abcd");
                });
            });
        const result = query.compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal("%abcd%");
        expect(result[0].query).to.equal("SELECT tes.id AS id, tes.description AS description, tes.disabled AS disabled, ref.name AS ref_name, ref.id AS ref_id FROM TestClazz AS tes LEFT JOIN ReferencesModelTest AS ref ON (ref.id = tes.referenceTest_id) WHERE COALESCE(tes.description, 'a1') || '|' || COALESCE(ref.name, 'b2') LIKE ?");
    });

    describe('join where with multi columns like', () => {
        let query: Query<TestClazz>;
        let joinRefModel: JoinQueryBuilder<ReferencesModelTest>;
        const joinRefAlias = 'ref';
        const like = "abcd";

        const testMultiColumnLike = (
            expectedResult = "SELECT tes.id AS id, tes.description AS description, tes.disabled AS disabled, ref.name AS ref_name, ref.id AS ref_id "
                + "FROM TestClazz AS tes LEFT JOIN ReferencesModelTest AS ref ON (ref.id = tes.referenceTest_id) "
                + "WHERE COALESCE(tes.description, '') || '|' || COALESCE(ref.name, '') LIKE ?",
            ...columns: TypeWhere<TestClazz>[]) => {
            query.where(where => where.multiColumnLike(like, '|', ...columns));

            const result = query.compile();

            expect(result[0].params.length).to.equal(1);
            expect(result[0].params[0]).to.equal(`%${like.toUpperCase()}%`);
            expect(result[0].query).to.equal(expectedResult);
        };

        beforeEach(() => {
            query = crud
                .query(TestClazz);

            query
                .select(x => x.id, x => x.description, x => x.disabled)
                .join(
                    ReferencesModelTest,
                    on => on.equal(x => x.id, query.ref(x => x.referenceTest.id)),
                    join => {
                        join.select(x => x.name, x => x.id);
                        joinRefModel = join;
                    },
                    void 0,
                    joinRefAlias)
        });

        it('using ColumnRef/ColumnRef', () => testMultiColumnLike(void 0, query.ref(x => x.description), joinRefModel.ref(x => x.name)));

        it('using Expression/ColumnRef', () => testMultiColumnLike(void 0, x => x.description, joinRefModel.ref(x => x.name)));

        it('using ValueTypeToParse/PlanRef', () => testMultiColumnLike(
            "SELECT tes.id AS id, tes.description AS description, tes.disabled AS disabled, ref.name AS ref_name, ref.id AS ref_id "
            + "FROM TestClazz AS tes LEFT JOIN ReferencesModelTest AS ref ON (ref.id = tes.referenceTest_id) "
            + "WHERE COALESCE('abc', '') || '|' || COALESCE(ref.name, '') LIKE ?",
            'abc',
            new PlanRef('ref.name')
        ));

        it('using Expression/ProjectionsHelper', () => testMultiColumnLike(
            "SELECT tes.id AS id, tes.description AS description, tes.disabled AS disabled, ref.name AS ref_name, ref.id AS ref_id "
            + "FROM TestClazz AS tes LEFT JOIN ReferencesModelTest AS ref ON (ref.id = tes.referenceTest_id) "
            + "WHERE COALESCE(tes.description, '') || '|' || COALESCE(MAX(ref.id), '') LIKE ?",
            x => x.description,
            new ProjectionsHelper(ReferencesModelTest, joinRefAlias).max(x => x.id)
        ));
    });

    it("join linked", () => {
        const query = crud.query(Cliente);
        let joinCidade: JoinQueryBuilder<Cidade>;
        query
            .ignoreQueryFilters()
            .select(
                x => x.cidade.codeImport,
                x => x.nomeFantasia,
                x => x.razaoSocial,
                x => x.idErp
            )
            .projection(projection => {
                projection.add(x => x.deleted, "inativo");
            })
            .where(where => {
                where.not().equalValue(x => x.razaoSocial, "ABC");
                where.greatAndEqualValue(x => x.idErp, 10);
            })
            .join(
                Cidade,
                onWhere =>
                    onWhere.equal(x => x.codeImport, query.ref(x => x.cidade.codeImport)),
                join => {
                    joinCidade = join;
                    join.projection(projection => {
                        projection.add(x => x.nome, "cidade_nome");
                        projection.add(x => x.codeImport);
                    });
                }
            ).join(Uf,
                onWhere => {
                    onWhere.equal(x => x.codeImport, joinCidade.ref(x => x.uf.codeImport));
                },
                join => {
                    join.projection(projection => {
                        projection.add(x => x.nome, "uf_nome");
                    });
                });

        const result = query.compile();
        expect(result[0].params.length).to.equal(2);
        expect(result[0].params[0]).to.equal("ABC");
        expect(result[0].params[1]).to.equal(10);
        expect(result[0].query).to.equal(`SELECT cli.cidade_codeImport AS cidade_codeImport, cli.nomeFantasia AS nomeFantasia, cli.razaoSocial AS razaoSocial, cli.idErp AS idErp, cli.deleted AS inativo, cid.nome AS cidade_nome, cid.codeImport AS cid_codeImport, uf.nome AS uf_nome FROM Cliente AS cli LEFT JOIN Cidade AS cid ON (cid.codeImport = cli.cidade_codeImport) LEFT JOIN Uf AS uf ON (uf.codeImport = cid.uf_codeImport) WHERE cli.razaoSocial <> ? AND cli.idErp >= ?`);
    });

    it("join with on subquery", () => {
        const query = crud.query(TestClazz);
        query.select(
            x => x.id,
            x => x.description,
            x => x.disabled);
        const subQueryJoinWhere = crud.query(ReferencesModelTest)
            .projection(projection => {
                projection.min(x => x.id);
            })
            .where(where => where.equal(x => x.id, query.ref(x => x.referenceTest.id)))
            .asc(x => x.id)
            .limit(1)
            .compile()[0];
        query.join(ReferencesModelTest,
            on => {
                // TODO: Plan with parameter
                on.equal(x => x.id, new PlanRef(`(${subQueryJoinWhere.query})`));
                on._addParams(subQueryJoinWhere.params);
            },
            join => {
                join.select(x => x.name, x => x.id);
                join.desc(x => x.id);
            });
        const result = query.compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(1);
        expect(result[0].query).to.equal("SELECT tes.id AS id, tes.description AS description, tes.disabled AS disabled, ref.name AS ref_name, ref.id AS ref_id FROM TestClazz AS tes LEFT JOIN ReferencesModelTest AS ref ON (ref.id = (SELECT MIN(ref.id) AS id FROM ReferencesModelTest AS ref WHERE ref.id = tes.referenceTest_id ORDER BY ref.id ASC LIMIT ?)) ORDER BY ref.id DESC");
    });

    it("join with where internal and external", () => {
        const query = crud.query(Estrutura);
        query.projection(projection => {
            projection.wildcard();
        });
        query.where(where => {
            where.equalValue(x => x.deleted, false);
        });
        query.join(Referencia, where => {
            where.equal(x => x.codeImport, query.ref(x => x.referencia.codeImport));
        }, join => {
            join.projection(projection => {
                projection
                    .add(x => x.codeImport)
                    .add(x => x.codigo)
                    .add(x => x.deleted)
                    .add(x => x.descricao);
            });
            join.where(where => {
                where.contains(new ColumnRef(`${join.ref(x => x.codigo).result()} || '|' || ${join.ref(x => x.descricao).result()}`), "likeValor".toUpperCase());
            });
        }, JoinType.LEFT, "ref");
        query.join(Imagem, where => {
            where.equal(x => x.internalKey, query.ref(x => x.imagem.internalKey));
            where.equalValue(x => x.deleted, false);
        }, join => {
            join.projection(projection => {
                projection
                    .add(x => x.internalKey)
                    .add(x => x.data);
            });
        }, JoinType.LEFT, "img");
        query.orderBy(x => x.codeImport);
        const result = query.compile();
        expect(result[0].params.length).to.equal(3);
        expect(result[0].params[0]).to.equal(false);
        expect(result[0].params[1]).to.equal(false);
        expect(result[0].params[2]).to.equal("%LIKEVALOR%");
        expect(result[0].query).to.equal("SELECT est.*, ref.codeImport AS ref_codeImport, ref.codigo AS ref_codigo, ref.deleted AS ref_deleted, ref.descricao AS ref_descricao, img.internalKey AS img_internalKey, img.data AS img_data FROM Estrutura AS est LEFT JOIN Referencia AS ref ON (ref.codeImport = est.referencia_codeImport) LEFT JOIN Imagem AS img ON (img.internalKey = est.imagem_internalKey AND img.deleted = ?) WHERE est.deleted = ? AND ref.codigo || \'|\' || ref.descricao LIKE ? ORDER BY est.codeImport ASC");

    });

    it("join in query", () => {
        const queryJoin = crud.query(ReferencesModelTest);
        const query = crud.query(TestClazz);
        query.select(
            x => x.id,
            x => x.description,
            x => x.disabled);
        query.join(queryJoin,
            on => on.equal(x => x.id, query.ref(x => x.referenceTest.id)),
            join => {
                join.select(x => x.name, x => x.id);
                join.desc(x => x.id);
            }, void 0, "alias_test");
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.id AS id, tes.description AS description, tes.disabled AS disabled, alias_test.name AS alias_test_name, alias_test.id AS alias_test_id FROM TestClazz AS tes LEFT JOIN (SELECT ref.id AS id, ref.name AS name FROM ReferencesModelTest AS ref) AS alias_test ON (alias_test.id = tes.referenceTest_id) ORDER BY alias_test.id DESC");
    });

    it("join in query auto unique alias", () => {
        const queryJoin = crud.query(ReferencesModelTest);
        queryJoin.where(where => where.equal(x => x.id, 1));
        const query = crud.query(TestClazz);
        query.select(
            x => x.id,
            x => x.description,
            x => x.disabled);
        query.join(queryJoin,
            on => on.equal(x => x.id, query.ref(x => x.referenceTest.id)),
            join => {
                join.select(x => x.name, x => x.id);
                join.desc(x => x.id);
            });
        query.where(where => where.equal(x => x.numero, 20));
        const result = query.compile();
        expect(result[0].params.length).to.equal(2);
        expect(result[0].params[0]).to.equal(1);
        expect(result[0].params[1]).to.equal(20);
        expect(result[0].query).to.equal("SELECT tes.id AS id, tes.description AS description, tes.disabled AS disabled, ref0.name AS ref0_name, ref0.id AS ref0_id FROM TestClazz AS tes LEFT JOIN (SELECT ref.id AS id, ref.name AS name FROM ReferencesModelTest AS ref WHERE ref.id = ?) AS ref0 ON (ref0.id = tes.referenceTest_id) WHERE tes.numero = ? ORDER BY ref0.id DESC");
    });

    it("projection static value", () => {
        const query = crud.query(TestClazz);
        query.projection(projection => {
            projection.add(x => x.id);
            projection.add("1", "estatico");
            projection.add(x => x.description);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.id AS id, 1 AS estatico, tes.description AS description FROM TestClazz AS tes");
    });

    it("query change key reference", () => {
        const query = crud.query(ContasAReceber);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT con.versao AS versao, con.idErp AS idErp, con.deleted AS deleted, con.dataVencimento AS dataVencimento, con.valor AS valor, con.dataRecebimento AS dataRecebimento, con.cliente_idErp AS cliente_idErp FROM ContasAReceber AS con");
    });

});
