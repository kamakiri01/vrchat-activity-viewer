import { RegionType, WorldAccessScope } from "../common";
import { ActivityLog, ActivityType } from "./common";

// world in
export interface EnterActivityLog extends ActivityLog {
    activityType: typeof ActivityType.Enter;
    worldData: WorldLogData;
}

// login
export interface AuthenticationActivityLog extends ActivityLog {
    activityType: typeof ActivityType.Authentication;
    userName: string;
}

// shotdown
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ShutdownActivityLog extends ActivityLog {
    activityType: typeof ActivityType.Shutdown
    // nothing
}

export interface CheckBuildActivityLog extends ActivityLog {
    activityType: typeof ActivityType.CheckBuild
    buildName: string;
}

interface WorldLogData {
    worldName: string;
    worldId: string;
    access: WorldAccessScope;
    instanceId: string;
    instanceOwner?: string;
    region?: RegionType;
    nonce?: string;
}
