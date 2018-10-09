import { PlanRef } from "./../core/plan-ref";
import { ReferencesModelTest } from "./models/reference-model-test";
import { expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import { ColumnRef } from "../core/column-ref";
import { Query } from "../crud/query/query";
import { JoinType } from "../crud/enums/join-type";
import { Cliente } from "./models/cliente";
import { Cidade } from "./models/cidade";
import { Uf } from "./models/uf";
import { JoinQueryBuilder } from "../crud/query/join-query-builder";

describe("Query", () => {

    it("none", () => {
        const query = new Query(TestClazz);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.* FROM TestClazz AS tes");
    });

    it("join default (LEFT)", () => {
        const query = new Query(TestClazz);
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

    it("join (LEFT)", () => {
        const query = new Query(TestClazz);
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
        const query = new Query(TestClazz);
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
        const query = new Query(TestClazz);
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
        const query = new Query(TestClazz);
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
        const query = new Query(TestClazz, "p");
        query.from(
            new Query(ReferencesModelTest)
                .select(x => x.id, x => x.name)
                .where(w => w.equal(x => x.name, "AbC"))
        );
        query.where(where => where.great(x => x.id, 2));
        const result = query.compile();
        expect(result[0].params.length).to.equal(2);
        expect(result[0].params[0]).to.equal("AbC");
        expect(result[0].params[1]).to.equal(2);
        expect(result[0].query).to.equal("SELECT p.* FROM (SELECT ref.id AS id, ref.name AS name FROM ReferencesModelTest AS ref WHERE ref.name = ?) AS p WHERE p.id > ?");
    });

    it("union", () => {
        const query = new Query(TestClazz, "p");
        query.union(
            new Query(ReferencesModelTest)
                .select(x => x.id, x => x.name)
                .where(w => w.equal(x => x.name, "AbC"))
        );
        query.where(where => where.great(x => x.id, 2));
        const result = query.compile();
        expect(result[0].params.length).to.equal(2);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].params[1]).to.equal("AbC");
        expect(result[0].query).to.equal("SELECT p.* FROM TestClazz AS p WHERE p.id > ? UNION SELECT ref.id AS id, ref.name AS name FROM ReferencesModelTest AS ref WHERE ref.name = ?");
    });

    it("union all", () => {
        const query = new Query(TestClazz, "p");
        query.unionAll(
            new Query(ReferencesModelTest)
                .select(x => x.id, x => x.name)
                .where(w => w.equal(x => x.name, "AbC"))
        );
        query.where(where => where.great(x => x.id, 2));
        const result = query.compile();
        expect(result[0].params.length).to.equal(2);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].params[1]).to.equal("AbC");
        expect(result[0].query).to.equal("SELECT p.* FROM TestClazz AS p WHERE p.id > ? UNION ALL SELECT ref.id AS id, ref.name AS name FROM ReferencesModelTest AS ref WHERE ref.name = ?");
    });

    it("union all and union", () => {
        const query = new Query(TestClazz, "p");
        query.unionAll(
            new Query(ReferencesModelTest)
                .select(x => x.id, x => x.name)
                .where(w => w.equal(x => x.name, "AbC"))
        );
        query.union(
            new Query(ReferencesModelTest)
                .select(x => x.id)
                .where(w => w.equal(x => x.id, 10))
        );
        query.where(where => where.great(x => x.id, 2));
        const result = query.compile();
        expect(result[0].params.length).to.equal(3);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].params[1]).to.equal("AbC");
        expect(result[0].params[2]).to.equal(10);
        expect(result[0].query).to.equal("SELECT p.* FROM TestClazz AS p WHERE p.id > ? UNION ALL SELECT ref.id AS id, ref.name AS name FROM ReferencesModelTest AS ref WHERE ref.name = ? UNION SELECT ref.id AS id FROM ReferencesModelTest AS ref WHERE ref.id = ?");
    });

    it("join where concat columns", () => {
        const query = new Query(TestClazz);
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

    it("join linked", () => {
        const query = new Query(Cliente);
        let joinCidade: JoinQueryBuilder<Cidade>;
        query
            .select(
                x => x.cidade.codeImport,
                x => x.apelido,
                x => x.razaoSocial,
                x => x.codeImport
            )
            .projection(projection => {
                projection.add(x => x.desativo, "inativo");
            })
            .where(where => {
                where.not().equalValue(x => x.razaoSocial, "ABC");
                where.greatAndEqualValue(x => x.codeImport, 10);
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
        expect(result[0].query).to.equal(`SELECT cli.cidade_codeImport AS cidade_codeImport, cli.apelido AS apelido, cli.razaoSocial AS razaoSocial, cli.codeImport AS codeImport, cli.desativo AS inativo, cid.nome AS cidade_nome, cid.codeImport AS cid_codeImport, uf.nome AS uf_nome FROM Cliente AS cli LEFT JOIN Cidade AS cid ON (cid.codeImport = cli.cidade_codeImport) LEFT JOIN Uf AS uf ON (uf.codeImport = cid.uf_codeImport) WHERE cli.razaoSocial <> ? AND cli.codeImport >= ?`);
    });

    it("join with on subquery", () => {
        const query = new Query(TestClazz);
        query.select(
            x => x.id,
            x => x.description,
            x => x.disabled);
        const subQueryJoinWhere = new Query(ReferencesModelTest)
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

});
