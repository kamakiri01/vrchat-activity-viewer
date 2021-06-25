import { ReceiveNotificationInfo, ReceiveActivityType, ReceiveNotificationActivityLog, ActivityType } from "../../..";
import { detailParse } from "../reg";

export function createReceiveNotificationActivityLog(utcTime: number, message: string, info: ReceiveNotificationInfo): ReceiveNotificationActivityLog {
    let receiveActivityType: ReceiveActivityType;
    switch (info.type) {
        case "invite":
            receiveActivityType = ReceiveActivityType.Invite;
            break;
        case "requestInvite":
            receiveActivityType = ReceiveActivityType.RequestInvite;
            break;
        case "friendRequest":
            receiveActivityType = ReceiveActivityType.FriendRequest;
            break;
        case "inviteResponse":
            receiveActivityType = ReceiveActivityType.InviteResponse;
            break;
        case "requestInviteResponse":
            receiveActivityType = ReceiveActivityType.RequestInviteResponse;
            break;
        default:
            receiveActivityType = ReceiveActivityType.Unknown;
    }

    const activity: ReceiveNotificationActivityLog = {
        date: utcTime,
        activityType: ActivityType.Receive,
        receiveActivityType: receiveActivityType,
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
            details: {},
            detailsRaw: info.detailsRaw,
            type: info.type,
            senderType: info.senderType
        }
    };

    const details = detailParse(info.detailsRaw);
    if (details.responseMessage) {
        activity.data.details.responseMessage = details.responseMessage;
    }
    if (details.requestMessage) {
        activity.data.details.requestMessage = details.requestMessage;
    }
    if (details.imageUrl) {
        activity.data.details.imageUrl = details.imageUrl;
    }
    return activity;
}
