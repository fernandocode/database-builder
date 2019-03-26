import { BaseKey } from "./base-key";

export class BaseModel<TKey> extends BaseKey {
        public codeImport: TKey;
        constructor() {
                super();
        }
}
