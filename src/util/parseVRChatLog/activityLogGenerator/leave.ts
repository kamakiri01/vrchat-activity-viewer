import { MoveActivityLog, ActivityType } from "../../..";
import { parseSquareBrackets } from "../parseUtil";

export function createLeaveActivityLog(utcTime: number, message: string): MoveActivityLog {
    const messageText = parseSquareBrackets(message)!.message; // [NetworkManager] or [Behavior]
    const activity: MoveActivityLog = {
        date: utcTime,
        activityType: ActivityType.Leave,
        userData: {
            userName: /^OnPlayerLeft (.+)/.exec(messageText)![1]
        }
    };
    return activity;
}
