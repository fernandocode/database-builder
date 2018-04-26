import { TestClazzRef } from "./test-clazz-ref";

export class TestClazz {
    public id: number = 0;
    public description: string = "";
    public referenceTest: TestClazzRef = new TestClazzRef();
    public disabled: boolean = false;
    public date: number = 0;
}
