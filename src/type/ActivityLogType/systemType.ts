import { RegionType, WorldAccessScope } from "../common";
import { ActivityLog } from "./common";

// world in
export interface EnterActivityLog extends ActivityLog {
    worldData: WorldLogData;
}

// login
export interface AuthenticationActivityLog extends ActivityLog {
    userName: string;
}

// shotdown
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ShutdownActivityLog extends ActivityLog {
    // nothing
}

export interface CheckBuildActivityLog extends ActivityLog {
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
