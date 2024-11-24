import { MoveActivityLog, ActivityType } from "../../..";
import { parseSquareBrackets } from "../parseUtil";

export function createLeaveActivityLog(utcTime: number, message: string): MoveActivityLog {
    const messageText = parseSquareBrackets(message)!.message; // [NetworkManager] or [Behavior]
    const reg = /OnPlayerLeft (.+) \((.+)\)/.exec(messageText)!;

    const activity: MoveActivityLog = {
        date: utcTime,
        activityType: ActivityType.Leave,
        userData: {
            userName: reg[1],
            userId: reg[2]
        }
    };
    return activity;
}
