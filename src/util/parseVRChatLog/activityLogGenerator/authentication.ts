import { AuthenticationActivityLog, ActivityType } from "../../..";
import { parseSquareBrackets } from "../reg";

export function createAuthenticationActivityLog(utcTime: number, message: string): AuthenticationActivityLog {
    const reg = parseSquareBrackets(message)!; // [VRCFlowManagerVRC]
    const activity: AuthenticationActivityLog = {
        date: utcTime,
        activityType: ActivityType.Authentication,
        userName: /^User Authenticated:\s(.+)/.exec(reg[3])![1]
    };
    return activity;
}
