import { ReferencesModelTest } from "./models/reference-model-test";
import { expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import { JoinType, Query } from "..";

describe("Query", () => {

    it("none", () => {
        const query = new Query(TestClazz);
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT tes.* FROM TestClazz AS tes");
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
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT tes.id AS id, tes.description AS description, tes.disabled AS disabled, ref.name AS ref_name, ref.id AS ref_id FROM TestClazz AS tes LEFT JOIN ReferencesModelTest AS ref ON (ref.id = tes.referenceTest_id) ORDER BY ref.id DESC");
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
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT tes.id AS id, tes.description AS description, tes.disabled AS disabled, ref.name AS ref_name, ref.id AS ref_id FROM TestClazz AS tes LEFT JOIN ReferencesModelTest AS ref ON (ref.id = tes.referenceTest_id) ORDER BY ref.id DESC");
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
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT tes.id AS id, tes.description AS description, tes.disabled AS disabled, ref.name AS ref_name, ref.id AS ref_id FROM TestClazz AS tes RIGHT JOIN ReferencesModelTest AS ref ON (ref.id = tes.referenceTest_id) ORDER BY ref.id DESC");
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
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT tes.id AS id, tes.description AS description, tes.disabled AS disabled, ref.name AS ref_name, ref.id AS ref_id FROM TestClazz AS tes INNER JOIN ReferencesModelTest AS ref ON (ref.id = tes.referenceTest_id) ORDER BY ref.id DESC");
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
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT tes.id AS id, tes.description AS description, tes.disabled AS disabled, ref.name AS ref_name, ref.id AS ref_id FROM TestClazz AS tes FULL OUTER JOIN ReferencesModelTest AS ref ON (ref.id = tes.referenceTest_id) ORDER BY ref.id DESC");
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
        expect(result.params.length).to.equal(2);
        expect(result.params[0]).to.equal("AbC");
        expect(result.params[1]).to.equal(2);
        expect(result.query).to.equal("SELECT p.* FROM (SELECT ref.id AS id, ref.name AS name FROM ReferencesModelTest AS ref WHERE ref.name = ?) AS p WHERE p.id > ?");
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
        expect(result.params.length).to.equal(2);
        expect(result.params[0]).to.equal(2);
        expect(result.params[1]).to.equal("AbC");
        expect(result.query).to.equal("SELECT p.* FROM TestClazz AS p WHERE p.id > ? UNION SELECT ref.id AS id, ref.name AS name FROM ReferencesModelTest AS ref WHERE ref.name = ?");
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
        expect(result.params.length).to.equal(2);
        expect(result.params[0]).to.equal(2);
        expect(result.params[1]).to.equal("AbC");
        expect(result.query).to.equal("SELECT p.* FROM TestClazz AS p WHERE p.id > ? UNION ALL SELECT ref.id AS id, ref.name AS name FROM ReferencesModelTest AS ref WHERE ref.name = ?");
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
        expect(result.params.length).to.equal(3);
        expect(result.params[0]).to.equal(2);
        expect(result.params[1]).to.equal("AbC");
        expect(result.params[2]).to.equal(10);
        expect(result.query).to.equal("SELECT p.* FROM TestClazz AS p WHERE p.id > ? UNION ALL SELECT ref.id AS id, ref.name AS name FROM ReferencesModelTest AS ref WHERE ref.name = ? UNION SELECT ref.id AS id FROM ReferencesModelTest AS ref WHERE ref.id = ?");
    });

});
