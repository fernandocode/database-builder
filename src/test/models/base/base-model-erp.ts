import { BaseModelAuditoria } from "./base-model-auditoria";
import { BaseIdErpInterface } from "./base-erp-interface";

export abstract class BaseModelErp extends BaseModelAuditoria implements BaseIdErpInterface{
    public idErp: number;
}