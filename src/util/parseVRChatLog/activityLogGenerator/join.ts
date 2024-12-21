import { ActivityType, MoveActivityLog } from "../../..";
import { parseSquareBrackets } from "../parseUtil";

export function createJoinActivityLog(utcTime: number, message: string): MoveActivityLog {
    const messageText = parseSquareBrackets(message)!.message; // [Player] or [Behaviour]
    const reg = /OnPlayerJoined (.+) \((.+)\)/.exec(messageText)!;
    const activity: MoveActivityLog = {
        date: utcTime,
        activityType: ActivityType.Join,
        userData: {
            userName: reg[1],
            userId: reg[2]
        }
    };
    return activity;
}
