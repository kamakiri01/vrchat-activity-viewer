import { UserData } from "../../../type/userData";
import { parseMessageBodyFromLogLine, parseSquareBrackets } from "../parseUtil";

export function parseUserDataMessage(userDataLine: string): UserData | null {
    const reg = parseMessageBodyFromLogLine(userDataLine);
    if (!reg || reg.length < 4) return null;
    const reg2 = parseSquareBrackets(reg[3]);
    if (!reg2 || reg2.length < 4) return null;
    const message = reg2[3];

    try {
        const reg = /\{(\{[^]+\})\}/.exec(message)!;
        const jsonText = reg[1];
        return convertRawJsonToUserData(jsonText);
    } catch (error: any) {
        return null;
    }
}

function convertRawJsonToUserData(rawUserDataText: string): UserData {
    const copyRawUserData = JSON.parse(rawUserDataText.replace(/(\n)/g, "\\n"));
    copyRawUserData.hasEmail = convertBoolStringToBool(copyRawUserData.hasEmail);
    copyRawUserData.hasBirthday = convertBoolStringToBool(copyRawUserData.hasBirthday);
    copyRawUserData.isFriend = convertBoolStringToBool(copyRawUserData.isFriend);
    copyRawUserData.emailVerified = convertBoolStringToBool(copyRawUserData.emailVerified);
    copyRawUserData.hasPendingEmail = convertBoolStringToBool(copyRawUserData.hasPendingEmail);
    copyRawUserData.unsubscribe = convertBoolStringToBool(copyRawUserData.unsubscribe);
    copyRawUserData.hasLoggedInFromClient = convertBoolStringToBool(copyRawUserData.hasLoggedInFromClient);
    copyRawUserData.allowAvatarCopying = convertBoolStringToBool(copyRawUserData.allowAvatarCopying);
    copyRawUserData.twoFactorAuthEnabled = convertBoolStringToBool(copyRawUserData.twoFactorAuthEnabled);
    return copyRawUserData;
}

function convertBoolStringToBool(text: string): boolean {
    if (text.toLowerCase() === "true") return true;
    return false; // TODO: 意図しない無効文字列時にどうするか検討
}

