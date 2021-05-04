import * as path from "path";
import * as fs from "fs";
import { ActivityLog, Database } from "./type/logType";
import { existDatabaseFile, initDatabase, loadDatabase, writeDatabase } from "./util/db";
import {  mergeActivityLog } from "./util/log";
import { parseVRChatLog } from "./util/parse";
import { DB_PATH, DEFAULT_VRCHAT_FULL_PATH, findVRChatLogFileNames } from "./util/pathUtil";
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
        initDatabase(DB_PATH);
    }

    const db = loadDatabase(DB_PATH);

    if (param.import) {
        const vrchatLogDirPath = path.join(process.cwd(), param.import);
        console.log("search import log files from " + vrchatLogDirPath);
        updateDb(db, vrchatLogDirPath);
        return;
    }

    const newDbLog = updateDb(db, DEFAULT_VRCHAT_FULL_PATH);
    console.log("--- Activity Log ---");
    showLog(param, newDbLog);

    if (param.watch) {
        console.log("watching...")
        setInterval(() => {
            const db = loadDatabase(DB_PATH);
            updateDb(db, DEFAULT_VRCHAT_FULL_PATH);
        }, 10 * 1000);
    }
}

function updateDb(db: Database, vrchatLogDirPath: string) {
    console.log("searching vrchat log files...")
    const filePaths = findVRChatLogFileNames(vrchatLogDirPath);
    console.log("find " + filePaths.length + " log file(s): " + filePaths.map(filePath => path.basename(filePath)).join(", "));
    const logs = filePaths.map((filePath) => {
        return parseVRChatLog(
            fs.readFileSync(path.resolve(path.join(vrchatLogDirPath, filePath)), "utf8"),
            filePath);
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
    writeDatabase(DB_PATH, JSON.stringify(db, null, 2));
    console.log("update DB done");
    return newDbLog;
}
