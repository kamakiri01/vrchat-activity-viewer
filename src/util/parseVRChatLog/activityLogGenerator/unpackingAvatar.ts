import type { UnpackingAvatarActivityLog } from "../../../type/activityLogType/unpackingAvatarType";
import { ActivityType } from "../../..";

export function createUnpackingAvatarActivityLog(utcTime: number, message: string): UnpackingAvatarActivityLog {
    const reg = /\[AssetBundleDownloadManager\] \[(\d*)\] Unpacking Avatar \((.*) by (.*)\)/.exec(message)!;
    const activity: UnpackingAvatarActivityLog = {
        date: utcTime,
        activityType: ActivityType.UnpackingAvatar,
        avatarAuthor: reg[3],
        avatarName: reg[2]
    };
    return activity;
}
