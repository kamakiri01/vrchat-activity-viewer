import { execFile } from "child_process";
import { resolveYtdlpPath } from "./ytdlpBinary";

const FETCH_CONCURRENCY = 4;
const FETCH_TIMEOUT_MS = 20 * 1000; // yt-dlp の単一実行ファイル版は起動に数秒かかるため長めに取る
const REPLACEMENT_CHARACTER = "�"; // デコード失敗時に現れる

/**
 * yt-dlp でタイトルを取得しうる URL かどうか。
 * TopazChat の rtspt:// やローカルファイルは対象外
 */
export function isVideoTitleFetchable(url: string): boolean {
    return /^https?:\/\//.test(url);
}

/**
 * URL ごとの動画タイトルを取得する。
 * 取得できなかった URL は結果に含めない
 */
export async function fetchVideoTitles(urls: string[], isDebugLog: boolean): Promise<{[url: string]: string}> {
    const titleTable: {[url: string]: string} = {};
    if (urls.length === 0) return titleTable;

    const ytdlpPath = await resolveYtdlpPath(isDebugLog);
    if (!ytdlpPath) return titleTable;

    const queue = urls.concat();
    const workers: Promise<void>[] = [];
    for (let i = 0; i < Math.min(FETCH_CONCURRENCY, queue.length); i++) {
        workers.push((async () => {
            for (let url = queue.shift(); url; url = queue.shift()) {
                const title = await fetchVideoTitle(ytdlpPath, url, isDebugLog);
                if (title) titleTable[url] = title;
            }
        })());
    }
    await Promise.all(workers);
    return titleTable;
}

function fetchVideoTitle(ytdlpPath: string, url: string, isDebugLog: boolean): Promise<string | null> {
    return new Promise((resolve) => {
        // yt-dlp は既定でロケールの文字コード(日本語 Windows なら CP932)で出力するため、 UTF-8 を強制する
        const args = ["--encoding", "utf-8", "--no-playlist", "--no-warnings", "--skip-download", "--print", "%(title)s", url];
        const options = { timeout: FETCH_TIMEOUT_MS, windowsHide: true };
        execFile(ytdlpPath, args, options, (error, stdout) => {
            if (error) {
                if (isDebugLog) console.log(`failed to fetch video title: ${url}: ${error.message}`);
                return resolve(null);
            }
            const title = stdout.split("\n")[0].trim();
            if (!title) return resolve(null);
            // 文字化けした文字列を保存すると後から直せないため、デコードに失敗していれば取得失敗として扱う
            if (title.indexOf(REPLACEMENT_CHARACTER) !== -1) {
                if (isDebugLog) console.log(`failed to decode video title: ${url}`);
                return resolve(null);
            }
            resolve(title);
        });
    });
}
