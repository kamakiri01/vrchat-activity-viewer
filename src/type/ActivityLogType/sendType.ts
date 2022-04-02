import { SendNotificationType } from "../..";
import { ActivityLog, ActivityType, NotificationLogData } from "./common";

// send系ログの種別
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
    activityType: typeof ActivityType.Send;
    data: SendNotificationLogData;
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

interface SendNotificationLogData extends NotificationLogData {
    senderType: SendNotificationType;
    // details: SendNotificationDetails;
    imageLen: string;
    message: string;
    type: SendNotificationType;
}

// send friend request
export interface SendFriendRequestActivityLog extends SendNotificationActivityLog {
    data: SendFriendRequestInviteLogData;
}

interface SendInviteLogData extends SendNotificationLogData {
    type: "invite";
    senderType: "invite";
}

interface SendRequestInviteLogData extends SendNotificationLogData {
    type: "requestInvite";
    senderType: "requestInvite";
}

interface SendFriendRequestInviteLogData extends SendNotificationLogData {
    type: "friendRequest";
    senderType: "friendRequest";
}
