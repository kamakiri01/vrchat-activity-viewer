import { ShutdownActivityLog, ActivityType } from "../..";

export function createShutdownActivityLog(utcTime: number, message: string) {
    const activity: ShutdownActivityLog = {
        date: utcTime,
        activityType: ActivityType.Shutdown
    }
    return activity;
}
