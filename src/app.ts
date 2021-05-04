import * as path from "path";
import { ActivityLog, Database } from "./type/logType";
import { existDatabaseFile, initDatabase, loadDatabase, writeDatabase } from "./util/db";
import {  mergeActivityLog } from "./util/log";
import { parseVRChatLog } from "./util/parse";
import { DB_PATH, DEFAULT_VRCAT_PATH, DEFAULT_VRCHAT_FULL_PATH, findVRChatLogFilePaths, loadVRChatLogFile, USER_HOME } from "./util/pathUtil";
import { showLog } from "./util/showLog";

export interface appParameterObject {
    range: string;
    import?: string;
    filter?: string[];
    caseFilter?: string[];
    verbose?: boolean;
    watch?: boolean;
}

export function app(param: appParameterObject): void {
    if (!existDatabaseFile(DB_PATH)) {
        console.log("generate db.json in app dir...")
        initDatabase(path.join(USER_HOME, DEFAULT_VRCAT_PATH), DB_PATH);
    }

    const db = loadDatabase(DB_PATH);

    if (param.import) {
        const vrchaLogPath = path.join(process.cwd(), param.import);
        console.log("search import log files from " + vrchaLogPath);
        updateDb(db, DB_PATH, vrchaLogPath);
        return;
    }

    const newDbLog = updateDb(db, DB_PATH, DEFAULT_VRCHAT_FULL_PATH);
    console.log("--- Activity Log ---");
    showLog(param, newDbLog);

    if (param.watch) {
        console.log("watching...")
        setInterval(() => {
            const db = loadDatabase(DB_PATH);
            updateDb(db, DB_PATH, DEFAULT_VRCHAT_FULL_PATH);
        }, 10 * 1000);
    }
}

function updateDb(db: Database, dbPath: string, vrchaLogPath: string) {
    console.log("searching vrchat log files...")
    const filePaths = findVRChatLogFilePaths(vrchaLogPath);
    console.log("find " + filePaths.length + " log file(s): " + filePaths.map(filePath => path.basename(filePath)).join(", "));
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
