import * as fs from "fs";
import * as path from "path";
import { Database, ActivityLog, MoveActivityLog, EnterActivityLog } from "./type";

export function existDatabase(dbPath: string): boolean {
    try {
        fs.accessSync(dbPath);
        return true;
    } catch (error) {
        return false;
    }
}

export function initDatabase(vrchatHomePath: string, dbPath: string): void {
    const dbData = createTemplateDb(vrchatHomePath);
    fs.writeFileSync(dbPath, JSON.stringify(dbData), { encoding: "utf-8" });
}

export function loadDatabase(dbPath: string): Database {
    const dbJson: Database = JSON.parse(fs.readFileSync(path.resolve(dbPath), "utf8"))
    return dbJson;
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
            activityLog.push(activity);
        } catch (error) {
            console.log(error);
        }
    });
    return activityLog;
}

// 次行のインスタンスIDを取るため全部引数に渡す
function parseRawActivityToActivity(rawActivity: string, index: number, rawActivities: string[]): ActivityLog {
    const reg = /^(\d{4}\.\d{2}\.\d{2})\s(\d{2}:\d{2}:\d{2})\s.+\[.+\]\s(.+)/.exec(rawActivity)!;
    const mmmmyydd = reg[1];
    const hhmmss = reg[2];
    const utcTime = new Date(mmmmyydd + " " + hhmmss).getTime();
    const message = reg[3];

    let activityLog: ActivityLog = null!;
    if (message.indexOf("OnPlayerJoined") != -1) {
        const activity: MoveActivityLog = {
            date: utcTime,
            activityType: "join",
            username: /^OnPlayerJoined\s(.+)/.exec(message)![1]
        };
        activityLog = activity;
    } else if (message.indexOf("OnPlayerLeft") != -1) {
        const activity: MoveActivityLog = {
            date: utcTime,
            activityType: "leave",
            username: /^OnPlayerLeft\s(.+)/.exec(message)![1]
        };
        activityLog = activity;
    } else if (message.indexOf("Joining") != -1) {
        const activity: EnterActivityLog = {
            date: utcTime,
            activityType: "enter",
            worldname: /^Entering\sRoom:\s(.+)/.exec(message)![1]
        };
        activityLog = activity;
    }

    if (activityLog) return activityLog;
    throw Error();
}

function createTemplateDb(vrchatHomePath: string): Database {
    return {
        vrchatHomePath,
        log: []
    };
}