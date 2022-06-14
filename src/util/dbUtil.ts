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
    const dbJson: Database = JSON.parse(fs.readFileSync(path.resolve(dbPath), "utf8"))
    return dbJson;
}

export function writeDatabase(dbPath: string, data: string): void {
    const backupDbPath = path.resolve(dbPath + ".bkup");
    const isExistDb = existDatabaseFile(dbPath);

    try {
        if (isExistDb) fs.copyFileSync(path.resolve(dbPath), backupDbPath);
        fs.writeFileSync(path.resolve(dbPath), data);
        fs.rmSync(backupDbPath);
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
