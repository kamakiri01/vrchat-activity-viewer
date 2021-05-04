import * as fs from "fs";

import path = require("path");
export const USER_HOME = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"]!;
export const DEFAULT_VRCAT_PATH = "/AppData/LocalLow/VRChat/VRChat";
export const DEFAULT_VRCHAT_FULL_PATH = path.join(USER_HOME, DEFAULT_VRCAT_PATH);
export const DB_PATH = path.join(USER_HOME, ".vrchatActivityViewer", "db.json");

export function loadVRChatLogFile(logPath: string): string {
    const logFile = fs.readFileSync(path.resolve(logPath), "utf8");
    return logFile;
}

export function findVRChatLogFilePaths(dirPath: string): string[] {
    const logFiles = fs.readdirSync(dirPath).filter((file) => {
        return path.extname(file) === ".txt" && path.basename(file).indexOf("output") != -1
    });
    return logFiles;
}

export function findVRChatLogPathLatest(dirPath: string): string {
    let latestModifyTime = new Date(0);
    let latestFilePath = "";
    findVRChatLogFilePaths(dirPath)
        .forEach((filePath) => {
            const mtime = fs.statSync(path.join(DEFAULT_VRCHAT_FULL_PATH, filePath)).mtime;
            if (latestModifyTime < mtime) {
                latestModifyTime = mtime;
                latestFilePath = filePath;
            }
        })
    return path.join(DEFAULT_VRCHAT_FULL_PATH, latestFilePath);
}
