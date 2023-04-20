import { RegionType, WorldAccessScope } from "../common";
import { ActivityLog, ActivityType } from "./common";

// world in
export interface EnterActivityLog extends ActivityLog {
    activityType: typeof ActivityType.Enter;
    worldData: WorldLogData;
}

// world out
// NOTE: OnLeftRoomログはlocalプレイヤーのLeaveとほぼ同時刻に記録される。local/remoteプレイヤーのLeaveと順序が前後しうる。
// OnLeftRoomに対応する入室ログはOnJoinedRoomだが、
// ワールド名を取得するために使用しているEntering Roomに対応する退室ログは無いため非対称な関係のログを使う。
export interface ExitActivityLog extends ActivityLog {
    activityType: typeof ActivityType.Exit;
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
