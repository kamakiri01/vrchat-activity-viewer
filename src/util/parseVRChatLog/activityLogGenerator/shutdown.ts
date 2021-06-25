import { ShutdownActivityLog, ActivityType } from "../../..";

export function createShutdownActivityLog(utcTime: number, message: string): ShutdownActivityLog {
    const activity: ShutdownActivityLog = {
        date: utcTime,
        activityType: ActivityType.Shutdown
    }
    return activity;
}
