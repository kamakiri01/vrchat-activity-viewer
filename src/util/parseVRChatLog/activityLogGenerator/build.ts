import { CheckBuildActivityLog, ActivityType } from "../../..";
import { parseSquareBrackets } from "../reg";

export function createCheckBuildActivityLog(utcTime: number, buildLine: string): CheckBuildActivityLog {
    const reg = /VRChat Build: ([\w\-.\s]+)/.exec(buildLine)!;
    const activity: CheckBuildActivityLog = {
        date: utcTime,
        activityType: ActivityType.CheckBuild,
        buildName: reg[1]
    };
    return activity;
}
