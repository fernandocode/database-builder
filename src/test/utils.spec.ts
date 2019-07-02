import { Utils } from "./../core/utils";
import { expect } from "chai";
import { ExpressionOrValueEnum } from "../core/enums/expression-or-value-enum";
import moment = require("moment");
import { FieldType } from "../core/enums/field-type";

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

    it("isValueNumber boolean", () => {
        const trueIsNumber = Utils.isValueNumber(true);
        const falseIsNumber = Utils.isValueNumber(false);
        expect(trueIsNumber).equal(false);
        expect(falseIsNumber).equal(false);
    });

    it("isValueNumber date", () => {
        const dateNowIsNumber = Utils.isValueNumber(new Date());
        expect(dateNowIsNumber).equal(false);
    });

    it("isValueNumber moment", () => {
        const momentIsNumber = Utils.isValueNumber(moment());
        const momentUtcIsNumber = Utils.isValueNumber(moment.utc());
        expect(momentIsNumber).equal(false);
        expect(momentUtcIsNumber).equal(false);
    });

    it("isValueNumber number", () => {
        const negativeIsNumber = Utils.isValueNumber(-1);
        const zeroIsNumber = Utils.isValueNumber(0);
        const positiveIsNumber = Utils.isValueNumber(1);
        expect(negativeIsNumber).equal(true);
        expect(zeroIsNumber).equal(true);
        expect(positiveIsNumber).equal(true);
    });

    it("isValueNumber string", () => {
        const stringEmptyIsNumber = Utils.isValueNumber("");
        const stringNormalIsNumber = Utils.isValueNumber("abc");
        const stringValueNumberPositiveIsNumber = Utils.isValueNumber("1");
        const stringValueNumberZeroIsNumber = Utils.isValueNumber("0");
        const stringValueNumberNegativeIsNumber = Utils.isValueNumber("-1");
        expect(stringEmptyIsNumber).equal(false);
        expect(stringNormalIsNumber).equal(false);
        expect(stringValueNumberPositiveIsNumber).equal(true);
        expect(stringValueNumberZeroIsNumber).equal(true);
        expect(stringValueNumberNegativeIsNumber).equal(true);
    });

    it("isValueNumber nullables", () => {
        const nullIsNumber = Utils.isValueNumber(null);
        const undefinedIsNumber = Utils.isValueNumber(void 0);
        const naNIsNumber = Utils.isValueNumber(NaN);
        expect(nullIsNumber).equal(false);
        expect(undefinedIsNumber).equal(false);
        expect(naNIsNumber).equal(true);
    });

    it("GUID", () => {
        const guid = Utils.GUID();
        expect(guid.length).equal(36);
    });

    it("isArray", () => {
        const arrayEmptyIsArray = Utils.isArray([]);
        const arrayOfNumberIsArray = Utils.isArray([1]);
        const arrayOfStringIsArray = Utils.isArray([""]);
        const arrayOfBooleanIsArray = Utils.isArray([true]);
        const arrayOfObjectIsArray = Utils.isArray([{}]);
        const arrayOfArrayIsArray = Utils.isArray([[]]);
        const numberIsArray = Utils.isArray(1);
        const stringEmptyIsArray = Utils.isArray("");
        const stringIsArray = Utils.isArray("abc");
        const booleanIsArray = Utils.isArray(true);
        const objectIsArray = Utils.isArray({});
        expect(arrayEmptyIsArray).equal(true);
        expect(arrayOfNumberIsArray).equal(true);
        expect(arrayOfStringIsArray).equal(true);
        expect(arrayOfBooleanIsArray).equal(true);
        expect(arrayOfObjectIsArray).equal(true);
        expect(arrayOfArrayIsArray).equal(true);
        expect(numberIsArray).equal(false);
        expect(stringEmptyIsArray).equal(false);
        expect(stringIsArray).equal(false);
        expect(booleanIsArray).equal(false);
        expect(objectIsArray).equal(false);
    });

    it("getValueType Datetime", () => {
        const valueZ = Utils.getValueType("2018-06-08T00:00:00Z", FieldType.DATE);
        const valueTimeZoneNegative = Utils.getValueType("2018-06-08T00:00:00-03:00", FieldType.DATE);
        const valueTimeZonePositive = Utils.getValueType("2018-06-08T00:00:00-03:00", FieldType.DATE);
        const valueZWithoutSeparators = Utils.getValueType("20180608T000000Z", FieldType.DATE);
        const valueWithoutTimeZone = Utils.getValueType("2018-06-08T00:00:00", FieldType.DATE);
        const valueWithoutTime = Utils.getValueType("2018-06-08", FieldType.DATE);
        expect(valueZ).equal(1528416000);
        expect(valueTimeZoneNegative).equal(1528416000);
        expect(valueTimeZonePositive).equal(1528416000);
        expect(valueZWithoutSeparators).equal(1528416000);
        expect(valueWithoutTimeZone).equal(1528416000);
        expect(valueWithoutTime).equal(1528416000);
    });
});