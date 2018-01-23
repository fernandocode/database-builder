import { ReferencesModelTest } from "./reference-model-test";

export class ModelTest {
    public id: number;
    public name: string;
    public description: string;
    public date: Date;
    public isValid: boolean;
    public reference: ReferencesModelTest;
}
