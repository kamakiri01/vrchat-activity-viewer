import { WorldEnterInfo, EnterActivityLog, ActivityType } from "../../..";
import { parseSquareBrackets } from "../reg";

export function createEnterActivityLog(utcTime: number, message: string, worldInfo: WorldEnterInfo): EnterActivityLog {
    const reg = parseSquareBrackets(message)!; // [RoomManager]
    const activity: EnterActivityLog = {
        date: utcTime,
        activityType: ActivityType.Enter,
        worldData: {
            worldName: /^Entering\sRoom:\s(.+)/.exec(reg[3])![1],
            worldId: worldInfo.worldId,
            instanceId: worldInfo.instanceId,
            access: worldInfo.access,
            instanceOwner: worldInfo.instanceOwner,
            region: worldInfo.region,
            nonce: worldInfo.nonce
        }
    };
    return activity;
}
