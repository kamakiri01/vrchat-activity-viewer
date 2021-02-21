import * as path from "path";
import { ActivityLog, MoveActivityLog, EnterActivityLog, Database, SendNotificationActivityLog, ActivityType, AuthenticationActivityLog, CheckBuildActivityLog, ShutdownActivityLog, ReceiveNotificationActivityLog } from "./type/logType";
import { existDatabaseFile, initDatabase, loadDatabase, writeDatabase } from "./util/db";
import { findVRChatLogFilesFromDirPath, loadVRChatLogFile, mergeActivityLog } from "./util/log";
import { parseVRChatLog } from "./util/parse";

const DEFAULT_VRCAT_PATH = "/AppData/LocalLow/VRChat/VRChat";

export interface appParameterObject {
    import?: string;
    filter?: string[];
    verbose?: boolean;
    range: string;
}

export function app(param: appParameterObject) {
    const dbPath = path.join(path.dirname(process.argv[1]), "..", "db.json"); // command root
    if (!existDatabaseFile(dbPath)) {
        console.log("generate db.json in app dir...")
        const userHome = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"]!;
        initDatabase(path.join(userHome, DEFAULT_VRCAT_PATH), dbPath);
    }

    const db = loadDatabase(dbPath);
    let vrchaLogPath = db.vrchatHomePath;

    if (param.import) {
        vrchaLogPath = path.join(process.cwd(), param.import);
        console.log("search log files from " + vrchaLogPath);
    }

    const newDbLog = updateDb(db, dbPath, vrchaLogPath);

    if (param.import) return;

    console.log("--- Activity Log ---");
    showLog(param, newDbLog);
}

function updateDb(db: Database, dbPath: string, vrchaLogPath: string) {
    console.log("searching vrchat log files...")
    const filePaths = findVRChatLogFilesFromDirPath(vrchaLogPath);
    console.log("find "  + filePaths.length + " log file(s): " + filePaths.map(filePath => path.basename(filePath)).join(", "));
    const logs = filePaths.map((filePath) => {
        return parseVRChatLog(loadVRChatLogFile(path.join(vrchaLogPath, filePath)), filePath);
    });
    const newLog: ActivityLog[] = Array.prototype.concat.apply([], logs);
    const currentLogLength = db.log.length;
    const newDbLog = mergeActivityLog(db.log, newLog);
    console.log("update new " +
        (
            (Number.isNaN(newDbLog.length) ? 0 : newDbLog.length) -
            (Number.isNaN(currentLogLength) ? 0 : currentLogLength)
        ) + " logs");
    db.log = newDbLog;
    writeDatabase(dbPath, JSON.stringify(db, null, 2));
    console.log("update DB done");
    return newDbLog;
}

function showLog(param: appParameterObject, activityLog: ActivityLog[]): void {
    const currentTime = Date.now();
    const rangeMillisecond = (param.range ? parseInt(param.range, 10) : 24) * 60 * 60 * 1000;
    const showLog = activityLog.filter(e => currentTime - e.date < rangeMillisecond);
    const dateOption = {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit"
    };
    showLog.forEach(e => {
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
        if (!param.filter) {
            console.log(message);
        } else if (isMatchFilter(message, param.filter)) {
            console.log(message);
        }
    });
}

/**
 * filterのいずれかにマッチする場合、真
 */
function isMatchFilter(message: string, filter: string[]): boolean {
    return filter.find((e) => message.indexOf(e) !== -1) !== undefined;
}

function generateMoveActivityMessage(log: MoveActivityLog): string {
    let message =
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
            message +=
                + "~" + data.access + "(" + data.instanceOwner + ")~nonce(" + data.nonce + ")";
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
        message +=
            " (to " + data.to.id + ")"; 
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
