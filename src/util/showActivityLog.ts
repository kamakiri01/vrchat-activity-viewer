import { ActivityLog, ActivityType, MoveActivityLog, EnterActivityLog, SendNotificationActivityLog, ReceiveNotificationActivityLog, AuthenticationActivityLog, CheckBuildActivityLog, ShutdownActivityLog, ReceiveNotificationDetails } from "..";
import { AppParameterObject } from "../app";
import { RemoveNotificationActivityLog, RemoveNotificationDetails } from "../type/ActivityLogType/removeType";

export function showActivityLog(param: AppParameterObject, activityLog: ActivityLog[]): void {
    const ignoreCaseFilter = param.filter?.map(e => e.toLowerCase());
    const matchedLogs: string[] = [];

    const currentTime = Date.now();
    const rangeMillisecond = (param.range ? parseInt(param.range, 10) : 24) * 60 * 60 * 1000;
    const showableRangeLog = activityLog.filter(e => currentTime - e.date < rangeMillisecond);
    const dateOption: Intl.DateTimeFormatOptions = {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit"
    };
    showableRangeLog.forEach(e => {
        const date = new Date(e.date);
        let message = date.toLocaleString(undefined, dateOption) + " ";
        switch (e.activityType) {
            case ActivityType.Join:
            case ActivityType.Leave:
                message += _generateMoveActivityMessage(e as MoveActivityLog);
                break;
            case ActivityType.Enter:
                message += _generateEnterActivityMessage(e as EnterActivityLog, !!param.verbose);
                break;
            case ActivityType.Send:
                message += _generateSendNotificationMessage(e as SendNotificationActivityLog, !!param.verbose);
                break;
            case ActivityType.Receive:
                message += _generateReceiveNotificationMessage(e as ReceiveNotificationActivityLog, !!param.verbose);
                break;
            case ActivityType.Remove:
                message += _generateRemoveNotificationMessage(e as RemoveNotificationActivityLog, !!param.verbose);
                break;
            case ActivityType.Authentication:
                message += _generateAuthenticationMessage(e as AuthenticationActivityLog);
                break;
            case ActivityType.CheckBuild:
                message += _generateCheckBuildMessage(e as CheckBuildActivityLog);
                break;
            case ActivityType.Shutdown:
                message += _generateShutdownMessage(e as ShutdownActivityLog);
                break;
        }
        if (!param.filter && !param.caseFilter) {
            matchedLogs.push(message);
        } else if (param.caseFilter) {
            if (_isMatchFilter(message, param.caseFilter)) matchedLogs.push(message);
        } else if (param.filter) {
            const lowerMessage = message.toLowerCase();
            // param.filterとignoreCaseFilterのnullableは同じ
            if (_isMatchFilter(lowerMessage, ignoreCaseFilter!)) matchedLogs.push(message);
        }
    });
    console.log(matchedLogs.join("\n"));
}

/**
 * filterのいずれかにマッチする場合、真
 */
function _isMatchFilter(message: string, filter: string[]): boolean {
    return filter.find((e) => message.indexOf(e) !== -1) !== undefined;
}

function _generateMoveActivityMessage(log: MoveActivityLog): string {
    const message =
        log.activityType + " " +
        log.userData.userName;
    return message;
}

function _generateEnterActivityMessage(log: EnterActivityLog, verbose: boolean): string {
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

function _generateSendNotificationMessage(log: SendNotificationActivityLog, verbose: boolean): string {
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

function _generateReceiveNotificationMessage(log: ReceiveNotificationActivityLog, verbose: boolean): string {
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

function _generateRemoveNotificationMessage(log: RemoveNotificationActivityLog, verbose: boolean): string {
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

function _generateAuthenticationMessage(log: AuthenticationActivityLog): string {
    const message = "login " + log.userName;
    return message;
}

function _generateCheckBuildMessage(log: CheckBuildActivityLog): string {
    const message = "build " + log.buildName;
    return message;
}

function _generateShutdownMessage(log: ShutdownActivityLog): string {
    const message = "shutdown";
    return message;   
}
