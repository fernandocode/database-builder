import { TestClazz } from "./models/test-clazz";
import { ProjectionsHelper } from "../core/projections-helper";
import { expect } from "chai";
import { PlanRef } from "../core/plan-ref";
import { Operator } from "../crud/enums/operator";
import { TestClazzRef } from "./models/test-clazz-ref";
import { Query } from "../crud/query/query";
import { getMapper } from "./mappers-table-new";

describe("Projections Helper", () => {

    const subQuery = new Query(TestClazzRef,
        {
            getMapper: (t) => {
                return getMapper().get(t);
            },
            mapperTable: getMapper().get(TestClazzRef).mapperTable
        }
    )
        .where(where => where.equal(x => x.id, 2))
        .select(x => x.autoReference.id)
        .limit(1);

    it("exp", () => {
        const helper = new ProjectionsHelper(TestClazz, "__abc");
        const result = helper.exp(x => x.numero)._result();
        expect(result.length).equal(1);
        expect(result[0].projection).equal("__abc.numero");
        expect(result[0].params.length).equal(0);
    });

    it("group", () => {
        const helper = new ProjectionsHelper(TestClazz, "__abc");
        const result = helper.group("__group",
            helper.sum(x => x.referenceTest.id),
            new PlanRef(Operator.Multiply),
            new PlanRef(2)
        )._result();
        expect(result.length).equal(1);
        expect(result[0].projection).equal("(SUM(__abc.referenceTest_id) * 2) AS __group");
        expect(result[0].params.length).equal(0);
    });

    it("concat", () => {
        const helper = new ProjectionsHelper(TestClazz, "__abc");
        const result = helper.concat("__concat", x => x.numero, "||", x => x.id)._result();
        expect(result.length).equal(1);
        expect(result[0].projection).equal("(numero || id) AS __concat");
        expect(result[0].params.length).equal(0);
    });

    it("sum", () => {
        const helper = new ProjectionsHelper(TestClazz, "__abc");
        const result = helper.sum(x => x.id, "__sum")._result();
        expect(result.length).equal(1);
        expect(result[0].projection).equal("SUM(__abc.id) AS __sum");
        expect(result[0].params.length).equal(0);
    });

    it("sum subQuery", () => {
        const helper = new ProjectionsHelper(TestClazz, "__abc");
        const result = helper.sum(subQuery, "__op")._result();
        expect(result.length).equal(1);
        expect(result[0].projection).equal("SUM((SELECT tes.autoReference_id AS autoReference_id FROM TestClazzRef AS tes WHERE tes.id = ? LIMIT ?)) AS __op");
        expect(result[0].params.length).equal(2);
        expect(result[0].params[0]).equal(2);
        expect(result[0].params[1]).equal(1);
    });

    it("max", () => {
        const helper = new ProjectionsHelper(TestClazz, "__abc");
        const result = helper.max(x => x.id, "__op")._result();
        expect(result.length).equal(1);
        expect(result[0].projection).equal("MAX(__abc.id) AS __op");
        expect(result[0].params.length).equal(0);
    });

    it("max subQuery", () => {
        const helper = new ProjectionsHelper(TestClazz, "__abc");
        const result = helper.max(subQuery, "__op")._result();
        expect(result.length).equal(1);
        expect(result[0].projection).equal("MAX((SELECT tes.autoReference_id AS autoReference_id FROM TestClazzRef AS tes WHERE tes.id = ? LIMIT ?)) AS __op");
        expect(result[0].params.length).equal(2);
        expect(result[0].params[0]).equal(2);
        expect(result[0].params[1]).equal(1);
    });

    it("min", () => {
        const helper = new ProjectionsHelper(TestClazz, "__abc");
        const result = helper.min(x => x.id, "__op")._result();
        expect(result.length).equal(1);
        expect(result[0].projection).equal("MIN(__abc.id) AS __op");
        expect(result[0].params.length).equal(0);
    });

    it("min subQuery", () => {
        const helper = new ProjectionsHelper(TestClazz, "__abc");
        const result = helper.min(subQuery, "__op")._result();
        expect(result.length).equal(1);
        expect(result[0].projection).equal("MIN((SELECT tes.autoReference_id AS autoReference_id FROM TestClazzRef AS tes WHERE tes.id = ? LIMIT ?)) AS __op");
        expect(result[0].params.length).equal(2);
        expect(result[0].params[0]).equal(2);
        expect(result[0].params[1]).equal(1);
    });

    it("avg", () => {
        const helper = new ProjectionsHelper(TestClazz, "__abc");
        const result = helper.avg(x => x.id, "__op")._result();
        expect(result.length).equal(1);
        expect(result[0].projection).equal("AVG(__abc.id) AS __op");
        expect(result[0].params.length).equal(0);
    });

    it("avg subQuery", () => {
        const helper = new ProjectionsHelper(TestClazz, "__abc");
        const result = helper.avg(subQuery, "__op")._result();
        expect(result.length).equal(1);
        expect(result[0].projection).equal("AVG((SELECT tes.autoReference_id AS autoReference_id FROM TestClazzRef AS tes WHERE tes.id = ? LIMIT ?)) AS __op");
        expect(result[0].params.length).equal(2);
        expect(result[0].params[0]).equal(2);
        expect(result[0].params[1]).equal(1);
    });

    it("count", () => {
        const helper = new ProjectionsHelper(TestClazz, "__abc");
        const result = helper.count(x => x.id, "__op")._result();
        expect(result.length).equal(1);
        expect(result[0].projection).equal("COUNT(__abc.id) AS __op");
        expect(result[0].params.length).equal(0);
    });

    it("count subQuery", () => {
        const helper = new ProjectionsHelper(TestClazz, "__abc");
        const result = helper.count(subQuery, "__op")._result();
        expect(result.length).equal(1);
        expect(result[0].projection).equal("COUNT((SELECT tes.autoReference_id AS autoReference_id FROM TestClazzRef AS tes WHERE tes.id = ? LIMIT ?)) AS __op");
        expect(result[0].params.length).equal(2);
        expect(result[0].params[0]).equal(2);
        expect(result[0].params[1]).equal(1);
    });

    it("cast", () => {
        const helper = new ProjectionsHelper(TestClazz, "__abc");
        const result = helper.cast(x => x.id, "__op")._result();
        expect(result.length).equal(1);
        expect(result[0].projection).equal("CAST(__abc.id) AS __op");
        expect(result[0].params.length).equal(0);
    });

    it("cast subQuery", () => {
        const helper = new ProjectionsHelper(TestClazz, "__abc");
        const result = helper.cast(subQuery, "__op")._result();
        expect(result.length).equal(1);
        expect(result[0].projection).equal("CAST((SELECT tes.autoReference_id AS autoReference_id FROM TestClazzRef AS tes WHERE tes.id = ? LIMIT ?)) AS __op");
        expect(result[0].params.length).equal(2);
        expect(result[0].params[0]).equal(2);
        expect(result[0].params[1]).equal(1);
    });

    it("distinct", () => {
        const helper = new ProjectionsHelper(TestClazz, "__abc");
        const result = helper.distinct(x => x.id, "__op")._result();
        expect(result.length).equal(1);
        expect(result[0].projection).equal("DISTINCT(__abc.id) AS __op");
        expect(result[0].params.length).equal(0);
    });

    it("distinct subQuery", () => {
        const helper = new ProjectionsHelper(TestClazz, "__abc");
        const result = helper.distinct(subQuery, "__op")._result();
        expect(result.length).equal(1);
        expect(result[0].projection).equal("DISTINCT((SELECT tes.autoReference_id AS autoReference_id FROM TestClazzRef AS tes WHERE tes.id = ? LIMIT ?)) AS __op");
        expect(result[0].params.length).equal(2);
        expect(result[0].params[0]).equal(2);
        expect(result[0].params[1]).equal(1);
    });

    it("round", () => {
        const helper = new ProjectionsHelper(TestClazz, "__abc");
        const result = helper.round(x => x.id, "__op")._result();
        expect(result.length).equal(1);
        expect(result[0].projection).equal("ROUND(__abc.id) AS __op");
        expect(result[0].params.length).equal(0);
    });

    it("round subQuery", () => {
        const helper = new ProjectionsHelper(TestClazz, "__abc");
        const result = helper.round(subQuery, "__op")._result();
        expect(result.length).equal(1);
        expect(result[0].projection).equal("ROUND((SELECT tes.autoReference_id AS autoReference_id FROM TestClazzRef AS tes WHERE tes.id = ? LIMIT ?)) AS __op");
        expect(result[0].params.length).equal(2);
        expect(result[0].params[0]).equal(2);
        expect(result[0].params[1]).equal(1);
    });

    it("coalesce", () => {
        const helper = new ProjectionsHelper(TestClazz, "__abc");
        const result = helper.coalesce(x => x.id, [12], "__op")._result();
        expect(result.length).equal(1);
        expect(result[0].projection).equal("COALESCE(__abc.id, ?) AS __op");
        expect(result[0].params.length).equal(1);
        expect(result[0].params[0]).equal(12);
    });

    it("coalesce subQuery", () => {
        const helper = new ProjectionsHelper(TestClazz, "__abc");
        const result = helper.coalesce(subQuery, [23], "__op")._result();
        expect(result.length).equal(1);
        expect(result[0].projection).equal("COALESCE((SELECT tes.autoReference_id AS autoReference_id FROM TestClazzRef AS tes WHERE tes.id = ? LIMIT ?), ?) AS __op");
        expect(result[0].params.length).equal(3);
        expect(result[0].params[0]).equal(2);
        expect(result[0].params[1]).equal(1);
        expect(result[0].params[2]).equal(23);
    });
});