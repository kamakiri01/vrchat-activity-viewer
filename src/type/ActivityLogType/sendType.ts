import { ActivityLog, NotificationLogData } from "./common";

// Send系ログの種別
export const SendActivityType = {
    Invite: "invite",
    RequestInvite: "requestInvite",
    FriendRequest: "friendRequest",
    InviteResponse: "inviteResponse",
    Unknown: "unknown"
} as const;
export type SendActivityType = typeof SendActivityType[keyof typeof SendActivityType];

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
