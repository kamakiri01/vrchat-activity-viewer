import * as fs from "fs";
import * as path from "path";
import { Database, ActivityLog, MoveActivityLog, EnterActivityLog } from "./type";

export function existDatabaseFile(dbPath: string): boolean {
    try {
        fs.accessSync(dbPath);
        return true;
    } catch (error) {
        return false;
    }
}

export function initDatabase(vrchatHomePath: string, dbPath: string): void {
    const dbData = createTemplateDb(vrchatHomePath);
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), { encoding: "utf-8" });
}

export function loadDatabase(dbPath: string): Database {
    const dbJson: Database = JSON.parse(fs.readFileSync(path.resolve(dbPath), "utf8"))
    return dbJson;
}

export function writeDatabase(dbPath: string, data: string): void {
    fs.writeFileSync(path.resolve(dbPath), data);
}

export function loadVRChatLogFile(logPath: string): string {
    const logFile = fs.readFileSync(path.resolve(logPath), "utf8");
    return logFile;
}

export function findVRChatLogFilesFromDirPath(dirPath: string): string[] {
    const logFiles = fs.readdirSync(dirPath).filter((file) => {
        return path.extname(file) === ".txt" && path.basename(file).indexOf("output") != -1
    });
    return logFiles;
}

export function mergeActivityLog(dbLog: ActivityLog[], appendLog: ActivityLog[]) {
    const tmpNewLog = dbLog.concat(appendLog);
    const formattedLog = formatDBActivityLog(tmpNewLog);
    return formattedLog;
}

export function parseVRChatLog(logString: string): ActivityLog[] {
    const lineSymbol = "\n";
    const rawActivities = logString.split(lineSymbol).filter((line) => {
        return line.length > 1; // 空行フィルタ
    })

    const activityLog: ActivityLog[] = [];
    rawActivities.forEach((rawActivity, index) => {
        try {
            const activity = parseRawActivityToActivity(rawActivity, index, rawActivities);
            if (activity) activityLog.push(activity);
        } catch (error) {
            console.log("catch error, log: " + rawActivity);
            console.log(error);
        }
    });
    return activityLog;
}

// 次行のインスタンスIDを取るため全部引数に渡す
function parseRawActivityToActivity(rawActivity: string, index: number, rawActivities: string[]): ActivityLog | null {
    const reg = /^(\d{4}\.\d{2}\.\d{2})\s(\d{2}:\d{2}:\d{2})\s.+\[.+\]\s(.+)/.exec(rawActivity)!;
    if (!reg || reg.length < 4) return null;
    const mmmmyydd = reg[1];
    const hhmmss = reg[2];
    const utcTime = new Date(mmmmyydd + " " + hhmmss).getTime();
    const message = reg[3];

    let activityLog: ActivityLog = null!;
    if (message.indexOf("OnPlayerJoined") != -1) {
        const activity: MoveActivityLog = {
            date: utcTime,
            activityType: "join",
            userData: {
                userName: /^OnPlayerJoined\s(.+)/.exec(message)![1]
            }
        };
        activityLog = activity;
    } else if (message.indexOf("OnPlayerLeft") != -1 && message.indexOf("OnPlayerLeftRoom") === -1) {
        const activity: MoveActivityLog = {
            date: utcTime,
            activityType: "leave",
            userData: {
                userName: /^OnPlayerLeft\s(.+)/.exec(message)![1]
            }
        };
        activityLog = activity;
    } else if (message.indexOf("Entering Room") != -1) {
        const worldInfo = parseEnterActivityJoinLine(rawActivities[index+1])!;
        const activity: EnterActivityLog = {
            date: utcTime,
            activityType: "enter",
            worldData: {
                worldName: /^Entering\sRoom:\s(.+)/.exec(message)![1],
                worldId: worldInfo.worldId,
                instanceId: worldInfo.instanceId,
                access: worldInfo.access,
                instanceOwner: worldInfo.instanceOwner,
                nonce: worldInfo.nonce
            }
        };
        activityLog = activity;
    }

    if (activityLog) return activityLog;
    // console.log("unsupported log: " + message);
    return null;
}

function parseEnterActivityJoinLine(joinLine: string): WorldEnterInfo | null {
    const reg = /^(\d{4}\.\d{2}\.\d{2})\s(\d{2}:\d{2}:\d{2})\s.+\[.+\]\s(.+)/.exec(joinLine)!;
    if (!reg) return null;
    const message = reg[3];

    let worldEnterInfo: WorldEnterInfo | null;
    if (joinLine.indexOf("nonce") !== -1) {
        worldEnterInfo = parseScopeEnterMessage(message);
    } else {
        worldEnterInfo = parsePublicEnterMessage(message);
    }
    return worldEnterInfo;
}

function parsePublicEnterMessage(message: string): WorldEnterInfo | null {
    const reg = /^Joining\s(wrld_[\w\-]+):(\d+)/.exec(message);
    if (!reg) return null;
    return {
        worldId: reg[1],
        instanceId: reg[2]
    };
}

function parseScopeEnterMessage(message: string): WorldEnterInfo | null {
    const reg = /^Joining\s(wrld_[\w\-]+):(\d+)~(\w+)\((usr_[\w\-]+)\)~nonce\((\w+)\)/.exec(message);
    if (!reg) return null;
    return {
        worldId: reg[1],
        instanceId: reg[2],
        access: reg[3],
        instanceOwner: reg[4],
        nonce: reg[5]
    };
}

interface WorldEnterInfo {
    worldId: string;
    instanceId: string;
    access?: string;
    instanceOwner?: string;
    nonce?: string;
}

function createTemplateDb(vrchatHomePath: string): Database {
    return {
        vrchatHomePath,
        log: []
    };
}

function formatDBActivityLog(log: ActivityLog[]): ActivityLog[] {
    const deduplicateLog = Array.from(new Set(log.map(e => JSON.stringify(e)))).map(e => JSON.parse(e) as ActivityLog);
    return deduplicateLog.sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        return 0;
    })
}
