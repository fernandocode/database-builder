import { expect } from "chai";
import { ModelUtils } from "../core/model-utils";
import { Utils } from "../core/utils";
import moment = require("moment");

describe("ModelUtils", () => {
    const _null: any = null;
    const _undefined: any = void 0;

    const sourceObjIdZero = { id: 0 };
    const sourceObjValuesDefaults = {
        b: Utils.DEFAULT_VALUES.BOOLEAN,
        d: Utils.DEFAULT_VALUES.DATE,
        m: Utils.DEFAULT_VALUES.MOMENT,
        n: Utils.DEFAULT_VALUES.NUMBER,
        s: Utils.DEFAULT_VALUES.STRING
    };
    const sourceObjValuesDefaultsNull = {
        b: _null,
        d: _null,
        m: _null,
        n: _null,
        s: _null
    };
    const sourceObjEmpty = {};
    const sourceObjIdNull = { id: _null };
    const sourceObjIdUndefined = { id: _undefined };

    it("Merge Id zero with undefined explicit", () => {
        const mergeIdZeroWithUndefinedExplicit = ModelUtils.mergeOverrideEmpty(Object.assign({}, sourceObjIdZero), sourceObjIdUndefined);
        expect(mergeIdZeroWithUndefinedExplicit.id).equal(sourceObjIdZero.id);
    });

    it("Merge Id zero with null explicit", () => {
        const mergeIdZeroWithNullExplicit = ModelUtils.mergeOverrideEmpty(Object.assign({}, sourceObjIdZero), sourceObjIdNull);
        expect(mergeIdZeroWithNullExplicit.id).equal(sourceObjIdZero.id);
    });

    it("Merge Id zero with object empty", () => {
        const mergeIdZeroWithNull = ModelUtils.mergeOverrideEmpty(Object.assign({}, sourceObjIdZero), sourceObjEmpty);
        expect(mergeIdZeroWithNull.id).equal(sourceObjIdZero.id);
    });

    it("Merge object values default with object values default null", () => {
        const mergeIdZeroWithNull = ModelUtils.mergeOverrideEmpty(Object.assign({}, sourceObjValuesDefaults), sourceObjValuesDefaultsNull);
        expect(mergeIdZeroWithNull.b).equal(sourceObjValuesDefaults.b);
        expect(mergeIdZeroWithNull.d).equal(sourceObjValuesDefaults.d);
        expect(mergeIdZeroWithNull.m).equal(sourceObjValuesDefaults.m);
        expect(mergeIdZeroWithNull.n).equal(sourceObjValuesDefaults.n);
        expect(mergeIdZeroWithNull.s).equal(sourceObjValuesDefaults.s);
    });

    // Testes merge values com to tipo "boolean"
    it("mergeValues boolean with null", () => {
        const resultMerge = ModelUtils.mergeValues(Utils.DEFAULT_VALUES.BOOLEAN, null);
        expect(resultMerge).equal(Utils.DEFAULT_VALUES.BOOLEAN);
    });

    it("mergeValues null with boolean", () => {
        const resultMerge = ModelUtils.mergeValues(null, Utils.DEFAULT_VALUES.BOOLEAN);
        expect(resultMerge).equal(Utils.DEFAULT_VALUES.BOOLEAN);
    });

    it("mergeValues boolean with undefined", () => {
        const resultMerge = ModelUtils.mergeValues(true, void 0);
        expect(resultMerge).equal(true);
    });

    it("mergeValues undefined with boolean", () => {
        const resultMerge = ModelUtils.mergeValues(void 0, true);
        expect(resultMerge).equal(true);
    });

    it("mergeValues boolean with NaN", () => {
        const resultMerge = ModelUtils.mergeValues(Utils.DEFAULT_VALUES.BOOLEAN, NaN);
        expect(resultMerge).equal(Utils.DEFAULT_VALUES.BOOLEAN);
    });

    it("mergeValues NaN with boolean", () => {
        const resultMerge = ModelUtils.mergeValues(NaN, Utils.DEFAULT_VALUES.BOOLEAN);
        expect(resultMerge).equal(Utils.DEFAULT_VALUES.BOOLEAN);
    });

    it("mergeValues boolean default not override", () => {
        const resultMerge = ModelUtils.mergeValues(true, Utils.DEFAULT_VALUES.BOOLEAN);
        expect(resultMerge).equal(true);
    });

    it("mergeValues boolean default override", () => {
        const resultMerge = ModelUtils.mergeValues(Utils.DEFAULT_VALUES.BOOLEAN, true);
        expect(resultMerge).equal(true);
    });

    // Testes merge values com to tipo "Date"
    const dateNowTest = new Date(2019, 2, 2);
    const dateTest = new Date(2019, 2, 1);

    it("mergeValues Date with null", () => {
        const resultMerge = ModelUtils.mergeValues(dateNowTest, null);
        expect(resultMerge).equal(dateNowTest);
    });

    it("mergeValues null with Date", () => {
        const resultMerge = ModelUtils.mergeValues(null, dateNowTest);
        expect(resultMerge).equal(dateNowTest);
    });

    it("mergeValues Date with undefined", () => {
        const resultMerge = ModelUtils.mergeValues(dateNowTest, void 0);
        expect(resultMerge).equal(dateNowTest);
    });

    it("mergeValues undefined with Date", () => {
        const resultMerge = ModelUtils.mergeValues(void 0, dateNowTest);
        expect(resultMerge).equal(dateNowTest);
    });

    it("mergeValues Date with NaN", () => {
        const resultMerge = ModelUtils.mergeValues(dateNowTest, NaN);
        expect(resultMerge).equal(dateNowTest);
    });

    it("mergeValues NaN with Date", () => {
        const resultMerge = ModelUtils.mergeValues(NaN, dateNowTest);
        expect(resultMerge).equal(dateNowTest);
    });

    it("mergeValues Date override default not override", () => {
        const resultMerge = ModelUtils.mergeValues(dateNowTest, dateTest);
        expect(resultMerge).equal(dateTest);
    });

    it("mergeValues Date default override", () => {
        const resultMerge = ModelUtils.mergeValues(dateTest, dateNowTest);
        expect(resultMerge).equal(dateNowTest);
    });

    // Testes merge values com to tipo "moment"
    const momentNowTest = moment([2019, 2, 2]);
    const momentTest = moment([2019, 2, 1]);

    it("mergeValues moment with null", () => {
        const resultMerge = ModelUtils.mergeValues(momentNowTest, null);
        expect(resultMerge).equal(momentNowTest);
    });

    it("mergeValues null with moment", () => {
        const resultMerge = ModelUtils.mergeValues(null, momentNowTest);
        expect(resultMerge).equal(momentNowTest);
    });

    it("mergeValues moment with undefined", () => {
        const resultMerge = ModelUtils.mergeValues(momentNowTest, void 0);
        expect(resultMerge).equal(momentNowTest);
    });

    it("mergeValues undefined with moment", () => {
        const resultMerge = ModelUtils.mergeValues(void 0, momentNowTest);
        expect(resultMerge).equal(momentNowTest);
    });

    it("mergeValues moment with NaN", () => {
        const resultMerge = ModelUtils.mergeValues(momentNowTest, NaN);
        expect(resultMerge).equal(momentNowTest);
    });

    it("mergeValues NaN with moment", () => {
        const resultMerge = ModelUtils.mergeValues(NaN, momentNowTest);
        expect(resultMerge).equal(momentNowTest);
    });

    it("mergeValues_Date_override default not override", () => {
        const resultMerge = ModelUtils.mergeValues(momentNowTest, momentTest);
        expect(resultMerge).equal(momentTest);
    });

    it("mergeValues moment default override", () => {
        const resultMerge = ModelUtils.mergeValues(momentTest, momentNowTest);
        expect(resultMerge).equal(momentNowTest);
    });

    // Testes merge values com to tipo "string"
    it("mergeValues string with null", () => {
        const resultMerge = ModelUtils.mergeValues(Utils.DEFAULT_VALUES.STRING, null);
        expect(resultMerge).equal(Utils.DEFAULT_VALUES.STRING);
    });

    it("mergeValues null with string", () => {
        const resultMerge = ModelUtils.mergeValues(null, Utils.DEFAULT_VALUES.STRING);
        expect(resultMerge).equal(Utils.DEFAULT_VALUES.STRING);
    });

    it("mergeValues string with undefined", () => {
        const resultMerge = ModelUtils.mergeValues(Utils.DEFAULT_VALUES.STRING, void 0);
        expect(resultMerge).equal(Utils.DEFAULT_VALUES.STRING);
    });

    it("mergeValues undefined with string", () => {
        const resultMerge = ModelUtils.mergeValues(void 0, Utils.DEFAULT_VALUES.STRING);
        expect(resultMerge).equal(Utils.DEFAULT_VALUES.STRING);
    });

    it("mergeValues string with NaN", () => {
        const resultMerge = ModelUtils.mergeValues(Utils.DEFAULT_VALUES.STRING, NaN);
        expect(resultMerge).equal(Utils.DEFAULT_VALUES.STRING);
    });

    it("mergeValues NaN with string", () => {
        const resultMerge = ModelUtils.mergeValues(NaN, Utils.DEFAULT_VALUES.STRING);
        expect(resultMerge).equal(Utils.DEFAULT_VALUES.STRING);
    });

    it("mergeValues string default not override", () => {
        const resultMerge = ModelUtils.mergeValues("valor", Utils.DEFAULT_VALUES.STRING);
        expect(resultMerge).equal("valor");
    });

    it("mergeValues string default override", () => {
        const resultMerge = ModelUtils.mergeValues(Utils.DEFAULT_VALUES.STRING, "valor");
        expect(resultMerge).equal("valor");
    });

    // Testes merge values com to tipo "number"
    it("mergeValues number with null", () => {
        const resultMerge = ModelUtils.mergeValues(Utils.DEFAULT_VALUES.NUMBER, null);
        expect(resultMerge).equal(Utils.DEFAULT_VALUES.NUMBER);
    });

    it("mergeValues null with number", () => {
        const resultMerge = ModelUtils.mergeValues(null, Utils.DEFAULT_VALUES.NUMBER);
        expect(resultMerge).equal(Utils.DEFAULT_VALUES.NUMBER);
    });

    it("mergeValues number with undefined", () => {
        const resultMerge = ModelUtils.mergeValues(Utils.DEFAULT_VALUES.NUMBER, void 0);
        expect(resultMerge).equal(Utils.DEFAULT_VALUES.NUMBER);
    });

    it("mergeValues undefined with number", () => {
        const resultMerge = ModelUtils.mergeValues(void 0, Utils.DEFAULT_VALUES.NUMBER);
        expect(resultMerge).equal(Utils.DEFAULT_VALUES.NUMBER);
    });

    it("mergeValues number with NaN", () => {
        const resultMerge = ModelUtils.mergeValues(Utils.DEFAULT_VALUES.NUMBER, NaN);
        expect(resultMerge).equal(Utils.DEFAULT_VALUES.NUMBER);
    });

    it("mergeValues NaN with number", () => {
        const resultMerge = ModelUtils.mergeValues(NaN, Utils.DEFAULT_VALUES.NUMBER);
        expect(resultMerge).equal(Utils.DEFAULT_VALUES.NUMBER);
    });

    it("mergeValues number default not override", () => {
        const resultMerge = ModelUtils.mergeValues(1, Utils.DEFAULT_VALUES.NUMBER);
        expect(resultMerge).equal(1);
    });

    it("mergeValues number default override", () => {
        const resultMerge = ModelUtils.mergeValues(Utils.DEFAULT_VALUES.NUMBER, 1);
        expect(resultMerge).equal(1);
    });

    it("Get and Set (simple)", () => {
        const paramsTest = {
            property: "nome",
            value: "Fernando"
        };
        const result = ModelUtils.set(Object.assign({}, sourceObjEmpty), paramsTest.property, paramsTest.value);
        expect(ModelUtils.get(result, paramsTest.property)).equal(paramsTest.value);
    });

    it("Get and Set (property deep)", () => {
        const paramsTest = {
            property: "uf.nome",
            value: "Santa Catarina"
        };
        const result = ModelUtils.set(Object.assign({}, sourceObjEmpty), paramsTest.property, paramsTest.value);
        expect(ModelUtils.get(result, paramsTest.property)).equal(paramsTest.value);
    });

    it("Get and Set (property object)", () => {
        const paramsTest = {
            property: "uf",
            value: {
                nome: "Santa Catarina"
            }
        };
        const result = ModelUtils.set(Object.assign({}, sourceObjEmpty), paramsTest.property, paramsTest.value);
        expect(ModelUtils.get(result, paramsTest.property).nome).equal(paramsTest.value.nome);
    });

    it("Get and Set (property deep object)", () => {
        const paramsTest = {
            property: "subRegiao.regiao",
            value: {
                nome: "Sul do Brasil"
            }
        };
        const result = ModelUtils.set(Object.assign({}, sourceObjEmpty), paramsTest.property, paramsTest.value);
        expect(ModelUtils.get(result, paramsTest.property).nome).equal(paramsTest.value.nome);
    });

    it("Update (property deep object)", () => {
        const paramsTest = {
            property: "subRegiao.regiao",
            value: {
                nome: "Sul do Brasil"
            }
        };
        const result = ModelUtils.update(Object.assign({}, sourceObjEmpty), paramsTest.property, (v) => ModelUtils.mergeOverrideEmpty(v, paramsTest.value));
        expect(ModelUtils.get(result, paramsTest.property).nome).equal(paramsTest.value.nome);
    });

});