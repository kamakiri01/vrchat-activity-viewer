import { ActivityLog } from "../type/ActivityLogType/common";
import { NotificationFromType, WorldAccessScope } from "../type/common";
import { ReceiveNotificationType, SendNotificationType } from "../type/common/NotificationType";
import { ReceiveNotificationInfo, WorldEnterInfo, SendNotificationInfo, RemoveNotificationInfo } from "../type/LogType/ParsedInfo";
import { createAuthenticationActivityLog } from "./activityGenerator/authentication";
import { createCheckBuildActivityLog } from "./activityGenerator/build";
import { createEnterActivityLog } from "./activityGenerator/enter";
import { createJoinActivityLog } from "./activityGenerator/join";
import { createLeaveActivityLog } from "./activityGenerator/leave";
import { createReceiveNotificationActivityLog } from "./activityGenerator/receive";
import { createRemoveNotificationActivityLog } from "./activityGenerator/remove";
import { createSendNotificationActivityLog } from "./activityGenerator/send";
import { createShutdownActivityLog } from "./activityGenerator/shutdown";
import { parseMessageBodyFromLogLine, parseSquareBrackets } from "./reg";

export function parseVRChatLog(logString: string, logPath: string): ActivityLog[] {
    const lineSymbol = "\n";
    const logLines = logString.split(lineSymbol).filter((line) => {
        return line.length > 1; // 空行フィルタ
    })

    const activityLog: ActivityLog[] = [];
    logLines.forEach((logLine, index) => {
        try {
            const activity = parseLogLineToActivity(logLine, index, logLines);
            if (activity) activityLog.push(activity);
        } catch (error) {
            console.log("catch error, log file: " + logPath);
            console.log("catch error, log: " + logLine);
            console.log("catch error, log next: " + logLines[index+1]);
            console.log(error);
        }
    });
    return activityLog;
}

const Judge = {
    isOnPlayerJoined: (message: string) => { return message.indexOf("OnPlayerJoined") !== -1 },
    isOnPlayerLeft: (message: string) => { return (message.indexOf("OnPlayerLeft") !== -1 && message.indexOf("OnPlayerLeftRoom") === -1) },
    isEnter: (message: string) => { return message.indexOf("Entering Room") !== -1 },
    isSendNotification: (message: string) => { return message.indexOf("Send notification") !== -1 },
    isReceiveNotification: (message: string) => { return message.indexOf("Received Notification") !== -1 },
    isRemoveNotification: (message: string) => { return message.indexOf("Remove notification") !== -1 },
    isAuthentication: (message: string) => { return message.indexOf("User Authenticated") !== -1 },
    isCheckBuild: (message: string) => { return message.indexOf("VRChat Build") !== -1 },
    isShutdown: (message: string) => { return message.indexOf("shutdown") !== -1 }
}

// 次行のインスタンスIDを取るため全部引数に渡す
function parseLogLineToActivity(logLine: string, index: number, logLines: string[]): ActivityLog | null {
    const reg = parseMessageBodyFromLogLine(logLine);
    if (!reg || reg.length < 4) return null;
    const mmmmyydd = reg[1];
    const hhmmss = reg[2];
    const utcTime = new Date(mmmmyydd + " " + hhmmss).getTime();
    const message = reg[3];

    let activityLog: ActivityLog = null!;

    if (Judge.isOnPlayerJoined(message)) {
        // join
        activityLog = createJoinActivityLog(utcTime, message);
    } else if (Judge.isOnPlayerLeft(message)) {
        // leave
        activityLog = createLeaveActivityLog(utcTime, message);
    } else if (Judge.isEnter(message)) {
        // enter
        const worldInfo = parseEnterActivityJoinLine(logLines[index+1])!;
        activityLog = createEnterActivityLog(utcTime, message, worldInfo);
    } else if (Judge.isSendNotification(message)) {
        // send: friendRequest, invite, requestInvite
        const info = parseSendNotificationMessage(message)!;
        activityLog = createSendNotificationActivityLog(utcTime, message, info);
    } else if (Judge.isReceiveNotification(message)) {
        // receive: friendRequest, invite, requestInvite
        const info = parseReceiveNotificationMessage(message)!;
        if (!info || !info.to || !info.to.id) return null; // pending friend request
        activityLog = createReceiveNotificationActivityLog(utcTime, message, <ReceiveNotificationInfo>info);
    } else if (Judge.isRemoveNotification(message)) {
        // remove: friendRequest, invite, requestInvite
        const info = parseRemoveNotificationMessage(message)!;
        if (!info || !info.to || !info.to.id) return null;
        activityLog = createRemoveNotificationActivityLog(utcTime, message, <RemoveNotificationInfo>info);
    } else if (Judge.isAuthentication(message)) {
        // login
        activityLog = createAuthenticationActivityLog(utcTime, message);
    } else if (Judge.isCheckBuild(message)) {
        // check build
        activityLog = createCheckBuildActivityLog(utcTime, message);
    } else if (Judge.isShutdown(message)) {
        // shutdown
        activityLog = createShutdownActivityLog(utcTime, message);
    }
    // console.log("unsupported log: " + message);
    return activityLog || null;
}

function parseEnterActivityJoinLine(joinLine: string): WorldEnterInfo | null {
    const reg = parseMessageBodyFromLogLine(joinLine);
    if (!reg || reg.length < 4) return null;
    const reg2 = parseSquareBrackets(reg[3]);
    if (!reg2 || reg2.length < 4) return null;
    const message = reg2[3];

    let worldEnterInfo: WorldEnterInfo | null;
    if (joinLine.indexOf("nonce") !== -1) {
        worldEnterInfo = parseScopeEnterMessage(message);
    } else {
        worldEnterInfo = parsePublicEnterMessage(message);
    }
    return worldEnterInfo;
}

function parsePublicEnterMessage(message: string): WorldEnterInfo | null {
    const reg = /^Joining\s(wrld_[\w-]+):(\d+)/.exec(message);

    if (!reg) return null;
    return {
        worldId: reg[1],
        instanceId: reg[2],
        access: "public"
    };
}

function parseScopeEnterMessage(message: string): WorldEnterInfo | null {
    const reg = /^Joining\s(wrld_[\w-]+):(\w+)~(\w+)\((usr_[\w-]+)\)(~canRequestInvite)?~nonce\(([\w-]+)\)/.exec(message);
    // NOTE: instanceIdの:(\w+)は通常数字で\dマッチだが、英字で作ることも可能なので\wマッチ

    if (!reg) return null;
    const access = getWorldScope(reg[3], reg[5]);
    return {
        worldId: reg[1],
        instanceId: reg[2],
        access: access,
        instanceOwner: reg[4],
        canRequestInvite: reg[5],
        nonce: reg[6]
    };
}

function getWorldScope(access: string, canRequestInvite: string): WorldAccessScope {
    let result: WorldAccessScope;
    if (access === "hidden") {
        result = "friends+";
    } else if (access === "friends") {
        result = "friends";
    } else if (access === "private" && !!canRequestInvite) {
        result = "invite+";
    } else if (access === "private") {
        result = "invite";
    } else {
        result = "unknown";
    }
    return result;
}

function parseSendNotificationMessage(message: string): SendNotificationInfo | null {
    const reg = /^Send notification:<Notification from username:(.*?), sender user id:(usr_[\w-]+)? to (usr_[\w-]+)? of type: ([\w]+), id: (.*?), created at: (\d{2}\/\d{2}\/\d{4})\s(\d{2}:\d{2}:\d{2}) UTC, details: ({{.*?}}), type:(\w+), m seen:(\w+), message: "(.*?)">( Image Len:(\d+))?/.exec(message);
    if (!reg) return null;

    return {
        from: {
            userName: reg[1],
            id: reg[2],
        },
        to: {
            id: reg[3],
        },
        senderType: reg[4] as SendNotificationType,
        created: {
            date: reg[6],
            time: reg[7]
        },
        detailsRaw: reg[8],
        type: reg[9] as SendNotificationType,
        m_seen: reg[10],
        message: reg[11],
        imageLen: reg[13] // 12はImage Len不存在用
    };
}

function parseReceiveNotificationMessage(message: string): ReceiveNotificationInfo | null {
    const reg = /^Received Notification: <Notification from username:(.+), sender user id:(usr_[\w-]+) to (usr_[\w-]+)? of type: ([\w]+), id: ([\w-]+), created at: (\d{2}\/\d{2}\/\d{4})\s(\d{2}:\d{2}:\d{2}) UTC, details: ({{.*?}}), type:(\w+), m seen:(\w+), message: "(.*?)">( Image Len:(\d+))?/.exec(message);
    if (!reg) return null;
    
    return {
        from: {
            userName: reg[1],
            id: reg[2],
        },
        to: {
            id: reg[3],
        },
        senderType: reg[4] as ReceiveNotificationType,
        created: {
            date: reg[6],
            time: reg[7]
        },
        detailsRaw: reg[8],
        type: reg[9] as ReceiveNotificationType,
        m_seen: reg[10],
        message: reg[11],
        imageLen: reg[13] // 12はImage Len不存在用
    };
}


function parseRemoveNotificationMessage(message: string): RemoveNotificationInfo | null {
    const reg = /^Remove notification from (\w+) notifications:<Notification from username:(.+), sender user id:(usr_[\w-]+) to (usr_[\w-]+)? of type: ([\w]+), id: ([\w-]+), created at: (\d{2}\/\d{2}\/\d{4})\s(\d{2}:\d{2}:\d{2}) UTC, details: ({{.*?}}), type:(\w+), m seen:(\w+), message: "(.*?)">( Image Len:(\d+))?/.exec(message);
    if (!reg) return null;
    
    return {
        fromType: reg[1] as NotificationFromType,
        from: {
            userName: reg[2],
            id: reg[3],
        },
        to: {
            id: reg[4],
        },
        senderType: reg[5] as ReceiveNotificationType,
        created: {
            date: reg[7],
            time: reg[8]
        },
        detailsRaw: reg[9],
        type: reg[10] as ReceiveNotificationType,
        m_seen: reg[11],
        message: reg[12],
        imageLen: reg[14] // 13はImage Len不存在用
    };
}
