import { NotificationType, ReceiveNotificationType } from "./common/NotificationType";

// ログ保存ファイルフォーマット
export interface Database {
    vrchatHomePath: string;
    log: ActivityLog[];
    // userTable: UserTable;
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
    Authentication: "authentication", // ログイン成功,
    CheckBuild: "checkBuild", // ビルド番号
    Shutdown: "shutdown" // 終了
} as const;
export type ActivityType = typeof ActivityType[keyof typeof ActivityType];

// Send系ログの種別
export const SendActivityType = {
    Invite: "invite",
    RequestInvite: "requestInvite",
    FriendRequest: "friendRequest",
    InviteResponse: "inviteResponse",
    Unknown: "unknown"
} as const;
export type SendActivityType = typeof SendActivityType[keyof typeof SendActivityType];

// Receive系ログの種別
export const ReceiveActivityType = {
    Invite: "invite",
    RequestInvite: "requestInvite",
    FriendRequest: "friendRequest",
    RequestInviteResponse: "requestInviteResponse",
    Unknown: "unknown"
} as const;
export type ReceiveActivityType = typeof ReceiveActivityType[keyof typeof ReceiveActivityType];

// join or leave
export interface MoveActivityLog extends ActivityLog {
    userData: UserLogData;
}

// world in
export interface EnterActivityLog extends ActivityLog {
    worldData: WorldLogData;
}

// send
export interface SendNotificationActivityLog extends ActivityLog {
    data: NotificationLogData;
    sendActivityType: SendActivityType;
}

// send invite
export interface SendInviteActivityLog extends SendNotificationActivityLog {
    data: SendInviteLogData;
}

// send reqest invite
export interface SendRequestInviteActivityLog extends SendNotificationActivityLog {
    data: SendRequestInviteLogData;
}

// send friend request
export interface SendFriendRequestActivityLog extends SendNotificationActivityLog {
    data: SendFriendRequestInviteLogData;
}

// receive
export interface ReceiveNotificationActivityLog extends ActivityLog {
    data: ReceiveNotificationLogData;
    receiveActivityType: ReceiveActivityType;
}

// receive invite
export interface ReceiveInviteActivityLog extends ReceiveNotificationActivityLog {
    data: ReceiveInviteLogData;
}

// receive reqest invite
export interface ReceiveRequestInviteActivityLog extends ReceiveNotificationActivityLog {
    data: ReceiveRequestInviteLogData;
}

// receive friend request
export interface ReceiveFriendRequestActivityLog extends ReceiveNotificationActivityLog {
    data: ReceiveFriendRequestInviteLogData;
}

// login
export interface AuthenticationActivityLog extends ActivityLog {
    userName: string;
}

// shotdown
export interface ShutdownActivityLog extends ActivityLog {
    // nothing
}

export interface CheckBuildActivityLog extends ActivityLog {
    buildName: string;
}

// world scope
export type WorldAccessScope = "invite" | "invite+" | "friends" | "friends+" | "public" | "unknown";

interface UserLogData {
    userName: string;
}

interface WorldLogData {
    worldName: string;
    worldId: string;
    access: WorldAccessScope;
    instanceId: string;
    instanceOwner?: string;
    nonce?: string;
}

interface NotificationLogData {
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
    details: string;
    type: NotificationType;
}

interface SendInviteLogData extends NotificationLogData {
    type: "invite";
    senderType: "invite";
}

interface SendRequestInviteLogData extends NotificationLogData {
    type: "requestInvite";
    senderType: "requestInvite";
}

interface SendFriendRequestInviteLogData extends NotificationLogData {
    type: "friendRequest";
    senderType: "friendRequest";
}

interface ReceiveNotificationLogData {
    from: {
        userName: string;
        id: string;
    };
    to: {
        id: string;
    };
    senderType: ReceiveNotificationType;
    created: {
        date: string;
        time: string;
    };
    details: string;
    type: ReceiveNotificationType;
}

interface ReceiveInviteLogData extends ReceiveNotificationLogData {
    type: "invite";
    senderType: "invite";
}

interface ReceiveRequestInviteLogData extends ReceiveNotificationLogData {
    type: "requestInvite";
    senderType: "requestInvite";
}

interface ReceiveFriendRequestInviteLogData extends ReceiveNotificationLogData {
    type: "friendRequest";
    senderType: "friendRequest";
}
