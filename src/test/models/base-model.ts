import { BaseKey } from "./base-key";

export class BaseModel<TKey> extends BaseKey {
        constructor(public id: TKey) {
                super();
        }
}
