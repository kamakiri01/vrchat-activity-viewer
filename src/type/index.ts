// ログ保存ファイルフォーマット
export interface Database {
    vrchatHomePath: string;
    log: ActivityLog[];
}

export interface ActivityLog {
    date: number; // utc
    activityType: ActivityType;
}

const ActivityType = {
    Join: "join", // インスタンスへのユーザjoin
    Leave: "leave", // インスタンスへのユーザleave
    Enter: "enter", // ワールドへのin,
    Invite: "invite",
    RequestInvite: "requestInvite",
    FriendRequest: "friendrequest"
} as const;
export type ActivityType = typeof ActivityType[keyof typeof ActivityType];

// join or leave
export interface MoveActivityLog extends ActivityLog {
    userData: UserData;
}

// world in
export interface EnterActivityLog extends ActivityLog {
    worldData: WorldData;
}

type SendNotificationType = "invite" | "requestInvite" | "friendRequest";
export interface SendNotificationActivityLog extends ActivityLog {
    data: SendNotificationData;
}

export interface InviteActivityLog extends SendNotificationActivityLog {
    data: InviteData;
}

export interface RequestInviteActivityLog extends SendNotificationActivityLog {
    data: RequestInviteData;
}

export interface FriendRequestActivityLog extends SendNotificationActivityLog {
    data: FriendRequestInviteData;
}

export type AccessScope = "invite" | "invite+" | "friends" | "friends+" | "public" | "unknown";

interface UserData {
    userName: string;
}

interface WorldData {
    worldName: string;
    worldId: string;
    access: AccessScope;
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
