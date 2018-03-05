import { Operator } from "./../crud/enums/operator";
import { Projection } from "./../crud/enums/projection";
import { TestClazzRef } from "./models/test-clazz-ref";
import { assert, expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import { MappersTable } from "./mappers-table";
import { Query } from "./../crud/query/query";
import { ProjectionsHelper } from "../core/projections-helper";

const mappersTable = new MappersTable();

describe("Projections", () => {

    it("default", () => {
        const query = new Query(TestClazz);
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT tes.* FROM TestClazz AS tes");
    });

    it("default explicit call", () => {
        const query = new Query(TestClazz);
        query.select(select => select.all());
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT tes.* FROM TestClazz AS tes");
    });

    it("default explicit columns", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            select.allByMap(mappersTable.getMapper(TestClazz));
        });
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT tes.id AS id, tes.description AS description, tes.disabled AS disabled, tes.referenceTest_id AS referenceTest_id FROM TestClazz AS tes");
    });

    it("add column", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            select.add(x => x.description);
        });
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT tes.description AS description FROM TestClazz AS tes");
    });

    it("column", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            select.column("description");
        });
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT tes.description AS description FROM TestClazz AS tes");
    });

    it("columns", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            select.columns(x => x.description, x => x.id, x => x.referenceTest.id);
        });
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT tes.description AS description, tes.id AS id, tes.referenceTest_id AS referenceTest_id FROM TestClazz AS tes");
    });

    it("avg", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            select.avg(x => x.id);
        });
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT AVG(tes.id) AS id FROM TestClazz AS tes");
    });

    it("round avg", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            select.avgRound(x => x.id);
        });
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT ROUND(AVG(tes.id)) AS id FROM TestClazz AS tes");
    });

    it("round avg (stacked)", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            select.round().avg(x => x.id);
        });
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT ROUND(AVG(tes.id)) AS id FROM TestClazz AS tes");
    });

    it("case (and group and projection)", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            select.case((caseInstance) => {
                caseInstance.when(
                    query.createWhere()
                        .great(select.proj().sum(x => x.referenceTest.id), 1),
                    // .great(new ProjectionsHelper<TestClazz>(TestClazz, query.alias(), false).sum(x => x.referenceTest.id), 1),
                    // .great(select.create().projection(Projection.Sum, x => x.referenceTest.id), 1),
                    // .greatValue(select.create().projection(Projection.Sum, x => x.referenceTest.id).projection, 1),
                    (when) => {
                        when.then(
                            select.proj().group(
                                "",
                                select.proj().sum(x => x.referenceTest.id),
                                // select.projection(Projection.Sum, x => x.referenceTest.id),
                                select.plan(Operator.Multiply),
                                select.plan(2)
                            )
                            // select.create().group(
                            //     "",
                            //     select.projection(Projection.Sum, x => x.referenceTest.id),
                            //     Operator.Multiply,
                            //     2
                            // )
                        ).else(0);
                    }
                );
            }, void 0, "referenceTest");
        });
        const result = query.compile();
        expect(result.params.length).to.equal(1);
        expect(result.params[0]).to.equal(1);
        expect(result.query).to.equal("SELECT CASE WHEN SUM(tes.referenceTest_id) > ? THEN (SUM(tes.referenceTest_id) * 2) ELSE 0 END AS referenceTest FROM TestClazz AS tes");
    });

    it("cast", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            select.cast(x => x.id);
        });
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT CAST(tes.id) AS id FROM TestClazz AS tes");
    });

    it("coalesce", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            select.coalesce(x => x.id);
        });
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT COALESCE(tes.id) AS id FROM TestClazz AS tes");
    });

    it("coalesce builder", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            expect(select.coalesceBuilder(x => x.id, 2)).to.equal("COALESCE(tes.id, 2)");
        });
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT tes.* FROM TestClazz AS tes");
    });

    it("count", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            select.count(x => x.id);
        });
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT COUNT(tes.id) AS id FROM TestClazz AS tes");
    });

    it("count distinct", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            select.countDistinct(x => x.id);
        });
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT COUNT(DISTINCT(tes.id)) AS id FROM TestClazz AS tes");
    });

    it("count distinct (stacked)", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            select.count().distinct(x => x.id);
        });
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT COUNT(DISTINCT(tes.id)) AS id FROM TestClazz AS tes");
    });

    it("distinct", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            select.distinct(x => x.id);
        });
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT DISTINCT(tes.id) AS id FROM TestClazz AS tes");
    });

    it("group (and projection)", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            select.group(
                "groupT",
                select.proj().sum(x => x.referenceTest.id),
                select.plan(Operator.Multiply),
                select.plan(2)
            );
            // select.group(
            //     "groupT",
            //     select.projection(Projection.Sum, x => x.referenceTest.id),
            //     Operator.Multiply,
            //     2
            // );
        });
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT (SUM(tes.referenceTest_id) * 2) AS groupT FROM TestClazz AS tes");
    });

    it("max", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            select.max(x => x.id);
        });
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT MAX(tes.id) AS id FROM TestClazz AS tes");
    });

    it("min", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            select.min(x => x.id);
        });
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT MIN(tes.id) AS id FROM TestClazz AS tes");
    });

    it("subQuery", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            select.subQuery(
                new Query(TestClazzRef, "tcr")
                    .select(s => s.min(x => x.description))
                    .where(where =>
                        // where.equalColumn(x => x.id, query.ref(x => x.referenceTest.id)))
                        where.equal(x => x.id, query.ref2(x => x.referenceTest.id)))
                    // where.equal(x => x.id, query.ref(x => x.referenceTest.id)))
                    .compile(),
                "referenceTest_description"
            );
        });
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT (SELECT MIN(tcr.description) AS description FROM TestClazzRef AS tcr WHERE tcr.id = tes.referenceTest_id) AS referenceTest_description FROM TestClazz AS tes");
    });

    it("sum", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            select.sum(x => x.id);
        });
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT SUM(tes.id) AS id FROM TestClazz AS tes");
    });

    it("multi projections", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            select.add(x => x.description);
            select.sum(x => x.id);
            select.max(x => x.referenceTest.id);
            select.count(x => x.id, "countId");
        });
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT tes.description AS description, SUM(tes.id) AS id, MAX(tes.referenceTest_id) AS referenceTest_id, COUNT(tes.id) AS countId FROM TestClazz AS tes");
    });

    it("stacked projections", () => {
        const query = new Query(TestClazz);
        query.select(select => {
            select.sum().count().distinct(x => x.id, "test_id");
            select.avg().max().distinct().min().count(x => x.referenceTest.id);
        });
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT SUM(COUNT(DISTINCT(tes.id))) AS test_id, AVG(MAX(DISTINCT(MIN(COUNT(tes.referenceTest_id))))) AS referenceTest_id FROM TestClazz AS tes");
    });

});
