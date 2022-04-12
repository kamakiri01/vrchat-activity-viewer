import { ActivityType, MoveActivityLog } from "../../..";
import { PlayerAPIAccessType } from "../../../type/activityLogType/moveType";
import { parseSquareBrackets } from "../parseUtil";

export function createJoinActivityLog(utcTime: number, message: string): MoveActivityLog {
    const messageText = parseSquareBrackets(message)!; // [NetworkManager]
    const reg = /^Initialized PlayerAPI "(.+)" is (local|remote)/.exec(messageText[3])!;
    const activity: MoveActivityLog = {
        date: utcTime,
        activityType: ActivityType.Join,
        userData: {
            userName: reg[1],
            access: reg[2] as PlayerAPIAccessType
        }
    };
    return activity;
}
