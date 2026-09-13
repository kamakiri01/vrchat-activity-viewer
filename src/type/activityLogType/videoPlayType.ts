import { ActivityLog, ActivityType } from "./common";

// play iwasync or usharpvideo by youube-dl
export interface VideoPlayActivityLog extends ActivityLog {
    activityType: typeof ActivityType.VideoPlay;
    url: string;
    resolvedUrl: string;
    /**
     * yt-dlp で取得した動画タイトル。取得できなかった場合は undefined
     */
    title?: string;
}

// usharpvideo started log
export interface USharpVideoStartedActivityLog extends ActivityLog {
    activityType: typeof ActivityType.USharpVideoStarted;
    url: string;
    requestedBy: string;
}

// sdk2 video player started log
export interface SDK2PlayerStartedActivityLog extends ActivityLog {
    activityType: typeof ActivityType.SDK2PlayerStarted;
    url: string;
    requestedBy: string;
}

// play topaz chat player log
export interface TopazPlayActivityLog extends ActivityLog {
    activityType: typeof ActivityType.TopazPlay;
    url: string;
}
