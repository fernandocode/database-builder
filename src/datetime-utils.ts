import * as moment from "moment";
import { DatabaseBuilderError } from "./core/errors";
import { Utils } from "./core/utils";

export class DatetimeUtils {

    public static datetimeToDatabase(date: moment.Moment | number | Date | string): number {
        if (date) {
            if (Utils.isNumber(date)) {
                return date as number;
            }
            if (Utils.isDate(date)) {
                return Math.round(((date as Date).getTime() - ((date as Date).getTimezoneOffset() * 60000)) / 1000);
            }
            if (Utils.isString(date) && /^(\d{4})-(\d{2})-(\d{2})(T(\d{2})\:(\d{2})\:(\d{2}))?((([+-](\d{2})\:(\d{2}))|Z{1})?)$/gm.test(date as string)) {
                return this.datetimeToDatabase(this.createDatetime(date));
            }
            if (!(date as moment.Moment).unix) {
                throw new DatabaseBuilderError(`Date format incorrect, value: ${date}`);
            }
            if ((date as moment.Moment).utcOffset) {
                if ((date as moment.Moment).utcOffset() !== 0) {
                    throw new DatabaseBuilderError(`Date with utc(${(date as moment.Moment).utcOffset()}) offset not supported create date using DatetimeUtils.now() for date current or DatetimeUtils.datetimeIgnoreTimeZone({date}) for especific date`);
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

    public static datetimeIgnoreTimeZoneDate(date: Date): Date {
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - userTimezoneOffset);
    }

    public static now(): moment.Moment {
        return this.datetimeIgnoreTimeZone(moment());
    }

    public static nowDate(): Date {
        return this.datetimeIgnoreTimeZoneDate(new Date());
    }

    public static dateToDatabase(date: any): number {
        return this.datetimeToDate(date).unix();
    }

    public static createDatetime(date: any): moment.Moment {
        return this.datetimeIgnoreTimeZone(moment.utc(date));
    }

    public static datetimeToDate(date: any): moment.Moment {
        return moment.utc(this.createDatetime(date).toISOString(), "YYYY-MM-DD");
    }

    public static databaseToDatetime(unix: number) {
        if (unix) {
            return moment.utc(unix * 1000);
        }
        return void 0;
    }
}
