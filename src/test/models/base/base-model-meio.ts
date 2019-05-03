import { BaseModelAuditoria } from "./base-model-auditoria";
import { BaseIdMeioInterface } from "./base-meio-interface";

export abstract class BaseModelMeio extends BaseModelAuditoria implements BaseIdMeioInterface {
    public idMeio: number;
}