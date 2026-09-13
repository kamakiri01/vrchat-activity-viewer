import * as crypto from "crypto";
import * as fs from "fs";
import * as https from "https";
import * as path from "path";

/**
 * yt-dlp バイナリの配置先。パッケージルートの thirdparty ディレクトリ固定で、 PATH は参照しない
 */
export const THIRDPARTY_DIR = path.resolve(__dirname, "../../..", "thirdparty");

const YTDLP_FILE_NAME = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
const YTDLP_PATH = path.join(THIRDPARTY_DIR, YTDLP_FILE_NAME);
const YTDLP_INFO_PATH = path.join(THIRDPARTY_DIR, "yt-dlp.json");
const YTDLP_TMP_PATH = path.join(THIRDPARTY_DIR, "yt-dlp.download");

const LATEST_RELEASE_URL = "https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest";
const CHECKSUM_ASSET_NAME = "SHA2-256SUMS";
const USER_AGENT = "vrchat-activity-viewer"; // GitHub API は User-Agent を要求する
const MAX_REDIRECT = 5;

/**
 * thirdparty に保存する取得情報
 */
export interface YtdlpInfo {
    tag: string;
    asset: string;
    sha256: string;
    fetchedAt: number;
}

interface ReleaseAsset {
    name: string;
    size: number;
    browser_download_url: string;
}

interface Release {
    tag_name: string;
    assets: ReleaseAsset[];
}

// 1 プロセス内で DL が複数回走らないようにする
let resolveCache: Promise<string | null> | null = null;

/**
 * 実行環境に対応する yt-dlp のリリースアセット名。対応しないプラットフォームでは null
 */
function getAssetName(): string | null {
    if (process.platform === "win32") {
        if (process.arch === "x64") return "yt-dlp.exe";
        if (process.arch === "arm64") return "yt-dlp_arm64.exe";
        if (process.arch === "ia32") return "yt-dlp_x86.exe";
        return null;
    }
    if (process.platform === "linux") {
        if (process.arch === "x64") return "yt-dlp_linux";
        if (process.arch === "arm64") return "yt-dlp_linux_aarch64";
        return null;
    }
    if (process.platform === "darwin") {
        if (process.arch === "x64" || process.arch === "arm64") return "yt-dlp_macos";
        return null;
    }
    return null;
}

function existFile(filePath: string): boolean {
    try {
        fs.accessSync(filePath);
        return true;
    } catch (error) {
        return false;
    }
}

function loadYtdlpInfo(): YtdlpInfo | null {
    try {
        return JSON.parse(fs.readFileSync(YTDLP_INFO_PATH, "utf8")) as YtdlpInfo;
    } catch (error) {
        return null;
    }
}

/**
 * yt-dlp の実行パスを返す。無ければダウンロードを試みる。
 * 取得できない場合は null を返し、呼び出し側はタイトル取得を諦める
 */
export function resolveYtdlpPath(isDebugLog: boolean): Promise<string | null> {
    if (!resolveCache) {
        resolveCache = (existFile(YTDLP_PATH))
            ? Promise.resolve(YTDLP_PATH) // 既にあれば更新確認もネットワークアクセスも行わない
            : downloadYtdlp(false, isDebugLog);
    }
    return resolveCache;
}

/**
 * yt-dlp をダウンロードする。
 * force 指定時は、最新版が既に配置済みならダウンロードを省略する
 */
export async function downloadYtdlp(force: boolean, isDebugLog: boolean): Promise<string | null> {
    const assetName = getAssetName();
    if (!assetName) {
        if (isDebugLog) console.log(`yt-dlp is not provided for ${process.platform}/${process.arch}, skip video title`);
        return null;
    }

    try {
        fs.mkdirSync(THIRDPARTY_DIR, { recursive: true });

        const release = JSON.parse((await httpGet(LATEST_RELEASE_URL)).toString("utf8")) as Release;
        const currentInfo = loadYtdlpInfo();
        if (force && currentInfo && currentInfo.tag === release.tag_name && existFile(YTDLP_PATH)) {
            console.log(`already up to date (${release.tag_name})`);
            return YTDLP_PATH;
        }

        const asset = release.assets.filter(e => e.name === assetName)[0];
        const checksumAsset = release.assets.filter(e => e.name === CHECKSUM_ASSET_NAME)[0];
        if (!asset || !checksumAsset) throw new Error(`asset not found in yt-dlp ${release.tag_name}: ${assetName}`);

        const expectedSha256 = parseChecksum((await httpGet(checksumAsset.browser_download_url)).toString("utf8"), assetName);
        if (!expectedSha256) throw new Error(`checksum not found for ${assetName}`);

        console.log(`downloading yt-dlp ${release.tag_name} (${assetName}, ${(asset.size / 1024 / 1024).toFixed(1)}MB) to thirdparty/ ...`);
        const body = await httpGet(asset.browser_download_url);
        const sha256 = crypto.createHash("sha256").update(body).digest("hex");
        if (sha256 !== expectedSha256) throw new Error(`sha256 mismatch: expected ${expectedSha256}, actual ${sha256}`);

        fs.writeFileSync(YTDLP_TMP_PATH, body);
        if (process.platform !== "win32") fs.chmodSync(YTDLP_TMP_PATH, 0o755);
        fs.renameSync(YTDLP_TMP_PATH, YTDLP_PATH);

        const info: YtdlpInfo = { tag: release.tag_name, asset: assetName, sha256, fetchedAt: Date.now() };
        fs.writeFileSync(YTDLP_INFO_PATH, JSON.stringify(info, null, 2));

        if (currentInfo && currentInfo.tag !== release.tag_name) {
            console.log(`updated yt-dlp ${currentInfo.tag} -> ${release.tag_name}`);
        } else {
            console.log(`downloaded yt-dlp ${release.tag_name}`);
        }
        return YTDLP_PATH;
    } catch (error) {
        try {
            if (existFile(YTDLP_TMP_PATH)) fs.rmSync(YTDLP_TMP_PATH);
        } catch (rmError) {
            // 一時ファイルの後始末に失敗しても本流は止めない
        }
        if (isDebugLog) console.log("failed to prepare yt-dlp, skip video title: " + (error as Error).message);
        return null;
    }
}

/**
 * SHA2-256SUMS の "<hash>  <name>" 形式から対象アセットのハッシュを取り出す
 */
function parseChecksum(checksums: string, assetName: string): string | null {
    const line = checksums.split("\n").filter(e => e.trim().split(/\s+/)[1] === assetName)[0];
    if (!line) return null;
    return line.trim().split(/\s+/)[0];
}

/**
 * リダイレクト追従付きの GET 。 browser_download_url は objects.githubusercontent.com へ 302 する
 */
function httpGet(url: string, redirectCount = 0): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const request = https.get(url, {
            headers: {
                "User-Agent": USER_AGENT,
                "Accept": "application/vnd.github+json"
            }
        }, (response) => {
            const statusCode = response.statusCode!;
            if (statusCode >= 300 && statusCode < 400 && response.headers.location) {
                response.resume();
                if (redirectCount >= MAX_REDIRECT) return reject(new Error("too many redirects: " + url));
                return resolve(httpGet(response.headers.location, redirectCount + 1));
            }
            if (statusCode !== 200) {
                response.resume();
                return reject(new Error(`http ${statusCode}: ${url}`));
            }

            const chunks: Buffer[] = [];
            response.on("data", (chunk: Buffer) => chunks.push(chunk));
            response.on("end", () => resolve(Buffer.concat(chunks)));
            response.on("error", reject);
        });
        request.on("error", reject);
    });
}
