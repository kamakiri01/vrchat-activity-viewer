import { ActivityLog } from "./activityLogType/common";
import { UserDataLog } from "./userData";

// ログ保存ファイルフォーマット
export interface Database {
    dbVersion: 2;
    log: ActivityLog[];
    userDataTable?: {[key: string]: UserDataLog}; // 後方互換性のため nullable
}
