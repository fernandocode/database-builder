import { BaseAuditoriaInterface } from "./base-auditoria-interface";

export abstract class BaseModelAuditoria implements BaseAuditoriaInterface {
    public versao: number;
    // está sendo incializado com false, mas se tiver que iniciar com undefined terá que ser tratado todos os where deleted da aplicação
    public deleted: boolean = false;
}