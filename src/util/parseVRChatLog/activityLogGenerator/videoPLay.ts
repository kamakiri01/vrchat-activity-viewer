import {  ActivityType, parseSquareBrackets, USharpVideoStartedActivityLog, VideoPlayActivityLog } from "../../..";

export function createVideoPlayActivityLog(utcTime: number, message: string): VideoPlayActivityLog {
    const reg = /\[Video Playback\] URL '(.+)' resolved to '(.+)'/.exec(message)!;
    const activity: VideoPlayActivityLog = {
        date: utcTime,
        activityType: ActivityType.VideoPlay,
        url: reg[1],
        resolvedUrl: reg[2]
    };
    return activity;
}

export function createUSharpVideoStartedActivityLog(utcTime: number, message: string): USharpVideoStartedActivityLog {
    const reg = /\[USharpVideo\] Started video load for URL: (.+), requested by (.+)/.exec(message)!;
    const activity: USharpVideoStartedActivityLog = {
        date: utcTime,
        activityType: ActivityType.USharpVideoStarted,
        url: reg[1],
        requestedBy: reg[2] 
    };
    return activity;
}

