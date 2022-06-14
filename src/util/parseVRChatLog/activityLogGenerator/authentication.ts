import { AuthenticationActivityLog, ActivityType } from "../../..";
import { parseSquareBrackets } from "../parseUtil";

export function createAuthenticationActivityLog(utcTime: number, message: string): AuthenticationActivityLog {
    const messageText = parseSquareBrackets(message)!.message; // [Behavior]
    const activity: AuthenticationActivityLog = {
        date: utcTime,
        activityType: ActivityType.Authentication,
        userName: /^User Authenticated: (.+)/.exec(messageText)![1]
    };
    return activity;
}
