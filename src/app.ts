import * as path from "path";
import { initDatabase, loadDatabase, existDatabaseFile, findVRChatLogFilesFromDirPath, loadVRChatLogFile, parseVRChatLog, mergeActivityLog, writeDatabase } from "./util";
import { ActivityLog, MoveActivityLog, EnterActivityLog } from "./type";

const DEFAULT_VRCAT_PATH = "/AppData/LocalLow/VRChat/VRChat";

export interface appParameterObject {
    import?: string;
    filter?: string;
}

export function app(param: appParameterObject) {
    console.log("param",param);
    const dbPath = path.join(path.dirname(process.argv[1]), "..", "db.json"); // コマンド root
    console.log("dbpath", dbPath);
    if (!existDatabaseFile(dbPath)) {
        console.log("generate db.json in app dir...")
        const userHome = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"]!;
        initDatabase(path.join(userHome, DEFAULT_VRCAT_PATH), dbPath);
    }

    const db = loadDatabase(dbPath);
    const vrchaLogPath = db.vrchatHomePath;
    console.log("searching vrchat log files...")
    const filePaths = findVRChatLogFilesFromDirPath(vrchaLogPath);
    console.log("find vrchat log file(s): " + filePaths.map(filePath => path.basename(filePath)).join(", "));
    const logs = filePaths.map((filePath) => {
        return parseVRChatLog(loadVRChatLogFile(path.join(vrchaLogPath, filePath)));
    });
    const newLog: ActivityLog[] = Array.prototype.concat.apply([], logs);
    const currentLogLength = db.log.length;
    const newDbLog = mergeActivityLog(db.log, newLog);
    console.log("update " + (newDbLog.length - currentLogLength) + " logs");
    db.log = newDbLog;
    writeDatabase(dbPath, JSON.stringify(db, null, 2));
    console.log("update DB done");

    // show log
    console.log("--- Activity Log ---")
    const currentTime = Date.now();
    const daymillisecond = 24 * 60 * 60 * 1000;
    // const showLog = newDbLog.filter(e => currentTime - e.date < daymillisecond);
    const showLog = newDbLog;
    showLog.forEach(e => {
        const date = new Date(e.date);
        let message = date.toLocaleDateString() + " " + date.toLocaleTimeString() + " ";
        switch (e.activityType) {
            case "join":
            case "leave":
                message += e.activityType + " " +  (<MoveActivityLog>e).username;
                break;
            case "enter":
                message += e.activityType + " " + (<EnterActivityLog>e).worldname;
                break;
        }
        console.log(message);
        // console.log(date.toLocaleDateString() + " " + date.toLocaleTimeString() + " " + e.activityType);
    })
}
