import { ActivityLog, ActivityType, MoveActivityLog, EnterActivityLog, SendNotificationActivityLog, ReceiveNotificationActivityLog, AuthenticationActivityLog, CheckBuildActivityLog, ShutdownActivityLog } from "..";
import { appParameterObject } from "../app";

export function showLog(param: appParameterObject, activityLog: ActivityLog[]): void {
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
                message += generateMoveActivityMessage(e as MoveActivityLog);
                break;
            case ActivityType.Enter:
                message += generateEnterActivityMessage(e as EnterActivityLog, !!param.verbose);
                break;
            case ActivityType.Send:
                message += generateSendNotificationMessage(e as SendNotificationActivityLog, !!param.verbose);
                break;
            case ActivityType.Receive:
                message += generateReceiveNotificationMessage(e as ReceiveNotificationActivityLog, !!param.verbose);
                break;      
            case ActivityType.Authentication:
                message += generateAuthenticationMessage(e as AuthenticationActivityLog);
                break;
            case ActivityType.CheckBuild:
                message += generateCheckBuildMessage(e as CheckBuildActivityLog);
                break;
            case ActivityType.Shutdown:
                message += generateShutdownMessage(e as ShutdownActivityLog);
                break;
        }
        if (!param.filter && !param.caseFilter) {
            matchedLogs.push(message);
        } else if (param.caseFilter) {
            if (isMatchFilter(message, param.caseFilter)) matchedLogs.push(message);
        } else if (param.filter) {
            const lowerMessage = message.toLowerCase();
            // param.filterとignoreCaseFilterのnullableは同じ
            if (isMatchFilter(lowerMessage, ignoreCaseFilter!)) matchedLogs.push(message);
        }
    });
    console.log(matchedLogs.join("\n"));
}

/**
 * filterのいずれかにマッチする場合、真
 */
function isMatchFilter(message: string, filter: string[]): boolean {
    return filter.find((e) => message.indexOf(e) !== -1) !== undefined;
}

function generateMoveActivityMessage(log: MoveActivityLog): string {
    const message =
        log.activityType + " " +
        log.userData.userName;
    return message;
}

function generateEnterActivityMessage(log: EnterActivityLog, verbose: boolean): string {
    const data = log.worldData;
    let message =
        log.activityType + " " +
        data.worldName + " (" +
        data.access + ")";
    if (verbose) {
        message += 
            " (" + data.instanceId + ") " +
            "https://www.vrchat.com/home/launch?worldId=" + data.worldId + "&instanceId=" + data.instanceId;
        if (data.access) {
            message += "~" + data.access + "(" + data.instanceOwner + ")~nonce(" + data.nonce + ")";
        }
    }
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
    }

    if (data.details) {
        // Receiveのメッセージはｄetailsに格納される
        if (data.type === "requestInvite") {
            if (data.details.requestMessage) message += " message: " + data.details.requestMessage;
        } else if (data.type === "inviteResponse") {
            if (data.details.responseMessage) message += " message: " + data.details.responseMessage;
        }

        // 画像を受け取った場合
        if (data.details.imageUrl) {
            message += " imageUrl: " + data.details.imageUrl;
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
