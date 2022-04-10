import { ActivityLog } from "./ActivityLogType/common";

// ログ保存ファイルフォーマット
export interface Database {
    dbVersion: 2;
    log: ActivityLog[];
}
