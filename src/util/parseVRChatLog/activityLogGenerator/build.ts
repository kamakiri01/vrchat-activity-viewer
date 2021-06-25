import { CheckBuildActivityLog, ActivityType } from "../../..";
import { parseSquareBrackets } from "../reg";

export function createCheckBuildActivityLog(utcTime: number, message: string): CheckBuildActivityLog {
    const reg = parseSquareBrackets(message)!; // [VRCApplicationSetup]
    const activity: CheckBuildActivityLog = {
        date: utcTime,
        activityType: ActivityType.CheckBuild,
        buildName: /^VRChat Build: ([\w\-.\s]+), \w+/.exec(reg[3])![1]
    };
    return activity;
}
