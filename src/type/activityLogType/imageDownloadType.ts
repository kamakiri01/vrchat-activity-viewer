import { ActivityLog, ActivityType } from "./common";

export interface ImageDownloadActivityLog extends ActivityLog {
    activityType: typeof ActivityType.ImageDownload;
    url: string;
}
