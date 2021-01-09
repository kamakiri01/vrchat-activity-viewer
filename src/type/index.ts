// ログ保存ファイルフォーマット
export interface Database {
    vrchatHomePath: string;
    log: ActivityLog[];
}

export interface ActivityLog {
    date: number; // utc
    activityType: ActivityType;
}

const ActivityType = {
    Join: "join", // インスタンスへのユーザjoin
    Leave: "leave", // インスタンスへのユーザleave
    Enter: "enter" // ワールドへのin
} as const;
export type ActivityType = typeof ActivityType[keyof typeof ActivityType];

// join or leave
export interface MoveActivityLog extends ActivityLog {
    username: string;
}

// world in
export interface EnterActivityLog extends ActivityLog {
    worldname: string;
    // world instance id
}

// appパラメータオブジェクト
interface AppParameterObject {
    filter?: string;
    
}