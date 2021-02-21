import { NotificationType, ReceiveNotificationType, SendNotificationType } from "./common/NotificationType";
import { WorldAccessScope } from "./logType";

// VRChatログファイルのパース結果の型

// ワールドin時のログのパース結果
export interface WorldEnterInfo {
    worldId: string;
    instanceId: string;
    access: WorldAccessScope;
    instanceOwner?: string;
    canRequestInvite?: string;
    nonce?: string;
}

/**
 * Send/Receive通知ログのパース結果
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
    details: string;
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
