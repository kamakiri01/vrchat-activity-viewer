import {  ActivityType } from "../../..";
import { ImageDownloadActivityLog } from "../../../type/activityLogType/imageDownloadType";

export function createImagePadDownloadActivityLog(utcTime: number, message: string): ImageDownloadActivityLog {
    const reg = /\[Image Download\] Attempting to load image from URL '(.+)'/.exec(message)!;
    const activity: ImageDownloadActivityLog = {
        date: utcTime,
        activityType: ActivityType.ImageDownload,
        url: reg[1],
    };
    return activity;
}
