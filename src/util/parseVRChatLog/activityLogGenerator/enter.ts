import { WorldEnterInfo, EnterActivityLog, ActivityType, ExitActivityLog } from "../../..";
import { parseSquareBrackets } from "../parseUtil";

export function createEnterActivityLog(utcTime: number, message: string, worldInfo: WorldEnterInfo): EnterActivityLog {
    const parseResult = parseSquareBrackets(message)!; // [Behaviour]
    const activity: EnterActivityLog = {
        date: utcTime,
        activityType: ActivityType.Enter,
        worldData: {
            worldName: /^Entering Room: (.+)/.exec(parseResult.message)![1],
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

export function createExitActivityLog(utcTime: number, message: string): ExitActivityLog {
    const activity: ExitActivityLog = {
        date: utcTime,
        activityType: ActivityType.Exit
    };
    return activity;
}
