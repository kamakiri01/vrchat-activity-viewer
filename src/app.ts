import * as path from "path";
import { initDatabase, existDatabase, loadDatabase } from "./util";

const DEFAULT_VRCAT_PATH = "/AppData/LocalLow/VRChat/VRChat";

export interface appParameterObject {
    init?: boolean;
    import?: string;
    filter?: string;
}

export function app(param: appParameterObject) {
    console.log("param",param);
    const dbPath = path.join(path.dirname(process.argv[1]), "..", "db.json"); // コマンド root
    console.log("dbpath", dbPath);
    if (param.init) {
        const userHome = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"]!;
        initDatabase(path.join(userHome, DEFAULT_VRCAT_PATH), dbPath);
        return;
    }

    if (existDatabase(dbPath)) {
        const db = loadDatabase(dbPath);
        console.log("db", db);
    }
}
