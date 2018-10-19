import { BaseKey } from "./base-key";

export class Imagem extends BaseKey {
    public urlBase64: string = "";
    public tipoImagem: string = "";
    public etiquetaBase64: string = "";
    public deleted: boolean = false;
}