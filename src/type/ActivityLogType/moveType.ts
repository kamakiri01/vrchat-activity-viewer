import { ActivityLog, ActivityType } from "./common";

// join or leave
export interface MoveActivityLog extends ActivityLog {
    activityType: typeof ActivityType.Join | typeof ActivityType.Leave;
    userData: UserLogData;
}

export type PlayerAPIAccessType = "remote" | "local";

interface UserLogData {
    userName: string;
    access?: PlayerAPIAccessType; // join のみ
}
