import { ActivityType, MoveActivityLog } from "../../..";
import { PlayerAPIAccess } from "../../../type/ActivityLogType/moveType";
import { parseSquareBrackets } from "../reg";

export function createJoinActivityLog(utcTime: number, message: string): MoveActivityLog {
    const messageText = parseSquareBrackets(message)!; // [NetworkManager]
    const reg = /^Initialized PlayerAPI "(.+)" is (local|remote)/.exec(messageText[3])!;
    const activity: MoveActivityLog = {
        date: utcTime,
        activityType: ActivityType.Join,
        userData: {
            userName: reg[1],
            access: reg[2] as PlayerAPIAccess
        }
    };
    return activity;
}
