import * as path from "path";
import { initDatabase, loadDatabase, existDatabaseFile, findVRChatLogFilesFromDirPath, loadVRChatLogFile, parseVRChatLog, mergeActivityLog, writeDatabase } from "./util";
import { ActivityLog, MoveActivityLog, EnterActivityLog, Database } from "./type";

const DEFAULT_VRCAT_PATH = "/AppData/LocalLow/VRChat/VRChat";

export interface appParameterObject {
    import?: string;
    filter?: string;
    verbose?: boolean;
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
    showLog(param, newDbLog);
}

function updateDb(db: Database, dbPath: string, vrchaLogPath: string) {
    console.log("searching vrchat log files...")
    const filePaths = findVRChatLogFilesFromDirPath(vrchaLogPath);
    console.log("find "  + filePaths.length + " log file(s): " + filePaths.map(filePath => path.basename(filePath)).join(", "));
    const logs = filePaths.map((filePath) => {
        return parseVRChatLog(loadVRChatLogFile(path.join(vrchaLogPath, filePath)));
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
    console.log("--- Activity Log ---")
    const currentTime = Date.now();
    const daymillisecond = 24 * 60 * 60 * 1000;
    const showLog = activityLog.filter(e => currentTime - e.date < daymillisecond);
    // const showLog = newDbLog;
    showLog.forEach(e => {
        const date = new Date(e.date);
        let message = date.toLocaleDateString() + " " + date.toLocaleTimeString() + " ";
        switch (e.activityType) {
            case "join":
            case "leave":
                message += e.activityType + " " +  (<MoveActivityLog>e).username;
                break;
            case "enter":
                message += e.activityType + " " + (<EnterActivityLog>e).worldname;
                break;
        }
        if (param.filter && message.indexOf(param.filter) === -1) return;
        console.log(message);
        // console.log(date.toLocaleDateString() + " " + date.toLocaleTimeString() + " " + e.activityType);
    })
}