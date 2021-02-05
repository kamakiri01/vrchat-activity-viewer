import * as fs from "fs";
import * as path from "path";
import { ActivityLog } from "../type/logType";

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

function formatDBActivityLog(log: ActivityLog[]): ActivityLog[] {
    const deduplicateLog = Array.from(new Set(log.map(e => JSON.stringify(e)))).map(e => JSON.parse(e) as ActivityLog);
    return deduplicateLog.sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        return 0;
    })
}
