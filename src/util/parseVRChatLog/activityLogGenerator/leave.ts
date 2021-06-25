import { MoveActivityLog, ActivityType } from "../..";
import { parseSquareBrackets } from "../parseVRChatLog/reg";

export function createLeaveActivityLog(utcTime: number, message: string): MoveActivityLog {
    const reg = parseSquareBrackets(message)!; // [NetworkManager]
    const activity: MoveActivityLog = {
        date: utcTime,
        activityType: ActivityType.Leave,
        userData: {
            userName: /^OnPlayerLeft\s(.+)/.exec(reg[3])![1]
        }
    };
    return activity;
}
