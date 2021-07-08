import { ActivityType, MoveActivityLog } from "../../..";
import { parseSquareBrackets } from "../reg";

export function createJoinActivityLog(utcTime: number, message: string): MoveActivityLog {
    const reg = parseSquareBrackets(message)!; // [NetworkManager]
    const activity: MoveActivityLog = {
        date: utcTime,
        activityType: ActivityType.Join,
        userData: {
            userName: /^OnPlayerJoined\s(.+)/.exec(reg[3])![1]
        }
    };
    return activity;
}
