import { downloadYtdlp } from "../util/videoTitle/ytdlpBinary";

/**
 * npm run update-ytdlp のエントリ。
 * yt-dlp は YouTube 側の変更で動かなくなることがあるため、明示的に最新版へ更新できるようにする
 */
downloadYtdlp(true, true).then((ytdlpPath) => {
    if (!ytdlpPath) {
        console.log("failed to update yt-dlp");
        process.exitCode = 1;
    }
});
