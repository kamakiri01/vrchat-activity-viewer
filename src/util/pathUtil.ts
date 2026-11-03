import * as fs from "fs";
import * as path from "path";

const USER_HOME = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"]!;
const VRCHAT_PREFIX = process.platform == "win32" ? "" : ".local/share/Steam/steamapps/compatdata/438100/pfx/drive_c/users/steamuser";
const DEFAULT_VRCHAT_PATH = "/AppData/LocalLow/VRChat/VRChat";
export const DEFAULT_VRCHAT_FULL_PATH = path.join(USER_HOME, VRCHAT_PREFIX, DEFAULT_VRCHAT_PATH);
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

/**
 * 一定時間更新されていないログファイルを、ログディレクトリ配下の dirName へ移動する。
 * VRChat が書き込み中のログファイルは更新時刻が新しいため、閾値判定のみで移動対象から外れる。
 * 移動したファイルは次回以降のパース対象から外れるが、 DB に取り込んだログはそのまま残る。
 * @param thresholdMs この時間以上更新されていないファイルを移動する
 * @returns 移動したファイル名の一覧
 */
export function moveNoUpdateLogFiles(logDirPath: string, dirName: string, thresholdMs: number, isDebug?: boolean): string[] {
    const srcDirPath = path.resolve(logDirPath);
    const destDirPath = path.resolve(logDirPath, dirName);
    if (destDirPath === srcDirPath) {
        if (isDebug) console.log("skip moving log files: destination is the log directory itself");
        return [];
    }
    const currentTime = Date.now();
    const targetFileNames = findVRChatLogFileNames(srcDirPath).filter((fileName) => {
        try {
            const stat = fs.statSync(path.join(srcDirPath, fileName));
            // 更新が新しいファイルは移動しない。 VRChat が書き込み中のログはここで除外される
            return stat.isFile() && currentTime - stat.mtimeMs >= thresholdMs;
        } catch (error) {
            if (isDebug) console.log("failed to stat " + fileName + ": " + (error as Error).message);
            return false;
        }
    });
    if (targetFileNames.length === 0) return []; // 移動対象がない場合は移動先を作らない

    fs.mkdirSync(destDirPath, { recursive: true });
    const movedFileNames: string[] = [];
    targetFileNames.forEach((fileName) => {
        try {
            fs.renameSync(path.join(srcDirPath, fileName), path.join(destDirPath, fileName));
            movedFileNames.push(fileName);
        } catch (error) {
            // VRChat が掴んでいるファイルなど移動できないものがあっても、残りの処理を続ける
            if (isDebug) console.log("failed to move " + fileName + ": " + (error as Error).message);
        }
    });
    return movedFileNames;
}
