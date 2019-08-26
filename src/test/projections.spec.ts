import { Operator } from "../crud/enums/operator";
import { TestClazzRef } from "./models/test-clazz-ref";
import { expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import { getMapper } from "./mappers-table-new";
import { Crud } from "../crud/crud";
import { ReferencesModelTest } from "./models/reference-model-test";

describe("Projections", () => {

    const crud = new Crud({} as any, getMapper());

    it("default", () => {
        const query = crud.query(TestClazz);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes");
    });

    it("default explicit call", () => {
        const query = crud.query(TestClazz);
        query.projection(select => select.all());
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes");
    });

    it("select all with restriction", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.all();
            select.remove(x => x.numero);
            select.remove(x => x.referenceTest.id);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes");
    });

    it("default explicit columns", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.allByMap(getMapper().get(TestClazz));
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes");
    });

    it("add column", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.add(x => x.description);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.description AS description FROM TestClazz AS tes");
    });

    it("add column with alias", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.add(x => x.description, "abc");
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.description AS abc FROM TestClazz AS tes");
    });

    it("column", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.column("description");
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.description AS description FROM TestClazz AS tes");
    });

    it("columns", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.columns(x => x.description, x => x.id, x => x.referenceTest.id);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.description AS description, tes.id AS id, tes.referenceTest_id AS referenceTest_id FROM TestClazz AS tes");
    });

    it("avg", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.avg(x => x.id);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT AVG(tes.id) AS id FROM TestClazz AS tes");
    });

    it("round avg", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.avgRound(x => x.id);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT ROUND(AVG(tes.id)) AS id FROM TestClazz AS tes");
    });

    it("round avg (stacked)", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.round().avg(x => x.id);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT ROUND(AVG(tes.id)) AS id FROM TestClazz AS tes");
    });

    it("case (and group and projection)", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.case((caseInstance) => {
                caseInstance.when(
                    query.createWhere()
                        .great(select.proj().sum(x => x.referenceTest.id), 1),
                    (when) => {
                        when.then(
                            select.proj().group(
                                "",
                                select.proj().sum(x => x.referenceTest.id),
                                select.plan(Operator.Multiply),
                                select.plan(2)
                            )
                        ).else(0);
                    }
                );
            }, void 0, "referenceTest");
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(1);
        expect(result[0].query).to.equal("SELECT CASE WHEN SUM(tes.referenceTest_id) > ? THEN (SUM(tes.referenceTest_id) * 2) ELSE 0 END AS referenceTest FROM TestClazz AS tes");
    });

    it("cast", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.cast(x => x.id);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT CAST(tes.id) AS id FROM TestClazz AS tes");
    });

    it("coalesce", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.coalesce(x => x.id);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT COALESCE(tes.id) AS id FROM TestClazz AS tes");
    });

    it("coalesce projection", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.coalesceP(x => x.sum(x => x.id), 0, "id");
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT COALESCE(SUM(tes.id), 0) AS id FROM TestClazz AS tes");
    });

    it("coalesce builder", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            expect(select.coalesceBuilder(x => x.id, 2)).to.equal("COALESCE(tes.id, 2)");
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes");
    });

    it("count", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.count(x => x.id);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT COUNT(tes.id) AS id FROM TestClazz AS tes");
    });

    it("count distinct", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.countDistinct(x => x.id);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT COUNT(DISTINCT(tes.id)) AS id FROM TestClazz AS tes");
    });

    it("count distinct (stacked)", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.count().distinct(x => x.id);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT COUNT(DISTINCT(tes.id)) AS id FROM TestClazz AS tes");
    });

    it("distinct", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.distinct(x => x.id);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT DISTINCT(tes.id) AS id FROM TestClazz AS tes");
    });

    it("group (and projection)", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.group(
                "groupT",
                select.proj().sum(x => x.referenceTest.id),
                select.plan(Operator.Multiply),
                select.plan(2)
            );
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT (SUM(tes.referenceTest_id) * 2) AS groupT FROM TestClazz AS tes");
    });

    it("max", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.max(x => x.id);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT MAX(tes.id) AS id FROM TestClazz AS tes");
    });

    it("min", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.min(x => x.id);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT MIN(tes.id) AS id FROM TestClazz AS tes");
    });

    it("subQuery", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.subQuery(
                crud.query(TestClazzRef, "tcr")
                    .projection(s => s.min(x => x.description))
                    .where(where =>
                        where
                            .equal(x => x.id, query.ref(x => x.referenceTest.id))
                            .equal(x => x.description, "a")
                    ),
                "referenceTest_description"
            );
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal("a");
        expect(result[0].query).to.equal("SELECT (SELECT MIN(tcr.description) AS description FROM TestClazzRef AS tcr WHERE tcr.id = tes.referenceTest_id AND tcr.description = ?) AS referenceTest_description FROM TestClazz AS tes");
    });

    it("sum", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.sum(x => x.id);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT SUM(tes.id) AS id FROM TestClazz AS tes");
    });

    it("multi projections", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.add(x => x.description);
            select.sum(x => x.id);
            select.max(x => x.referenceTest.id);
            select.count(x => x.id, "countId");
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.description AS description, SUM(tes.id) AS id, MAX(tes.referenceTest_id) AS referenceTest_id, COUNT(tes.id) AS countId FROM TestClazz AS tes");
    });

    it("stacked projections", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.sum().count().distinct(x => x.id, "test_id");
            select.avg().max().distinct().min().count(x => x.referenceTest.id);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT SUM(COUNT(DISTINCT(tes.id))) AS test_id, AVG(MAX(DISTINCT(MIN(COUNT(tes.referenceTest_id))))) AS referenceTest_id FROM TestClazz AS tes");
    });

    it("ref string", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            const ref = select.ref("id");
            expect(ref.result()).to.equal("tes.id");
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes");
    });

    it("ref expression", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            const ref = select.ref(x => x.id);
            expect(ref.result()).to.equal("tes.id");
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code, tes.dateStr AS dateStr FROM TestClazz AS tes");
    });

    it("add with ref", () => {
        const query = crud.query(TestClazz);
        query.projection(select => {
            select.add(`strftime('%m', datetime(${select.ref(x => x.date).result()}, 'unixepoch'))`, "month");
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT strftime('%m', datetime(tes.date, 'unixepoch')) AS month FROM TestClazz AS tes");
    });

    it("join", () => {
        const query = crud.query(TestClazz);
        query.select(
            x => x.id,
            x => x.description,
            x => x.disabled);
        query.join(ReferencesModelTest,
            on => on.equal(x => x.id, query.ref(x => x.referenceTest.id)),
            join => {
                join.projection(projection => {
                    projection.add(x => x.name);
                    projection.add(x => x.id);
                });
                // join.select(x => x.name, x => x.id);
                join.desc(x => x.id);
            });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.id AS id, tes.description AS description, tes.disabled AS disabled, ref.name AS ref_name, ref.id AS ref_id FROM TestClazz AS tes LEFT JOIN ReferencesModelTest AS ref ON (ref.id = tes.referenceTest_id) ORDER BY ref.id DESC");
    });

});
