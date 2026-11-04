import * as fs from "fs";
import * as path from "path";
import { Database } from "../type/Database";

export function existDatabaseFile(dbPath: string): boolean {
    try {
        fs.accessSync(dbPath);
        return true;
    } catch (error) {
        return false;
    }
}

export function initDatabase(dbPath: string): void {
    const dbData = createTemplateDb();
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), { encoding: "utf-8" });
}

export function loadDatabase(dbPath: string): Database {
    const resolvedDbPath = path.resolve(dbPath);
    try {
        const dbJson: Database = JSON.parse(fs.readFileSync(resolvedDbPath, "utf8"))
        return dbJson;
    } catch (error) {
        // 破損時は .bkup へフォールバックする。 SyntaxError のまま落とすと原因が分かりにくい
        const backupDbPath = resolvedDbPath + ".bkup";
        if (!existDatabaseFile(backupDbPath)) {
            console.log("failed to load database: " + resolvedDbPath);
            console.log("the database file may be broken. restore it from a backup, or delete it to start over");
            throw error;
        }
        console.log("failed to load database: " + resolvedDbPath);
        console.log("fall back to " + backupDbPath);
        return JSON.parse(fs.readFileSync(backupDbPath, "utf8"));
    }
}

export function writeDatabase(dbPath: string, data: string): void {
    const resolvedDbPath = path.resolve(dbPath);
    const backupDbPath = resolvedDbPath + ".bkup";
    const tmpDbPath = resolvedDbPath + ".tmp";
    const isExistDb = existDatabaseFile(resolvedDbPath);

    try {
        // DB を直接上書きすると、書き込み途中でプロセスが落ちた場合に破損する。
        // 一時ファイルへ書き出して fsync でディスクへ確定させ、原子的な rename で置き換える
        const fd = fs.openSync(tmpDbPath, "w");
        try {
            fs.writeFileSync(fd, data);
            fs.fsyncSync(fd);
        } finally {
            fs.closeSync(fd);
        }
        if (isExistDb) fs.copyFileSync(resolvedDbPath, backupDbPath);
        fs.renameSync(tmpDbPath, resolvedDbPath);
        if (existDatabaseFile(backupDbPath)) fs.rmSync(backupDbPath);
    } catch (error) {
        console.log("failed to write database. see db directory and restoration from .bkup file");
        throw error;
    }
}

function createTemplateDb(): Database {
    return {
        dbVersion: 2,
        log: [],
        userDataTable: {}
    };
}
