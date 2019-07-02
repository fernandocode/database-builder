import { TestClazzRefCode } from "./test-clazz-ref-code";
import { TestClazzRef } from "./test-clazz-ref";
import * as moment from "moment";
import { BaseKey } from "./base-key";

export class TestClazz extends BaseKey {
    public id: number = 0;
    public description: string = "";
    public referenceTest: TestClazzRef = new TestClazzRef();
    public disabled: boolean = false;
    public date: number = 0;
    public dateStr: string;
    public dateMoment: moment.Moment = moment();
    public dateDate: Date = new Date();
    public numero = 0;
    public referenceTestCode: TestClazzRefCode = new TestClazzRefCode();
}
