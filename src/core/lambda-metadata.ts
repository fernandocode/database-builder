import { Condition } from "../crud/enums/condition";

export interface LambdaMetadata {
    left: string;
    condition: Condition[];
    right: string;
}
