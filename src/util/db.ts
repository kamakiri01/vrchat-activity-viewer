import * as fs from "fs";
import * as path from "path";
import { Database } from "../type";

export function existDatabaseFile(dbPath: string): boolean {
    try {
        fs.accessSync(dbPath);
        return true;
    } catch (error) {
        return false;
    }
}

export function initDatabase(vrchatHomePath: string, dbPath: string): void {
    const dbData = createTemplateDb(vrchatHomePath);
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), { encoding: "utf-8" });
}

export function loadDatabase(dbPath: string): Database {
    const dbJson: Database = JSON.parse(fs.readFileSync(path.resolve(dbPath), "utf8"))
    return dbJson;
}

export function writeDatabase(dbPath: string, data: string): void {
    fs.writeFileSync(path.resolve(dbPath), data);
}

function createTemplateDb(vrchatHomePath: string): Database {
    return {
        vrchatHomePath,
        log: []
    };
}
