import { JoinQueryBuilder } from "./../crud/query/join-query-builder";
import { ReferencesModelTest } from "./models/reference-model-test";
import { expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import * as moment from "moment";
import { Crud } from "../crud/crud";
import { getMapper } from "./mappers-table-new";

describe("Where", () => {

    const crud = new Crud({} as any, getMapper());

    it("none", () => {
        const query = crud.query(TestClazz);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes");
    });

    it("simple", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.equal(x => x.id, 2);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id = ?");
    });

    it("value is null", () => {
        const query = crud.query(TestClazz);
        const idParam: number = void 0;
        query.where(where => {
            where.equal(x => x.id, idParam);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id IS NULL");
    });

    it("value is not null", () => {
        const query = crud.query(TestClazz);
        const idParam: number = void 0;
        query.where(where => {
            where.not().equal(x => x.id, idParam);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id IS NOT NULL");
    });

    it("column string", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.equal(query.ref("id"), 2);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id = ?");
    });

    it("multi", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.equal(x => x.id, 2);
            where.equal(x => x.id, x => x.referenceTest.id);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id = ? AND tes.id = tes.referenceTest_id");
    });

    it("multi and", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.equal(x => x.id, 2)
                .and()
                .equal(x => x.id, x => x.referenceTest.id);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id = ? AND tes.id = tes.referenceTest_id");
    });

    it("multi or", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.equal(x => x.id, 2)
                .or()
                .equal(x => x.id, x => x.referenceTest.id);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id = ? OR tes.id = tes.referenceTest_id");
    });

    it("compare to value", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.equal(x => x.id, 2);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id = ?");
    });

    it("compare to value (deprecated)", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.equalValue(x => x.id, 2);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id = ?");
    });

    it("compare to column", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.equal(x => x.id, where.ref("referenceTest_id"));
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id = tes.referenceTest_id");
    });

    it("compare to column (deprecated)", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.equalColumn(x => x.id, "referenceTest_id");
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id = tes.referenceTest_id");
    });

    it("compare to column (ref secundary ref)", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.equal(x => x.id, where.ref("referenceTest_id", "abc"));
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id = abc.referenceTest_id");
    });

    it("simple cross", () => {
        const query1 = crud.query(TestClazz);
        query1.where(where => {
            where.equalValue(x => x.id, 2);
            where.equalColumn(x => x.id, "referenceTest_id");
        });
        const result1 = query1.compile();

        const query2 = crud.query(TestClazz);
        query2.where(where => {
            where.equal(x => x.id, 2);
            where.equal(x => x.id, x => x.referenceTest.id);
        });
        const result2 = query2.compile();

        expect(result1[0].params.length).to.equal(result2[0].params.length);
        expect(result1[0].params[0]).to.equal(result2[0].params[0]);
        expect(result1[0].query).to.equal(result2[0].query);
    });

    it("scope", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.equal(x => x.id, 2)
                .equal(x => x.id, x => x.referenceTest.id)
                .or()
                .scope(scope => {
                    scope.equal(x => x.description, "this value")
                        .or()
                        .equal(false, x => x.disabled);
                });
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(3);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].params[1]).to.equal("this value");
        expect(result[0].params[2]).to.equal(false);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id = ? AND tes.id = tes.referenceTest_id OR (tes.description = ? OR ? = tes.disabled)");
    });

    it("equal", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.equal(x => x.id, 2)
                .equal(x => x.id, x => x.referenceTest.id)
                .not().equal(x => x.description, where.ref("disabled"))
                .or()
                .scope(scope => {
                    scope.equal(x => x.description, "this value")
                        .or()
                        .equal(false, x => x.disabled);
                });
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(3);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].params[1]).to.equal("this value");
        expect(result[0].params[2]).to.equal(false);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id = ? AND tes.id = tes.referenceTest_id AND tes.description <> tes.disabled OR (tes.description = ? OR ? = tes.disabled)");
    });

    it("great", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.great(x => x.id, 2)
                .great(x => x.id, x => x.referenceTest.id)
                .not().great(x => x.description, where.ref("disabled"))
                .or()
                .scope(scope => {
                    scope.great(x => x.description, "this value")
                        .or()
                        .great(false, x => x.disabled);
                });
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(3);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].params[1]).to.equal("this value");
        expect(result[0].params[2]).to.equal(false);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id > ? AND tes.id > tes.referenceTest_id AND tes.description <= tes.disabled OR (tes.description > ? OR ? > tes.disabled)");
    });

    it("less", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.less(x => x.id, 2)
                .less(x => x.id, x => x.referenceTest.id)
                .not().less(x => x.description, where.ref("disabled"))
                .or()
                .scope(scope => {
                    scope.less(x => x.description, "this value")
                        .or()
                        .less(false, x => x.disabled);
                });
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(3);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].params[1]).to.equal("this value");
        expect(result[0].params[2]).to.equal(false);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id < ? AND tes.id < tes.referenceTest_id AND tes.description >= tes.disabled OR (tes.description < ? OR ? < tes.disabled)");
    });

    it("lessAndEqual", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.lessAndEqual(x => x.id, 2)
                .lessAndEqual(x => x.id, x => x.referenceTest.id)
                .not().lessAndEqual(x => x.description, where.ref("disabled"))
                .or()
                .scope(scope => {
                    scope.lessAndEqual(x => x.description, "this value")
                        .or()
                        .lessAndEqual(false, x => x.disabled);
                });
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(3);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].params[1]).to.equal("this value");
        expect(result[0].params[2]).to.equal(false);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id <= ? AND tes.id <= tes.referenceTest_id AND tes.description > tes.disabled OR (tes.description <= ? OR ? <= tes.disabled)");
    });

    it("greatAndEqual", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.greatAndEqual(x => x.id, 2)
                .greatAndEqual(x => x.id, x => x.referenceTest.id)
                .not().greatAndEqual(x => x.description, where.ref("disabled"))
                .or()
                .scope(scope => {
                    scope.greatAndEqual(x => x.description, "this value")
                        .or()
                        .greatAndEqual(false, x => x.disabled);
                });
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(3);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].params[1]).to.equal("this value");
        expect(result[0].params[2]).to.equal(false);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id >= ? AND tes.id >= tes.referenceTest_id AND tes.description < tes.disabled OR (tes.description >= ? OR ? >= tes.disabled)");
    });

    it("contains", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.not().contains(x => x.id, "2")
                .or()
                .scope(scope => {
                    scope.contains(x => x.description, "this value")
                        .or()
                        .contains(x => x.disabled, "false");
                });
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(3);
        expect(result[0].params[0]).to.equal("%2%");
        expect(result[0].params[1]).to.equal("%this value%");
        expect(result[0].params[2]).to.equal("%false%");
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id NOT LIKE ? OR (tes.description LIKE ? OR tes.disabled LIKE ?)");
    });

    it("startsWith", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.not().startsWith(x => x.id, "2")
                .or()
                .scope(scope => {
                    scope.startsWith(x => x.description, "this value")
                        .or()
                        .startsWith(x => x.disabled, "false");
                });
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(3);
        expect(result[0].params[0]).to.equal("2%");
        expect(result[0].params[1]).to.equal("this value%");
        expect(result[0].params[2]).to.equal("false%");
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id NOT LIKE ? OR (tes.description LIKE ? OR tes.disabled LIKE ?)");
    });

    it("endsWith", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.not().endsWith(x => x.id, "2")
                .or()
                .scope(scope => {
                    scope.endsWith(x => x.description, "this value")
                        .or()
                        .endsWith(x => x.disabled, "false");
                });
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(3);
        expect(result[0].params[0]).to.equal("%2");
        expect(result[0].params[1]).to.equal("%this value");
        expect(result[0].params[2]).to.equal("%false");
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id NOT LIKE ? OR (tes.description LIKE ? OR tes.disabled LIKE ?)");
    });

    it("like", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.not().like(x => x.id, "%2%")
                .or()
                .scope(scope => {
                    scope.like(x => x.description, "%this value")
                        .or()
                        .like(x => x.disabled, "false%");
                });
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(3);
        expect(result[0].params[0]).to.equal("%2%");
        expect(result[0].params[1]).to.equal("%this value");
        expect(result[0].params[2]).to.equal("false%");
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id NOT LIKE ? OR (tes.description LIKE ? OR tes.disabled LIKE ?)");
    });

    it("is (not) null", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.isNull(x => x.id)
                .not().isNull(x => x.description);
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id IS NULL AND tes.description IS NOT NULL");
    });

    it("between", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            // number
            where.not().between(x => x.id, 2, 4)
                .or()
                .scope(scope => {
                    // string
                    scope.between(x => x.description, "this value", "b")
                        .or()
                        // boolean
                        .between(x => x.disabled, false, true);
                })
                .and()
                // moment
                .between(x => x.dateMoment,
                    moment.utc(`2001-1-20`, "YYYY-MM-DD"),
                    moment.utc(`2001-7-13`, "YYYY-MM-DD"))
                ;
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(8);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].params[1]).to.equal(4);
        expect(result[0].params[2]).to.equal("this value");
        expect(result[0].params[3]).to.equal("b");
        expect(result[0].params[4]).to.equal(false);
        expect(result[0].params[5]).to.equal(true);
        expect(result[0].params[6]).to.equal(979948800);
        expect(result[0].params[7]).to.equal(994982400);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id NOT BETWEEN ? AND ? OR (tes.description BETWEEN ? AND ? OR tes.disabled BETWEEN ? AND ?) AND tes.dateMoment BETWEEN ? AND ?");
    });

    // it("between columns", () => {
    //     const query = crud.query(TestClazz);
    //     query.select(x => x.id);
    //     query.where(where => {
    //         where.between(0.5, query.ref(x => x.date).result(), query.ref(x => x.numero).result())
    //         where.between(0.2, x => x.date, x => x.numero)
    //     });
    //     const result = query.compile();
    //     console.log(result);
    //     expect(result[0].params.length).to.equal(4);
    //     expect(result[0].params[0]).to.equal(0.5);
    //     expect(result[0].params[1]).to.equal("tes.date");
    //     expect(result[0].params[2]).to.equal("tes.numero");
    //     expect(result[0].params[3]).to.equal(0.2);
    //     expect(result[0].query).to.equal("SELECT tes.id AS id FROM TestClazz AS tes WHERE ? BETWEEN ? AND ? AND ? BETWEEN tes.date AND tes.numero");
    // });

    it("between (deprecated)", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.not().betweenValue(x => x.id, 2, 4)
                .or()
                .scope(scope => {
                    scope.betweenValue(x => x.description, "this value", "b")
                        .or()
                        .betweenValue(x => x.disabled, false, true);
                });
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(6);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].params[1]).to.equal(4);
        expect(result[0].params[2]).to.equal("this value");
        expect(result[0].params[3]).to.equal("b");
        expect(result[0].params[4]).to.equal(false);
        expect(result[0].params[5]).to.equal(true);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id NOT BETWEEN ? AND ? OR (tes.description BETWEEN ? AND ? OR tes.disabled BETWEEN ? AND ?)");
    });

    it("in", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.not().in(x => x.id, [2, 4, 7, 1000])
                .in(x => x.referenceTest.id,
                    crud.query(ReferencesModelTest)
                        .select(x => x.id)
                        .where(w => w.equal(x => x.name, "AbC"))
                )
                .or()
                .scope(scope => {
                    scope.in(x => x.description, ["this value", "b"])
                        .or()
                        .in(x => x.disabled, [false]);
                });
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(8);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].params[1]).to.equal(4);
        expect(result[0].params[2]).to.equal(7);
        expect(result[0].params[3]).to.equal(1000);
        expect(result[0].params[4]).to.equal("AbC");
        expect(result[0].params[5]).to.equal("this value");
        expect(result[0].params[6]).to.equal("b");
        expect(result[0].params[7]).to.equal(false);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id NOT IN (?, ?, ?, ?) AND tes.referenceTest_id IN (SELECT ref.id AS id FROM ReferencesModelTest AS ref WHERE ref.name = ?) OR (tes.description IN (?, ?) OR tes.disabled IN (?))");
    });

    it("in (deprecated)", () => {
        const query = crud.query(TestClazz);
        query.where(where => {
            where.not().inValues(x => x.id, [2, 4, 7, 1000])
                .inSelect(x => x.referenceTest.id,
                    crud.query(ReferencesModelTest)
                        .select(x => x.id)
                        .where(w => w.equal(x => x.name, "AbC"))
                )
                .or()
                .scope(scope => {
                    scope.inValues(x => x.description, ["this value", "b"])
                        .or()
                        .inValues(x => x.disabled, [false]);
                });
        });
        const result = query.compile();
        expect(result[0].params.length).to.equal(8);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].params[1]).to.equal(4);
        expect(result[0].params[2]).to.equal(7);
        expect(result[0].params[3]).to.equal(1000);
        expect(result[0].params[4]).to.equal("AbC");
        expect(result[0].params[5]).to.equal("this value");
        expect(result[0].params[6]).to.equal("b");
        expect(result[0].params[7]).to.equal(false);
        expect(result[0].query).to.equal("SELECT tes.internalKey AS internalKey, tes.id AS id, tes.description AS description, tes.date AS date, tes.dateMoment AS dateMoment, tes.dateDate AS dateDate, tes.numero AS numero, tes.referenceTest_id AS referenceTest_id, tes.referenceTestCode_code AS referenceTestCode_code FROM TestClazz AS tes WHERE tes.id NOT IN (?, ?, ?, ?) AND tes.referenceTest_id IN (SELECT ref.id AS id FROM ReferencesModelTest AS ref WHERE ref.name = ?) OR (tes.description IN (?, ?) OR tes.disabled IN (?))");
    });

    it("projection concat 1", () => {
        const query = crud.query(TestClazz);
        query
            .projection(projection => {
                projection.group("iddescription", projection.proj().exp(x => x.id),
                    projection.plan("||"), projection.proj().exp(x => x.description));
            })
            .where(where => {
                where.equal(x => x.id, 2);
            });
        const result = query.compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].query).to.equal("SELECT (tes.id || tes.description) AS iddescription FROM TestClazz AS tes WHERE tes.id = ?");
    });

    it("projection concat 2", () => {
        const query = crud.query(TestClazz);
        query
            .projection(projection => {
                projection.group("iddescription", projection.ref(x => x.id), "||", projection.ref(x => x.description));
            })
            .where(where => {
                where.equal(x => x.id, 2);
            });
        const result = query.compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].query).to.equal("SELECT (tes.id || tes.description) AS iddescription FROM TestClazz AS tes WHERE tes.id = ?");
    });

    it("projection concat cross query", () => {
        const query = crud.query(TestClazz);
        let joinReferenceModelTest: JoinQueryBuilder<ReferencesModelTest>;
        query.join(ReferencesModelTest,
            on => on.equal(x => x.id, query.ref(x => x.referenceTest.id)),
            join => {
                joinReferenceModelTest = join;
            });
        query
            .projection(projection => {
                projection.group("idname", projection.ref(x => x.id), "||", joinReferenceModelTest.ref(x => x.name));
            })
            .where(where => {
                where.equal(x => x.id, 2);
            });
        const result = query.compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(2);
        expect(result[0].query).to.equal("SELECT (tes.id || ref.name) AS idname FROM TestClazz AS tes LEFT JOIN ReferencesModelTest AS ref ON (ref.id = tes.referenceTest_id) WHERE tes.id = ?");
    });

    it("where concat", () => {
        const query = crud.query(TestClazz);
        query
            .projection(projection => {
                projection.group("iddescription", projection.ref(x => x.id), "||", projection.ref(x => x.description));
            })
            .where(where => {
                where.equal(where.concat(where.ref(x => x.id), "||", where.ref(x => x.description)), 2 + "isso");
            });
        const result = query.compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal("2isso");
        expect(result[0].query).to.equal("SELECT (tes.id || tes.description) AS iddescription FROM TestClazz AS tes WHERE (tes.id || tes.description) = ?");
    });

});
