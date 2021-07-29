import { ActivityLog } from "./common";

// join or leave
export interface MoveActivityLog extends ActivityLog {
    userData: UserLogData;
}

export type PlayerAPIAccess = "remote" | "local";

interface UserLogData {
    userName: string;
    access?: PlayerAPIAccess; // join のみ
}
