import { ActivityLog, ActivityType, MoveActivityLog, EnterActivityLog, SendNotificationActivityLog, ReceiveNotificationActivityLog, AuthenticationActivityLog, CheckBuildActivityLog, ShutdownActivityLog, ReceiveNotificationDetails, VideoPlayActivityLog, USharpVideoStartedActivityLog, SDK2PlayerStartedActivityLog, ExitActivityLog } from "..";
import { RemoveNotificationActivityLog, RemoveNotificationDetails } from "../type/activityLogType/removeType";
import { ViewerAppParameterObject } from "../type/AppConfig";

export function showActivityLog(param: ViewerAppParameterObject, activityLog: ActivityLog[]): void {
    const currentTime = Date.now();
    const showableRangeLogs = activityLog.filter(e => currentTime - e.date < param.range);

    let resultLogs: string[];
    const isShowInstance = (param.instanceEnter || param.instanceAll) && param.filter;
    if (isShowInstance) {
        resultLogs = pickFilteredLogsWithInstance(showableRangeLogs, param);
    } else {
        resultLogs = pickFilteredLogs(showableRangeLogs, param);
    }
    if (param.debug) console.log("--- Activity Log ---");
    if (resultLogs.length > 0) console.log(resultLogs.join("\n"));
}

const dateOption: Intl.DateTimeFormatOptions = {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
};

// TODO: 都度newするのは負荷の面で避けたい、ActivityLogに事前にtoLocaleString結果を持たせるか、
// 本文マッチしない場合のみnewするべき
function acitivityLogToMessage(log: ActivityLog, verbose?: boolean): string {
    return (new Date(log.date)).toLocaleString(undefined, dateOption) + " " + messageGenerator(log, verbose);
}

/**
 * フィルタにマッチするログを抽出する
 */
function pickFilteredLogs(showableRangeLogs: ActivityLog[], param: ViewerAppParameterObject): string[] {
    const matchedLogs: string[] = [];

    showableRangeLogs.forEach(e => {
        const message = acitivityLogToMessage(e, param.verbose);

        if (!param.filter) return matchedLogs.push(message);        
        if (isMatchFilter(message, param.filter, param.caseFilter!)) matchedLogs.push(message);
    });
    return matchedLogs;
}

/**
 * インスタンス単位でフィルタにマッチするログを抽出する
 */
function pickFilteredLogsWithInstance(showableRangeLogs: ActivityLog[], param: ViewerAppParameterObject): string[] {
    const separatedLogs = separateWithInstance(showableRangeLogs);
    const matchedGroupLogs = separatedLogs.filter(instanceLogs => {
        return instanceLogs.find(e => {
            const message = acitivityLogToMessage(e, param.verbose);
            return isMatchFilter(message, param.filter!, param.caseFilter!);
        });
    });

    let matchedLogs: string[] = [];
    matchedGroupLogs.forEach((instanceLogs) => {
        if (param.instanceAll) {
            matchedLogs = matchedLogs.concat(instanceLogs.map(e => acitivityLogToMessage(e, param.verbose)));
        } else if (param.instanceEnter) {
            instanceLogs.forEach(e => {
                const message = acitivityLogToMessage(e, param.verbose);
                if (e.activityType === ActivityType.Enter || isMatchFilter(message, param.filter!, param.caseFilter!)) matchedLogs.push(message);
            })
        }
        matchedLogs.push("----------");
    })
    return matchedLogs;
}


function messageGenerator(e: ActivityLog, verbose?: boolean) {
    switch (e.activityType) {
        case ActivityType.Join:
        case ActivityType.Leave:
            return generateMoveActivityMessage(e as MoveActivityLog, !!verbose);
        case ActivityType.Enter:
            return generateEnterActivityMessage(e as EnterActivityLog, !!verbose);
        case ActivityType.Exit:
            return generateExitActivityMessage(e as ExitActivityLog, !!verbose);
        case ActivityType.Send:
            return generateSendNotificationMessage(e as SendNotificationActivityLog, !!verbose);
        case ActivityType.Receive:
            return generateReceiveNotificationMessage(e as ReceiveNotificationActivityLog, !!verbose);
        case ActivityType.Remove:
            return generateRemoveNotificationMessage(e as RemoveNotificationActivityLog, !!verbose);
        case ActivityType.Authentication:
            return generateAuthenticationMessage(e as AuthenticationActivityLog);
        case ActivityType.CheckBuild:
            return generateCheckBuildMessage(e as CheckBuildActivityLog);
        case ActivityType.Shutdown:
            return generateShutdownMessage(e as ShutdownActivityLog);
        case ActivityType.VideoPlay:
            return generateVideoPlayMessage(e as VideoPlayActivityLog, !!verbose);
        case ActivityType.USharpVideoStarted:
            return generateUSharpVideoStartedMessage(e as USharpVideoStartedActivityLog);
        case ActivityType.SDK2PlayerStarted:
            return generateSDK2PlayerStartedMessage(e as SDK2PlayerStartedActivityLog);
    }
}

function separateWithInstance(activityLog: ActivityLog[]): ActivityLog[][] {
    const groupLogs: ActivityLog[][] = [[]];
    let index = 0;
    activityLog.forEach(log => {
        if (log.activityType === ActivityType.Enter) {
            index += 1;
            groupLogs.push([]);
        }
        groupLogs[index].push(log);
    })
    return groupLogs;
}

/**
 * filterのいずれかにマッチする場合、真
 */
function isMatchFilter(message: string, filter: string[], isCaseSensitive: boolean): boolean {
    if (!isCaseSensitive) {
        message = message.toLowerCase();
        filter = filter.map(e => e.toLowerCase());
    }
    return filter.find((e) => message.indexOf(e) !== -1) !== undefined;
}

function generateMoveActivityMessage(log: MoveActivityLog, verbose: boolean): string {
    let message =
        log.activityType + " " +
        log.userData.userName;
        if (verbose) {
            if (log.userData.access === "local") message += " (self)";
        }
        return message;
}

function generateEnterActivityMessage(log: EnterActivityLog, verbose: boolean): string {
    const data = log.worldData;
    let message =
        log.activityType + " " +
        data.worldName + " (" +
        data.access + ")";
    if (verbose) {
        if (data.region) message += " (" + data.region + ")";
        message += 
            " (" + data.instanceId + ") " +
            "https://www.vrchat.com/home/launch?worldId=" + data.worldId + "&instanceId=" + data.instanceId;
        if (data.access) { // no public instance
            message += "~" + data.access + "(" + data.instanceOwner + ")~nonce(" + data.nonce + ")";
        }
    }
    return message;
}

function generateExitActivityMessage(log: ExitActivityLog, verbose: boolean): string {
    const message = "exit";
    return message;
}

function generateSendNotificationMessage(log: SendNotificationActivityLog, verbose: boolean): string {
    const data = log.data;
    let message = "send " + log.sendActivityType;

    // Sendのメッセージは直下のmessageに格納される
    if (data.message) {
        message += " message: " + data.message;
    }

    if (verbose) {
        message += " (to " + data.to.id + ")"; 
    }
    return message;
}

function generateReceiveNotificationMessage(log: ReceiveNotificationActivityLog, verbose: boolean): string {
    const data = log.data;
    let message =
        "receive " +
        log.receiveActivityType + " " +
        "from " + data.from.userName;

    if (verbose) {
        message += "(" + data.from.id + ") ";
        if (data.details) {
            (Object.keys(data.details) as (keyof ReceiveNotificationDetails)[]).forEach((key) => {
                message += " " + key + ": " + data.details[key];
            })
        }
    }
    return message;
}

function generateRemoveNotificationMessage(log: RemoveNotificationActivityLog, verbose: boolean): string {
    const data = log.data;
    let message =
        "remove " +
        log.removeActivityType + " " +
        "from " + data.from.userName;

    if (verbose) {
        message += "(" + data.from.id + ") ";
        if (data.details) {
            (Object.keys(data.details) as (keyof RemoveNotificationDetails)[]).forEach((key) => {
                message += " " + key + ": " + data.details[key];
            })
        }
    }
    return message;
}

function generateAuthenticationMessage(log: AuthenticationActivityLog): string {
    const message = "login " + log.userName;
    return message;
}

function generateCheckBuildMessage(log: CheckBuildActivityLog): string {
    const message = "build " + log.buildName;
    return message;
}

function generateShutdownMessage(log: ShutdownActivityLog): string {
    const message = "shutdown";
    return message;   
}
function generateVideoPlayMessage(log: VideoPlayActivityLog, verbose: boolean): string {
    let message = "videoplay " + log.url;
    if (verbose) {
        message += " (" + log.resolvedUrl + ") ";
    }
    return message;
}

function generateUSharpVideoStartedMessage(log: USharpVideoStartedActivityLog): string {
    const message = "usharpvideo " + log.url + ", requested by" + log.requestedBy;
    return message;
}

function generateSDK2PlayerStartedMessage(log: SDK2PlayerStartedActivityLog): string {
    const message = "sdk2player " + log.url + ", requested by" + log.requestedBy;
    return message;
}
