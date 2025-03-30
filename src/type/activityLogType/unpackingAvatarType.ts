import { ActivityLog, ActivityType } from "./common";

// unpacking avatar
export interface UnpackingAvatarActivityLog extends ActivityLog {
    activityType: typeof ActivityType.UnpackingAvatar;
    avatarName: string;
    avatarAuthor: string;
}
