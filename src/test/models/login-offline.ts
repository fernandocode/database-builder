import { BaseKey } from "./base-key";

export class LoginOffline extends BaseKey {

    public id: number = 0;
    public hash: string = "";
    // public user: Usuario = new Usuario();
    public permissions: string[] = [];
}
