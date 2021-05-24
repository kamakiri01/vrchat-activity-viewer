import { ActivityLog } from "./common";

// join or leave
export interface MoveActivityLog extends ActivityLog {
    userData: UserLogData;
}

interface UserLogData {
    userName: string;
}
