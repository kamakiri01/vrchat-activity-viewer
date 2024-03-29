import { RemoveNotificationInfo, ActivityType } from "../../..";
import { RemoveActivityType, RemoveNotificationActivityLog } from "../../../type/activityLogType/removeType";
import { detailParse } from "../parseUtil";

export function createRemoveNotificationActivityLog(utcTime: number, message: string, info: RemoveNotificationInfo): RemoveNotificationActivityLog {
    let removeActivityType: RemoveActivityType;
    switch (info.type) {
        case "invite":
            removeActivityType = RemoveActivityType.Invite;
            break;
        case "requestInvite":
            removeActivityType = RemoveActivityType.RequestInvite;
            break;
        case "friendRequest":
            removeActivityType = RemoveActivityType.FriendRequest;
            break;
        case "inviteResponse":
            removeActivityType = RemoveActivityType.InviteResponse;
            break;
        case "requestInviteResponse":
            removeActivityType = RemoveActivityType.RequestInviteResponse;
            break;
        default:
            removeActivityType = RemoveActivityType.Unknown;
    }

    const activity: RemoveNotificationActivityLog = {
        date: utcTime,
        activityType: ActivityType.Remove,
        removeActivityType: removeActivityType,
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
            senderType: info.senderType,
            message: info.message
        }
    };
    const details = detailParse(info.detailsRaw);
    if (details.worldId) {
        activity.data.details.worldId = details.worldId;
    }
    if (details.worldName) {
        activity.data.details.worldName = details.worldName;
    }
    if (details.inviteMessage) activity.data.details.inviteMessage = details.inviteMessage;
    if (details.requestMessage) activity.data.details.requestMessage = details.requestMessage;
    if (details.imageUrl) activity.data.details.imageUrl = details.imageUrl;
    return activity;
}
