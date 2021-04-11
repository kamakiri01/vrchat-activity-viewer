import * as path from "path";
import { ActivityLog, Database } from "./type/logType";
import { existDatabaseFile, initDatabase, loadDatabase, writeDatabase } from "./util/db";
import { findVRChatLogFilesFromDirPath, loadVRChatLogFile, mergeActivityLog } from "./util/log";
import { parseVRChatLog } from "./util/parse";
import { showLog } from "./util/showLog";

const DEFAULT_VRCAT_PATH = "/AppData/LocalLow/VRChat/VRChat";

export interface appParameterObject {
    import?: string;
    filter?: string[];
    caseFilter?: string[];
    verbose?: boolean;
    range: string;
}

export function app(param: appParameterObject) {
    const userHome = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"]!;
    const dbPath = path.join(userHome, ".vrchatActivityViewer", "db.json");
    if (!existDatabaseFile(dbPath)) {
        console.log("generate db.json in app dir...")
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
