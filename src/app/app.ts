import * as path from "path";
import * as fs from "fs";
import { existDatabaseFile, initDatabase, loadDatabase, writeDatabase } from "../util/dbUtil";
import { parseVRChatLog, ParseVRChatLogResult } from "../util/parseVRChatLog/parseVRChatLog";
import { DB_PATH, DEFAULT_VRCHAT_FULL_PATH, findVRChatLogFileNames } from "../util/pathUtil";
import { showActivityLog } from "./showActivityLog";
import { ActivityLog, ActivityType } from "../type/activityLogType/common";
import { VideoPlayActivityLog } from "../type/activityLogType/videoPlayType";
import { ViewerAppParameterObject } from "../type/AppConfig";
import { Database } from "../type/Database";
import { UserData, UserDataLog } from "../type/userData";
import { fetchVideoTitles, isVideoTitleFetchable } from "../util/videoTitle/fetchVideoTitle";

const FETCH_TITLE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // これより古いログのタイトルは取得しない
const FETCH_TITLE_MAX_PER_RUN = 50; // 一度の実行で取得するタイトル数の上限

export async function app(param: ViewerAppParameterObject): Promise<void> {
    completeParameterObject(param);
    if (!existDatabaseFile(DB_PATH)) initDatabase(DB_PATH);

    if (param.importDir) {
        await importDir(param);
    } else if (param.watch) {
        watch(param);
    } else {
        const db = loadDatabase(DB_PATH);
        await updateDatabase(db, DEFAULT_VRCHAT_FULL_PATH, param);
        showActivityLog(param, db.log);
    }
}

function completeParameterObject(param: ViewerAppParameterObject) {
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

async function updateDatabase(db: Database, vrchatLogDirPath: string, param: ViewerAppParameterObject): Promise<void> {
    const debug = !!param.debug;
    if (debug) console.log("searching vrchat log files...")
    const filePaths = findVRChatLogFileNames(vrchatLogDirPath);
    if (debug) console.log("find " + filePaths.length + " log file(s): " + filePaths.map(filePath => path.basename(filePath)).join(", "));
    const parseResults = filePaths.map((filePath) => {
        return parseVRChatLog(
            fs.readFileSync(path.resolve(path.join(vrchatLogDirPath, filePath)), "utf8"),
            !!debug
        );
    });

    const appendedLogs = updateDBActivityLog(db, parseResults, !!debug);
    updateDBUserDataTable(db, parseResults);
    await updateVideoTitles(appendedLogs, param);

    writeDatabase(DB_PATH, JSON.stringify(db, null, 2));
    if (debug) console.log("update DB done");
}

/**
 * @returns 今回の実行で db に新規追加されたログ。要素は db.log と同じ参照
 */
function updateDBActivityLog(db: Database, parseResults: ParseVRChatLogResult[], isDebug: boolean): ActivityLog[] {
    const newSerializedActivityLogList: ActivityLog[] = Array.prototype.concat.apply([], parseResults.map(result => result.activityLogList));
    const knownKeys = new Set(db.log.map(activityLogKey)); // マージ前に既存ログを控える
    const currentLogLength = db.log.length;
    db.log = mergeActivityLog(db.log, newSerializedActivityLogList);
    if (isDebug) console.log("update new " +
        (
            (Number.isNaN(db.log.length) ? 0 : db.log.length) -
            (Number.isNaN(currentLogLength) ? 0 : currentLogLength)
        ) + " logs");
    return db.log.filter(e => !knownKeys.has(activityLogKey(e)));
}

/**
 * 新規追加された videoPlay ログにのみタイトルを付与する。
 * ログファイルは毎回再パースされるため、既に db にあるログを対象にすると yt-dlp を呼び直すことになる
 */
async function updateVideoTitles(appendedLogs: ActivityLog[], param: ViewerAppParameterObject): Promise<void> {
    if (param.videoTitle === false) return;

    const currentTime = Date.now();
    const targetLogs = appendedLogs.filter(e => {
        return e.activityType === ActivityType.VideoPlay &&
            currentTime - e.date < FETCH_TITLE_MAX_AGE_MS &&
            isVideoTitleFetchable((e as VideoPlayActivityLog).url);
    }) as VideoPlayActivityLog[];

    // 同じ動画を繰り返し再生していても yt-dlp の実行は URL ごとに一度で済ませる
    const targetUrls = Array.from(new Set(targetLogs.map(e => e.url))).slice(0, FETCH_TITLE_MAX_PER_RUN);
    if (targetUrls.length === 0) return;
    if (param.debug) console.log("fetching " + targetUrls.length + " video title(s)...");

    const titleTable = await fetchVideoTitles(targetUrls, !!param.debug);
    targetLogs.forEach(log => {
        if (titleTable[log.url]) log.title = titleTable[log.url];
    });
    if (param.debug) console.log("fetch " + Object.keys(titleTable).length + " video title(s)");
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

/**
 * ログの同一性判定キー。
 * title はログファイルに存在せず再パース時は常に欠落するため、同一性の判定に使わない
 */
function activityLogKey(log: ActivityLog): string {
    return JSON.stringify(log, (key, value) => key === "title" ? undefined : value);
}

function formatDBActivityLog(log: ActivityLog[]): ActivityLog[] {
    const logMap = new Map<string, ActivityLog>();
    log.forEach(e => {
        const key = activityLogKey(e);
        const current = logMap.get(key) as VideoPlayActivityLog | undefined;
        // 同一ログが重複する場合、 title を持つ方を残す
        if (!current || (!current.title && (e as VideoPlayActivityLog).title)) logMap.set(key, e);
    });
    return Array.from(logMap.values()).sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        return 0;
    })
}

async function importDir(param: ViewerAppParameterObject) {
    console.log("importing...");
    const db = loadDatabase(DB_PATH);
    await updateDatabase(db, param.importDir!, param);
}

function watch(param: ViewerAppParameterObject) {
    console.log("watching...");
    let shownDate = 0;
    let isRunning = false;
    const interval = parseInt(param.watch!, 10);

    async function loop() {
        // タイトル取得が interval より長引いた場合に多重実行しない
        if (isRunning) return;
        isRunning = true;
        try {
            await updateAndShow();
        } finally {
            isRunning = false;
        }
    }

    async function updateAndShow() {
        const db = loadDatabase(DB_PATH);
        await updateDatabase(db, DEFAULT_VRCHAT_FULL_PATH, param);
        const currentDate = db.log[db.log.length - 1].date;
        const newLog = db.log.filter(e => e.date > shownDate);
        shownDate = currentDate;
        showActivityLog(param, newLog);
    }

    loop();
    setInterval(loop, interval * 1000);
}
