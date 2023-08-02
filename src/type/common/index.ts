// world scope
export type WorldAccessScope = "invite" | "invite+" | "friends" | "friends+" | "public" | "unknown" | "group" | "group+" | "group public";

// remove notificationの削除元
export type NotificationFromType = "AllTime" | "Recent";

export type RegionType = "eu" | "jp"; // "us" の場合 ~region 記述が省略される
