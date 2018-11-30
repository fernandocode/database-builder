import { DatabaseConfig } from "./database-config";
import { DatabaseObject } from "./database-definition";

export interface DatabaseCreatorContract {
    create(config: DatabaseConfig): Promise<DatabaseObject>;
}
