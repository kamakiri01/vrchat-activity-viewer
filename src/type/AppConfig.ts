export interface ViewerAppParameterObject {
    range: string | number;
    importDir?: string;
    filter?: string[];
    caseFilter?: boolean;
    verbose?: boolean;
    watch?: string;
    /**
     * false の場合、 yt-dlp による動画タイトル取得を行わない
     */
    videoTitle?: boolean;
    debug?: boolean;
    instanceAll?: boolean;
    instanceEnter?: boolean;
    /**
     * 指定された場合、一定時間更新されていないログファイルを
     * ログディレクトリ配下のこのディレクトリへ移動する
     */
    moveNoUpdateLogFiles?: string;
    /**
     * moveNoUpdateLogFiles の移動対象とみなすまでの無更新時間。
     * completeParameterObject で number 化される
     */
    moveThreshold?: string | number;
}
