import * as moment from "moment";
import { DatabaseBuilderError } from "./core/errors";
import { Utils } from "./core/utils";

export class DatetimeUtils {

    public static datetimeToDatabase(date: moment.Moment | number): number {
        if (date) {
            if (Utils.isNumber(date)) {
                return date as number;
            }
            if (!(date as moment.Moment).unix) {
                throw new DatabaseBuilderError("Date format incorrect");
            }
            if ((date as moment.Moment).utcOffset) {
                if ((date as moment.Moment).utcOffset() !== 0) {
                    throw new DatabaseBuilderError("Date with utc offset not supported create date using DatetimeUtils.now() for date current or DatetimeUtils.datetimeIgnoreTimeZone({date}) for especific date");
                }
                return this.datetimeIgnoreTimeZone(date as moment.Moment).unix();
            }
            return (date as moment.Moment).unix();
        }
        return void 0;
    }

    public static datetimeIgnoreTimeZone(date: moment.Moment): moment.Moment {
        return moment(date).utc().add(date.utcOffset(), "m");
    }

    public static now(): moment.Moment {
        return this.datetimeIgnoreTimeZone(moment());
    }

    public static dateToDatabase(date: any): number {
        return this.datetimeToDate(date).unix();
    }

    public static datetimeToDate(date: any): moment.Moment {
        return moment.utc(moment.utc(date).toISOString(), "YYYY-MM-DD");
    }

    public static databaseToDatetime(unix: number) {
        if (unix) {
            return moment.utc(unix * 1000);
        }
        return void 0;
    }
}
