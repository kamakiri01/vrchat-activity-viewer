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
    CheckBuild: "checkBuild"
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
export type ReceiveActivityType = typeof ReceiveActivityType[keyof typeof SendActivityType];


// join or leave
export interface MoveActivityLog extends ActivityLog {
    userData: UserData;
}

// world in
export interface EnterActivityLog extends ActivityLog {
    worldData: WorldData;
}

export type SendNotificationType = "invite" | "requestInvite" | "friendRequest";

// send
export interface SendNotificationActivityLog extends ActivityLog {
    data: SendNotificationData;
    sendActivityType: SendActivityType;
}

// send invite
export interface InviteActivityLog extends SendNotificationActivityLog {
    data: InviteData;
}

// send reqest invite
export interface RequestInviteActivityLog extends SendNotificationActivityLog {
    data: RequestInviteData;
}

// send friend request
export interface FriendRequestActivityLog extends SendNotificationActivityLog {
    data: FriendRequestInviteData;
}

// login
export interface AuthenticationActivityLog extends ActivityLog {
    username: string;
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

interface InviteData extends SendNotificationData {
    type: "invite";
    senderType: "invite";
}

interface RequestInviteData extends SendNotificationData {
    type: "requestInvite";
    senderType: "requestInvite";
}

interface FriendRequestInviteData extends SendNotificationData {
    type: "friendRequest";
    senderType: "friendRequest";
}
