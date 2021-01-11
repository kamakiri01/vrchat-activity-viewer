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
    userData: UserData;
}

// world in
export interface EnterActivityLog extends ActivityLog {
    worldData: WorldData;
}

interface UserData {
    userName: string;
}

interface WorldData {
    worldName: string;
    worldId: string;
    instanceId: string;
    access?: string;
    instanceOwner?: string;
    nonce?: string;
}
