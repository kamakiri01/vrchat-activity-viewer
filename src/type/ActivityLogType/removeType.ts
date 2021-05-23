import { RemoveNotificationType, SendNotificationType } from "../..";
import { ActivityLog, NotificationLogData } from "./common";

// Remove Notification系ログの種別
export const RemoveActivityType = {
    Invite: "invite",
    RequestInvite: "requestInvite",
    FriendRequest: "friendRequest",
    InviteResponse: "inviteResponse",
    RequestInviteResponse: "requestInviteResponse",
    Unknown: "unknown"
} as const;
export type RemoveActivityType = typeof RemoveActivityType[keyof typeof RemoveActivityType];

// send
export interface RemoveNotificationActivityLog extends ActivityLog {
    data: RemoveNotificationLogData;
    removeActivityType: RemoveActivityType;
}

// send invite
export interface RemoveInviteActivityLog extends RemoveNotificationActivityLog {
    data: RemoveInviteLogData;
}

// send reqest invite
export interface RemoveRequestInviteActivityLog extends RemoveNotificationActivityLog {
    data: RemoveRequestInviteLogData;
}

interface RemoveNotificationLogData extends NotificationLogData {
    senderType: RemoveNotificationType;
    details: RemoveNotificationDetails;
    detailsRaw: string;
    message: string;
    type: RemoveNotificationType;
}

// send friend request
export interface RemoveFriendRequestActivityLog extends RemoveNotificationActivityLog {
    data: RemoveFriendRequestInviteLogData;
}

interface RemoveInviteLogData extends RemoveNotificationLogData {
    type: "invite";
    senderType: "invite";
}

interface RemoveRequestInviteLogData extends RemoveNotificationLogData {
    type: "requestInvite";
    senderType: "requestInvite";
}

interface RemoveFriendRequestInviteLogData extends RemoveNotificationLogData {
    type: "friendRequest";
    senderType: "friendRequest";
}

interface RemoveNotificationDetails {
    worldId?: string;
    worldName?: string;
}
