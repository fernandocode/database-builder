import { expect } from "chai";
import { ModelUtils } from "../core/model-utils";

describe("ModelUtils", () => {
    const _null: any = null;
    const _undefined: any = void 0;

    const sourceObjIdZero = { id: 0 };
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