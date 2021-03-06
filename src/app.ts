import * as path from "path";
import * as fs from "fs";
import { existDatabaseFile, initDatabase, loadDatabase, writeDatabase } from "./util/dbUtil";
import { parseVRChatLog } from "./util/parseVRChatLog";
import { DB_PATH, DEFAULT_VRCHAT_FULL_PATH, findVRChatLogFileNames } from "./util/pathUtil";
import { showActivityLog } from "./util/showActivityLog";
import { Database, ActivityLog } from "./type/ActivityLogType/common";
import { ViewerAppParameterObject } from "./type/AppConfig";

export function app(param: ViewerAppParameterObject): void {
    completeParameterObject(param);
    if (!existDatabaseFile(DB_PATH)) {
        console.log("generate db.json in app dir...")
        initDatabase(DB_PATH);
    }

    const db = loadDatabase(DB_PATH);

    if (param.import) {
        const vrchatLogDirPath = path.join(process.cwd(), param.import);
        console.log("search import log files from " + vrchatLogDirPath);
        updateDatabase(db, vrchatLogDirPath, param);
        return;
    }

    updateDatabase(db, DEFAULT_VRCHAT_FULL_PATH, param);
    console.log("--- Activity Log ---");
    showActivityLog(param, db.log);

    if (param.watch) {
        console.log("watching...");
        const interval = parseInt(param.watch, 10);
        setInterval(() => {
            const db = loadDatabase(DB_PATH);
            updateDatabase(db, DEFAULT_VRCHAT_FULL_PATH, param);
        }, interval * 1000);
    }
}

function completeParameterObject(param: ViewerAppParameterObject): void {
    param.range = param.range ? parseRange(param.range) : 1000 * 60 * 60 * 24; // default 24h
}

function parseRange(range: string | number): number {
    if (typeof range === "number") return range;
    const timeBasis = range.slice(-1);
    // string 型の場合は "number" + "basis" 形式を必須にする
    if (!isNaN(parseInt(timeBasis, 10))) throw new Error("range must be size + time basis alphabet, when typeof string");

    // 規定外の basis を許容しない
    const allowBasis = ["y", "m", "w", "d", "h"];// year, month, week, day, hour
    if (allowBasis.indexOf(timeBasis) === -1) throw new Error("range time basis must be year, month, week, day or hour");

    let rangeTime = parseInt(range.slice(0, range.length - 1), 10) * 1000 * 60 * 60; // hours
    switch (timeBasis) {
        case "y":
            rangeTime *= 24 * 365;
            break;
        case "m":
            rangeTime *= 24 * 28;
            break;
        case "w":
            rangeTime *= 24 * 7;
            break
        case "d":
            rangeTime *= 24;
            break;
        case "h":
            // do nothing
    }
    return rangeTime;
}

function updateDatabase(db: Database, vrchatLogDirPath: string, param: ViewerAppParameterObject): void {
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
    db.log = mergeActivityLog(db.log, newActivityLogs);
    console.log("update new " +
        (
            (Number.isNaN(db.log.length) ? 0 : db.log.length) -
            (Number.isNaN(currentLogLength) ? 0 : currentLogLength)
        ) + " logs");
    writeDatabase(DB_PATH, JSON.stringify(db, null, 2));
    console.log("update DB done");
}

function mergeActivityLog(dbLog: ActivityLog[], appendLog: ActivityLog[]) {
    const tmpNewLog = dbLog.concat(appendLog);
    const formattedLog = formatDBActivityLog(tmpNewLog);
    return formattedLog;
}

function formatDBActivityLog(log: ActivityLog[]): ActivityLog[] {
    const deduplicateLog = Array.from(new Set(log.map(e => JSON.stringify(e)))).map(e => JSON.parse(e) as ActivityLog);
    return deduplicateLog.sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        return 0;
    })
}
