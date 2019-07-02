import { Moment } from "./moment-definition";

export class DatabaseTypes {
    public static Moment: (new () => any) = Moment;
    public static DateString: (new () => any) = Moment;
}