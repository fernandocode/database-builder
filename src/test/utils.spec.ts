import { Utils } from "./../core/utils";
import { expect } from "chai";
import { ExpressionOrValueEnum } from "../core/enums/expression-or-value-enum";

describe("Utils", () => {

    it("expressionOrValue", () => {
        const valueString = Utils.expressionOrValue("");
        const valueNumeric = Utils.expressionOrValue(0);
        const valueUndefined = Utils.expressionOrValue(undefined);
        const valueVoid0 = Utils.expressionOrValue(void 0);
        const valueNull = Utils.expressionOrValue(null);
        expect(valueString).equal(ExpressionOrValueEnum.Value);
        expect(valueNumeric).equal(ExpressionOrValueEnum.Value);
        expect(valueUndefined).equal(ExpressionOrValueEnum.Null);
        expect(valueVoid0).equal(ExpressionOrValueEnum.Null);
        expect(valueNull).equal(ExpressionOrValueEnum.Null);
    });

});