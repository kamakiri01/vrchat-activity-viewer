import { SendNotificationInfo, SendActivityType, SendNotificationActivityLog, ActivityType } from "../..";

export function createSendNotificationActivityLog(utcTime: number, message: string, info: SendNotificationInfo) {
    let sendActivityType: SendActivityType;
    switch (info.type) {
        case "invite":
            sendActivityType = SendActivityType.Invite;
            break;
        case "requestInvite":
            sendActivityType = SendActivityType.RequestInvite;
            break;
        case "friendRequest":
            sendActivityType = SendActivityType.FriendRequest;
            break;
        case "inviteResponse":
            sendActivityType = SendActivityType.InviteResponse;
            break;
        default:
            sendActivityType = SendActivityType.Unknown;
    }
    const activity: SendNotificationActivityLog = {
        date: utcTime,
        activityType: ActivityType.Send,
        sendActivityType: sendActivityType,
        data: {
            from: {
                userName: info.from.userName,
                id: info.from.id
            },
            to: {
                id: info.to.id
            },
            created: {
                date: info.created.date,
                time: info.created.time
            },
            detailsRaw: info.detailsRaw,
            type: info.type,
            senderType: info.senderType,
            message: info.message,
            imageLen: info.imageLen
        }
    };
    return activity;
}
