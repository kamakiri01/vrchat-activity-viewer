// ログ保存ファイルフォーマット
export interface Database {
    vrchatHomePath: string;
    log: ActivityLog[];
}

// 書き込まれるログの基底
export interface ActivityLog {
    date: number; // utc
    activityType: ActivityType;
}

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

export const SendActivityType = {
    Invite: "invite",
    RequestInvite: "requestInvite",
    FriendRequest: "friendRequest"
} as const;
export type SendActivityType = typeof SendActivityType[keyof typeof SendActivityType];

const ReceiveActivityType = {
    Invite: "invite",
    RequestInvite: "requestInvite",
    FriendRequest: "friendrequest"
} as const;
export type ReceiveActivityType = typeof ReceiveActivityType[keyof typeof ReceiveActivityType];

// join or leave
export interface MoveActivityLog extends ActivityLog {
    userData: UserData;
}

// world in
export interface EnterActivityLog extends ActivityLog {
    worldData: WorldData;
}

// send
export interface SendNotificationActivityLog extends ActivityLog {
    data: SendNotificationData;
    sendActivityType: SendActivityType;
}

// send invite
export interface SendInviteActivityLog extends SendNotificationActivityLog {
    data: SendInviteData;
}

// send reqest invite
export interface SendRequestInviteActivityLog extends SendNotificationActivityLog {
    data: SendRequestInviteData;
}

// send friend request
export interface SendFriendRequestActivityLog extends SendNotificationActivityLog {
    data: SendFriendRequestInviteData;
}

// receive
export interface ReceiveNotificationActivityLog extends ActivityLog {
    data: ReceiveNotificationData;
    receiveActivityType: ReceiveActivityType;
}

// receive invite
export interface ReceiveInviteActivityLog extends ReceiveNotificationActivityLog {
    data: ReceiveInviteData;
}

// receive reqest invite
export interface ReceiveRequestInviteActivityLog extends ReceiveNotificationActivityLog {
    data: ReceiveRequestInviteData;
}

// receive friend request
export interface ReceiveFriendRequestActivityLog extends ReceiveNotificationActivityLog {
    data: ReceiveFriendRequestInviteData;
}

// login
export interface AuthenticationActivityLog extends ActivityLog {
    username: string;
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

interface UserData {
    userName: string;
}

interface WorldData {
    worldName: string;
    worldId: string;
    access: WorldAccessScope;
    instanceId: string;
    instanceOwner?: string;
    nonce?: string;
}

export type SendNotificationType = "invite" | "requestInvite" | "friendRequest";

interface SendNotificationData {
    from: {
        userName: string;
        id: string;
    };
    to: {
        id: string;
    };
    senderType: SendNotificationType;
    created: {
        date: string;
        time: string;
    };
    details: string;
    type: SendNotificationType;
}

interface SendInviteData extends SendNotificationData {
    type: "invite";
    senderType: "invite";
}

interface SendRequestInviteData extends SendNotificationData {
    type: "requestInvite";
    senderType: "requestInvite";
}

interface SendFriendRequestInviteData extends SendNotificationData {
    type: "friendRequest";
    senderType: "friendRequest";
}


export type ReceiveNotificationType = "invite" | "requestInvite" | "friendRequest";

interface ReceiveNotificationData {
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

interface ReceiveInviteData extends ReceiveNotificationData {
    type: "invite";
    senderType: "invite";
}

interface ReceiveRequestInviteData extends ReceiveNotificationData {
    type: "requestInvite";
    senderType: "requestInvite";
}

interface ReceiveFriendRequestInviteData extends ReceiveNotificationData {
    type: "friendRequest";
    senderType: "friendRequest";
}
