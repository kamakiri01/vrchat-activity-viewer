import * as path from "path";
import * as fs from "fs";
import { existDatabaseFile, initDatabase, loadDatabase, writeDatabase } from "../util/dbUtil";
import { parseVRChatLog, ParseVRChatLogResult } from "../util/parseVRChatLog/parseVRChatLog";
import { DB_PATH, DEFAULT_VRCHAT_FULL_PATH, findVRChatLogFileNames } from "../util/pathUtil";
import { showActivityLog } from "./showActivityLog";
import { ActivityLog } from "../type/activityLogType/common";
import { ViewerAppParameterObject } from "../type/AppConfig";
import { Database } from "../type/Database";
import { UserData, UserDataLog } from "../type/userData";

export function app(param: ViewerAppParameterObject): void {
    completeParameterObject(param);
    if (!existDatabaseFile(DB_PATH)) initDatabase(DB_PATH);

    if (param.watch) {
        watch(param);
    } else {
        const db = loadDatabase(DB_PATH);
        updateDatabase(db, DEFAULT_VRCHAT_FULL_PATH, param);
        showActivityLog(param, db.log);
    }
}

function completeParameterObject(param: ViewerAppParameterObject) {
    param.range = param.range ? parseRange(param.range) : 1000 * 60 * 60 * 24; // default 24h
    param.importDir = param.importDir ? path.join(process.cwd(), param.importDir) : DEFAULT_VRCHAT_FULL_PATH;
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
    if (param.debug) console.log("searching vrchat log files...")
    const filePaths = findVRChatLogFileNames(vrchatLogDirPath);
    if (param.debug) console.log("find " + filePaths.length + " log file(s): " + filePaths.map(filePath => path.basename(filePath)).join(", "));
    const parseResults = filePaths.map((filePath) => {
        return parseVRChatLog(
            fs.readFileSync(path.resolve(path.join(vrchatLogDirPath, filePath)), "utf8"),
            !!param.debug
        );
    });

    updateDBActivityLog(db, parseResults, param.debug!!);
    updateDBUserDataTable(db, parseResults);

    writeDatabase(DB_PATH, JSON.stringify(db, null, 2));
    if (param.debug) console.log("update DB done");
}

function updateDBActivityLog(db: Database, parseResults: ParseVRChatLogResult[], isDebug: boolean): void {
    const newSerializedActivityLogList: ActivityLog[] = Array.prototype.concat.apply([], parseResults.map(result => result.activityLogList));
    const currentLogLength = db.log.length;
    db.log = mergeActivityLog(db.log, newSerializedActivityLogList);
    if (isDebug) console.log("update new " +
        (
            (Number.isNaN(db.log.length) ? 0 : db.log.length) -
            (Number.isNaN(currentLogLength) ? 0 : currentLogLength)
        ) + " logs");
}

function updateDBUserDataTable(db: Database, parseResults: ParseVRChatLogResult[]) {
    const userDataTable: {[key: string]: UserDataLog} = db.userDataTable ? db.userDataTable : {};
    const newSerializedUserDataList: UserData[] = Array.prototype.concat.apply([], parseResults.map(result => result.userDataList));
    newSerializedUserDataList.forEach(userData => {
        const userId = userData.id;
        const userDataLog = userDataTable[userId] ? userDataTable[userId] : {
            latestUserData: null!,
            history: {
                displayName: []
            }
        };
        userDataLog.latestUserData = userData;
        const latestLogDisplayName = userDataLog.history.displayName.slice(-1)[0];
        if (latestLogDisplayName !== userData.displayName) userDataLog.history.displayName.push(userData.displayName);
        userDataTable[userId] = userDataLog;
    });
    db.userDataTable = userDataTable;
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

function watch(param: ViewerAppParameterObject){
    console.log("watching...");
    let shownDate = 0;
    const interval = parseInt(param.watch!, 10);

    function loop() {
        const db = loadDatabase(DB_PATH);
        updateDatabase(db, DEFAULT_VRCHAT_FULL_PATH, param);
        const currentDate = db.log[db.log.length - 1].date;
        const newLog = db.log.filter(e => e.date > shownDate);
        shownDate = currentDate;
        showActivityLog(param, newLog);
    }

    loop();
    setInterval(loop, interval * 1000);
}
