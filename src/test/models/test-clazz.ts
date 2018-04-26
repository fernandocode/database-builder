import { TestClazzRef } from "./test-clazz-ref";
import * as moment from "moment";

export class TestClazz {
    public id: number = 0;
    public description: string = "";
    public referenceTest: TestClazzRef = new TestClazzRef();
    public disabled: boolean = false;
    public date: number = 0;
    public dateMoment: moment.Moment = moment();
}
