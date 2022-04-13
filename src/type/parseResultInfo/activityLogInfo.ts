import { ReceiveNotificationType, RemoveNotificationType, SendNotificationType } from "../common/NotificationType";
import { NotificationFromType, RegionType, WorldAccessScope } from "../common";

// VRChatログファイルのパース結果を表現する中間型

// ワールドin時のログのパース結果
export interface WorldEnterInfo {
    worldId: string;
    instanceId: string;
    access: WorldAccessScope;
    instanceOwner?: string;
    region?: RegionType;
    canRequestInvite?: string;
    nonce?: string;
}

/**
 * Send/Receive/Remove通知ログのパース結果
 * 
 * 共通箇所のみ
 */
export interface NotificationInfo {
    from: {
        userName: string;
        id: string;
    };
    to: {
        id: string;
    };
    created: {
        date: string;
        time: string;
    };
    detailsRaw: string;
    m_seen: string;
    message: string;
    imageLen: string;
}

export interface ReceiveNotificationInfo extends NotificationInfo {
    senderType: ReceiveNotificationType;
    type: ReceiveNotificationType;
}

export interface SendNotificationInfo extends NotificationInfo {
    senderType: SendNotificationType;
    type: SendNotificationType;
}

export interface RemoveNotificationInfo extends NotificationInfo {
    senderType: RemoveNotificationType;
    type: RemoveNotificationType;
    fromType: NotificationFromType;
}
