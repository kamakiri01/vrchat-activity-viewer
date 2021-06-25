import * as path from "path";
import * as fs from "fs";
import { existDatabaseFile, initDatabase, loadDatabase, writeDatabase } from "./util/dbUtil";
import { parseVRChatLog } from "./util/parseVRChatLog";
import { DB_PATH, DEFAULT_VRCHAT_FULL_PATH, findVRChatLogFileNames } from "./util/pathUtil";
import { showActivityLog } from "./util/showActivityLog";
import { Database, ActivityLog } from "./type/ActivityLogType/common";

export interface AppParameterObject {
    range: string;
    import?: string;
    filter?: string[];
    caseFilter?: string[];
    verbose?: boolean;
    watch?: string;
    debug?: boolean;
}

export function app(param: AppParameterObject): void {
    if (!existDatabaseFile(DB_PATH)) {
        console.log("generate db.json in app dir...")
        initDatabase(DB_PATH);
    }

    const db = loadDatabase(DB_PATH);

    if (param.import) {
        const vrchatLogDirPath = path.join(process.cwd(), param.import);
        console.log("search import log files from " + vrchatLogDirPath);
        _updateDatabase(db, vrchatLogDirPath, param);
        return;
    }

    _updateDatabase(db, DEFAULT_VRCHAT_FULL_PATH, param);
    console.log("--- Activity Log ---");
    showActivityLog(param, db.log);

    if (param.watch) {
        console.log("watching...");
        const interval = parseInt(param.watch, 10);
        setInterval(() => {
            const db = loadDatabase(DB_PATH);
            _updateDatabase(db, DEFAULT_VRCHAT_FULL_PATH, param);
        }, interval * 1000);
    }
}

function _updateDatabase(db: Database, vrchatLogDirPath: string, param: AppParameterObject): void {
    console.log("searching vrchat log files...")
    const filePaths = findVRChatLogFileNames(vrchatLogDirPath);
    console.log("find " + filePaths.length + " log file(s): " + filePaths.map(filePath => path.basename(filePath)).join(", "));
    const activityLogs = filePaths.map((filePath) => {
        return parseVRChatLog(
            fs.readFileSync(path.resolve(path.join(vrchatLogDirPath, filePath)), "utf8"),
            !!param.debug
        );
    });
    const newActivityLogs: ActivityLog[] = Array.prototype.concat.apply([], activityLogs);
    const currentLogLength = db.log.length;
    db.log = _mergeActivityLog(db.log, newActivityLogs);
    console.log("update new " +
        (
            (Number.isNaN(db.log.length) ? 0 : db.log.length) -
            (Number.isNaN(currentLogLength) ? 0 : currentLogLength)
        ) + " logs");
    writeDatabase(DB_PATH, JSON.stringify(db, null, 2));
    console.log("update DB done");
}

function _mergeActivityLog(dbLog: ActivityLog[], appendLog: ActivityLog[]) {
    const tmpNewLog = dbLog.concat(appendLog);
    const formattedLog = _formatDBActivityLog(tmpNewLog);
    return formattedLog;
}

function _formatDBActivityLog(log: ActivityLog[]): ActivityLog[] {
    const deduplicateLog = Array.from(new Set(log.map(e => JSON.stringify(e)))).map(e => JSON.parse(e) as ActivityLog);
    return deduplicateLog.sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        return 0;
    })
}
