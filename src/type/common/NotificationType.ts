export type NotificationType = SendNotificationType | ReceiveNotificationType | RemoveNotificationType;

export type SendNotificationType =
    "invite" |
    "requestInvite" | 
    "friendRequest" | 
    "inviteResponse";

export type ReceiveNotificationType =
    "invite" | // インバイト受信
    "requestInvite" | // リクイン受信
    "friendRequest" | // フレンドリクエスト受信
    "inviteResponse"| // 送ったインバイトへの返答受信
    "requestInviteResponse";

export type RemoveNotificationType =
    "invite" | // インバイト受信
    "requestInvite" | // リクイン受信
    "friendRequest" | // フレンドリクエスト受信
    "inviteResponse"| // 送ったインバイトへの返答受信
    "requestInviteResponse";

export type ReceiveNotificationFromType =
    "AllTime"|
    "Recent";
