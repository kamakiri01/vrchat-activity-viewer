import { createSDK2PlayerStartedActivityLog, createUSharpVideoStartedActivityLog, createVideoPlayActivityLog } from "../..";
import { ActivityLog } from "../../type/ActivityLogType/common";
import { NotificationFromType, RegionType, WorldAccessScope } from "../../type/common";
import { ReceiveNotificationType, SendNotificationType } from "../../type/common/NotificationType";
import { ReceiveNotificationInfo, WorldEnterInfo, SendNotificationInfo, RemoveNotificationInfo } from "../../type/parseResult";
import { createAuthenticationActivityLog } from "./activityLogGenerator/authentication";
import { createCheckBuildActivityLog } from "./activityLogGenerator/build";
import { createEnterActivityLog, createExitActivityLog } from "./activityLogGenerator/enter";
import { createJoinActivityLog } from "./activityLogGenerator/join";
import { createLeaveActivityLog } from "./activityLogGenerator/leave";
import { createReceiveNotificationActivityLog } from "./activityLogGenerator/receive";
import { createRemoveNotificationActivityLog } from "./activityLogGenerator/remove";
import { createSendNotificationActivityLog } from "./activityLogGenerator/send";
import { createShutdownActivityLog } from "./activityLogGenerator/shutdown";
import { parseMessageBodyFromLogLine, parseSquareBrackets } from "./parseUtil";

/**
 * parse output_log_xx_xx_xx.txt file
 *
 * @param logString raw vrchat log file stirng
 */
export function parseVRChatLog(logString: string, isDebugLog: boolean): ActivityLog[] {
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
            if (!isDebugLog) return;
            console.log("catch error, log: " + logLine);
            console.log("catch error, log next: " + logLines[index+1]);
            console.log(error);
        }
    });
    return activityLog;
}

const JudgeLogType = {
    isOnPlayerJoined: (message: string) => { return message.indexOf("Initialized PlayerAPI") !== -1 },
    isOnPlayerLeft: (message: string) => { return (message.indexOf("OnPlayerLeft") !== -1 && message.indexOf("OnPlayerLeftRoom") === -1) },
    isEnter: (message: string) => { return message.indexOf("Entering Room") !== -1 },
    isExit: (message: string) => { return message.indexOf("OnLeftRoom") !== -1},
    isSendNotification: (message: string) => { return message.indexOf("Send notification") !== -1 },
    isReceiveNotification: (message: string) => { return message.indexOf("Received Notification") !== -1 },
    isRemoveNotification: (message: string) => { return message.indexOf("Remove notification") !== -1 },
    isAuthentication: (message: string) => { return message.indexOf("User Authenticated") !== -1 },
    isCheckBuild: (message: string) => { return message.indexOf("Environment Info") !== -1 },
    isShutdown: (message: string) => { return message.indexOf("shutdown") !== -1 },
    isVideoPlay: (message: string) => { return message.indexOf("[Video Playback] URL") !== -1 },
    isUSharpVideoStarted: (message: string) => { return message.indexOf("[USharpVideo] Started video load for URL:") !== -1 },
    isSDK2PlayerVideoStarted: (message: string) => { return /User (.+) added URL (http.+)/.test(message) }
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

    if (JudgeLogType.isOnPlayerJoined(message)) {
        // join
        activityLog = createJoinActivityLog(utcTime, message);
    } else if (JudgeLogType.isOnPlayerLeft(message)) {
        // leave
        activityLog = createLeaveActivityLog(utcTime, message);
    } else if (JudgeLogType.isEnter(message)) {
        // enter
        const worldInfo = parseEnterActivityJoinLine(logLines[index+1])!;
        activityLog = createEnterActivityLog(utcTime, message, worldInfo);
    } else if (JudgeLogType.isExit(message)){
        // exit
        activityLog = createExitActivityLog(utcTime, message);
    } else if (JudgeLogType.isSendNotification(message)) {
        // send: friendRequest, invite, requestInvite
        const info = parseSendNotificationMessage(message)!;
        activityLog = createSendNotificationActivityLog(utcTime, message, info);
    } else if (JudgeLogType.isReceiveNotification(message)) {
        // receive: friendRequest, invite, requestInvite
        const info = parseReceiveNotificationMessage(message)!;
        if (!info || !info.to || !info.to.id) return null; // pending friend request
        activityLog = createReceiveNotificationActivityLog(utcTime, message, <ReceiveNotificationInfo>info);
    } else if (JudgeLogType.isRemoveNotification(message)) {
        // remove: friendRequest, invite, requestInvite
        const info = parseRemoveNotificationMessage(message)!;
        if (!info || !info.to || !info.to.id) return null;
        activityLog = createRemoveNotificationActivityLog(utcTime, message, <RemoveNotificationInfo>info);
    } else if (JudgeLogType.isAuthentication(message)) {
        // login
        activityLog = createAuthenticationActivityLog(utcTime, message);
    } else if (JudgeLogType.isCheckBuild(message)) {
        // check build
        activityLog = createCheckBuildActivityLog(utcTime, logLines[index+1]);
    } else if (JudgeLogType.isShutdown(message)) {
        // shutdown
        activityLog = createShutdownActivityLog(utcTime, message);
    } else if (JudgeLogType.isVideoPlay(message)) {
        // video play
        activityLog = createVideoPlayActivityLog(utcTime, message);
    } else if (JudgeLogType.isUSharpVideoStarted(message)) {
        // video start by usharp
        activityLog = createUSharpVideoStartedActivityLog(utcTime, message);
    } else if (JudgeLogType.isSDK2PlayerVideoStarted(message)) {
        // sdk2 video player
        activityLog = createSDK2PlayerStartedActivityLog(utcTime, message);
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
    const reg = /^Joining\s(wrld_[\w-]+):(\d+)(~region\(([\w-]+)\))?/.exec(message);

    if (!reg) return null;
    return {
        worldId: reg[1],
        instanceId: reg[2],
        access: "public",
        region: reg[4] as RegionType
    };
}

function parseScopeEnterMessage(message: string): WorldEnterInfo | null {
    const reg = /^Joining\s(wrld_[\w-]+):(\w+)~(\w+)\((usr_[\w-]+)\)(~canRequestInvite)?(~region\(([\w-]+)\))?~nonce\(([\w-]+)\)/.exec(message);
    // NOTE: instanceIdの:(\w+)は通常数字で\dマッチだが、英字で作ることも可能なので\wマッチ

    if (!reg) return null;
    const access = getWorldScope(reg[3], reg[5]);
    return {
        worldId: reg[1],
        instanceId: reg[2],
        access: access,
        instanceOwner: reg[4],
        canRequestInvite: reg[5],
        region: reg[7] as RegionType,
        nonce: reg[8]
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
    const reg = /^\[API\] Send notification:<Notification from username:(.*?), sender user id:(usr_[\w-]+)? to (usr_[\w-]+)? of type: ([\w]+), id: (.*?), created at: (\d{2}\/\d{2}\/\d{4})\s(\d{2}:\d{2}:\d{2}) UTC, details: ({{.*?}}), type:(\w+), m seen:(\w+), message: "(.*?)">( Image Len:(\d+))?/.exec(message);
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
    const reg = /^\[API\] Received Notification: <Notification from username:(.+), sender user id:(usr_[\w-]+) to (usr_[\w-]+)?\s?of type: ([\w]+), id: ([\w-]+), created at: (\d{2}\/\d{2}\/\d{4})\s(\d{2}:\d{2}:\d{2}) UTC, details: ({{.*?}}), type:(\w+), m seen:(\w+), message: "(.*?)"> received at (\d{2}\/\d{2}\/\d{4})\s(\d{2}:\d{2}:\d{2}) UTC/.exec(message);
    if (!reg) return null;
    
    return {
        from: {
            userName: reg[1],
            id: reg[2],
        },
        to: {
            id: reg[3], // pending中のフレンドリクエストはto先が0文字空白になる。pendingログは起動の都度出力されるためこの上限でマッチングから除外する
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
