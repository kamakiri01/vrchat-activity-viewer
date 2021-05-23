import { ReceiveNotificationType } from "../..";
import { ActivityLog } from "./common";

// Receive系ログの種別
export const ReceiveActivityType = {
    Invite: "invite",
    RequestInvite: "requestInvite",
    FriendRequest: "friendRequest",
    InviteResponse: "inviteResponse",
    RequestInviteResponse: "requestInviteResponse",
    Unknown: "unknown"
} as const;
export type ReceiveActivityType = typeof ReceiveActivityType[keyof typeof ReceiveActivityType];

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
    details: ReceiveNotificationDetails;
    detailsRaw: string;
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

interface ReceiveNotificationDetails {
    responseMessage?: string;
    requestMessage?: string;
    imageUrl? : string;
}
