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
}
