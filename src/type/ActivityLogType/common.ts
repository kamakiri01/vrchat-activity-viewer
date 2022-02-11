import { NotificationType } from "../common/NotificationType";

// ログ保存ファイルフォーマット
export interface Database {
    dbVersion: 2;
    log: ActivityLog[];
}

// 書き込まれるログの基底
export interface ActivityLog {
    date: number; // utc
    activityType: ActivityType;
}

// ログの大別
export const ActivityType = {
    Join: "join", // インスタンスへのユーザjoin
    Leave: "leave", // インスタンスへのユーザleave
    Enter: "enter", // ワールドへのin,
    Send: "send",
    Receive: "receive",
    Remove: "remove", // 通知の削除
    Authentication: "authentication", // ログイン成功,
    CheckBuild: "checkBuild", // ビルド番号
    Shutdown: "shutdown", // 終了
    VideoPlay: "videoPlay", // 動画再生
    USharpVideoStarted: "usharpVideoStarted" // USharpVideoの動画リクエスト
} as const;
export type ActivityType = typeof ActivityType[keyof typeof ActivityType];

// 通知系ログの基底型
export interface NotificationLogData {
    from: {
        userName: string;
        id: string;
    };
    to: {
        id: string;
    };
    senderType: NotificationType;
    created: {
        date: string;
        time: string;
    };
    detailsRaw: string;
    type: NotificationType;
}
