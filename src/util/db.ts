import * as fs from "fs";
import * as path from "path";
import { Database } from "..";

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
    fs.writeFileSync(path.resolve(dbPath), data);
}

function createTemplateDb(): Database {
    return {
        dbVersion: 2,
        log: []
    };
}
