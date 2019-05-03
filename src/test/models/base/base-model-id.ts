import { BaseIdInterface } from "./base-id-interface";
import { BaseModelErp } from "./base-model-erp";

export abstract class BaseModelId extends BaseModelErp implements BaseIdInterface<string> {
    public id: string;
    public change: boolean;
}