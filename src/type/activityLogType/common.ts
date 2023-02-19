import { NotificationType } from "../common/NotificationType";

// 書き込まれるログの基底
export interface ActivityLog {
    date: number; // utc
    activityType: ActivityType;
}

// ログの大別
export const ActivityType = {
    Join: "join", // インスタンスへのユーザjoin
    Leave: "leave", // インスタンスへのユーザleave
    Enter: "enter", // ワールドへのin
    Exit: "exit", // ワールドからのout
    Send: "send",
    Receive: "receive",
    Remove: "remove", // 通知の削除
    Authentication: "authentication", // ログイン成功,
    CheckBuild: "checkBuild", // ビルド番号
    Shutdown: "shutdown", // 終了
    VideoPlay: "videoPlay", // 動画再生
    TopazPlay: "topazPlay", // TopazChatによる動画再生
    USharpVideoStarted: "usharpVideoStarted", // USharpVideoの動画リクエスト
    SDK2PlayerStarted: "sdk2PlayerStarted" // SDK2プレイヤーの動画リクエストと再生
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
