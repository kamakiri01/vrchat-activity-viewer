import { WorldAccessScope, NotificationType } from "./logType";

export interface WorldEnterInfo {
    worldId: string;
    instanceId: string;
    access: WorldAccessScope;
    instanceOwner?: string;
    canRequestInvite?: string;
    nonce?: string;
}

export interface NotificationInfo {
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
