import { ActivityLog } from "./common";

// join or leave
export interface MoveActivityLog extends ActivityLog {
    userData: UserLogData;
}

export type PlayerAPIAccessType = "remote" | "local";

interface UserLogData {
    userName: string;
    access?: PlayerAPIAccessType; // join のみ
}
