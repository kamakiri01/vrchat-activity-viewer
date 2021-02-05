import { ActivityType, AuthenticationActivityLog, CheckBuildActivityLog, EnterActivityLog, MoveActivityLog, ReceiveActivityType, ReceiveNotificationActivityLog, SendActivityType, SendNotificationActivityLog, ShutdownActivityLog } from "../type/logType";
import { WorldEnterInfo, NotificationInfo } from "../type/parseInfo";
import { parseSquareBrackets } from "./reg";

export function createJoinActivityLog(utcTime: number, message: string): MoveActivityLog {
    const reg = parseSquareBrackets(message)!; // [NetworkManager]
    const activity: MoveActivityLog = {
        date: utcTime,
        activityType: ActivityType.Join,
        userData: {
            // userName: /^\[NetworkManager\] OnPlayerJoined\s(.+)/.exec(message)![1]
            userName: /^OnPlayerJoined\s(.+)/.exec(reg[3])![1]
        }
    };
    return activity;
}

export function createLeaveActivityLog(utcTime: number, message: string): MoveActivityLog {
    const reg = parseSquareBrackets(message)!; // [NetworkManager]
    const activity: MoveActivityLog = {
        date: utcTime,
        activityType: ActivityType.Leave,
        userData: {
            // userName: /^\[NetworkManager\] OnPlayerLeft\s(.+)/.exec(message)![1]
            userName: /^OnPlayerLeft\s(.+)/.exec(reg[3])![1]
        }
    };
    return activity;
}

export function createEnterActivityLog(utcTime: number, message: string, worldInfo: WorldEnterInfo) {
    const reg = parseSquareBrackets(message)!; // [RoomManager]
    const activity: EnterActivityLog = {
        date: utcTime,
        activityType: ActivityType.Enter,
        worldData: {
            // worldName: /^\[RoomManager\] Entering\sRoom:\s(.+)/.exec(message)![1],
            worldName: /^Entering\sRoom:\s(.+)/.exec(reg[3])![1],
            worldId: worldInfo.worldId,
            instanceId: worldInfo.instanceId,
            access: worldInfo.access,
            instanceOwner: worldInfo.instanceOwner,
            nonce: worldInfo.nonce
        }
    };
    return activity;
}

export function createSendNotificationActivityLog(utcTime: number, message: string, info: NotificationInfo) {
    let sendActivityType: SendActivityType;
    switch (info.type) {
        case "invite":
            sendActivityType = SendActivityType.Invite;
            break;
        case "requestInvite":
            sendActivityType = SendActivityType.RequestInvite;
            break;
        case "friendRequest":
            sendActivityType = SendActivityType.FriendRequest;
            break;
    }
    const activity: SendNotificationActivityLog = {
        date: utcTime,
        activityType: ActivityType.Send,
        sendActivityType: sendActivityType,
        data: {
            from: {
                userName: info.from.userName,
                id: info.from.id
            },
            to: {
                id: info.to.id
            },
            created: {
                date: info.created.date,
                time: info.created.time
            },
            details: info.details,
            type: info.type,
            senderType: info.senderType
        }
    };
    return activity;
}

export function createReceiveNotificationActivityLog(utcTime: number, message: string, info: NotificationInfo) {
    let receiveActivityType: ReceiveActivityType;
    switch (info.type) {
        case "invite":
            receiveActivityType = ReceiveActivityType.Invite;
            break;
        case "requestInvite":
            receiveActivityType = ReceiveActivityType.RequestInvite;
            break;
        case "friendRequest":
            receiveActivityType = ReceiveActivityType.FriendRequest;
            break;
    }
    const activity: ReceiveNotificationActivityLog = {
        date: utcTime,
        activityType: ActivityType.Receive,
        receiveActivityType: receiveActivityType,
        data: {
            from: {
                userName: info.from.userName,
                id: info.from.id
            },
            to: {
                id: info.to.id
            },
            created: {
                date: info.created.date,
                time: info.created.time
            },
            details: info.details,
            type: info.type,
            senderType: info.senderType
        }
    };
    return activity;   
}

export function createAuthenticationActivityLog(utcTime: number, message: string) {
    const reg = parseSquareBrackets(message)!; // [VRCFlowManagerVRC]
    const activity: AuthenticationActivityLog = {
        date: utcTime,
        activityType: ActivityType.Authentication,
        // userName: /^\[VRCFlowManagerVRC\] User Authenticated:\s(.+)/.exec(message)![1]
        userName: /^User Authenticated:\s(.+)/.exec(reg[3])![1]
    };
    return activity;
}

export function createCheckBuildActivityLog(utcTime: number, message: string) {
    const reg = parseSquareBrackets(message)!; // [VRCApplicationSetup]
    const activity: CheckBuildActivityLog = {
        date: utcTime,
        activityType: ActivityType.CheckBuild,
        // buildName: /^\[VRCApplicationSetup\] VRChat Build: ([\w\-\.\s]+), \w+/.exec(message)![1]
        buildName: /^VRChat Build: ([\w\-\.\s]+), \w+/.exec(reg[3])![1]
    };
    return activity;
}

export function createShutdownActivityLog(utcTime: number, message: string) {
    const activity: ShutdownActivityLog = {
        date: utcTime,
        activityType: ActivityType.Shutdown
    }
    return activity;
}
