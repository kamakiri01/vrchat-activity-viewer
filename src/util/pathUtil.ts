import * as fs from "fs";
import * as path from "path";

const USER_HOME = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"]!;
const DEFAULT_VRCAT_PATH = "/AppData/LocalLow/VRChat/VRChat";
export const DEFAULT_VRCHAT_FULL_PATH = path.join(USER_HOME, DEFAULT_VRCAT_PATH);
export const DB_PATH = path.join(USER_HOME, ".vrchatActivityViewer", "db.json");

export function findVRChatLogFileNames(dirPath: string): string[] {
    const logFileNames = fs.readdirSync(dirPath).filter((file) => {
        return path.extname(file) === ".txt" && path.basename(file).indexOf("output") != -1
    });
    return logFileNames;
}

export function findLatestVRChatLogFullPath(): string | null {
    let latestModifyTime = new Date(0);
    let latestFilePath: string = null!;
    findVRChatLogFileNames(DEFAULT_VRCHAT_FULL_PATH)
        .forEach((fileName) => {
            const mtime = fs.statSync(path.join(DEFAULT_VRCHAT_FULL_PATH, fileName)).mtime;
            if (latestModifyTime < mtime) {
                latestModifyTime = mtime;
                latestFilePath = fileName;
            }
        });
    return latestFilePath ? path.join(DEFAULT_VRCHAT_FULL_PATH, latestFilePath) : null;
}
