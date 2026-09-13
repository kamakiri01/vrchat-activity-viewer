# VRChat Activity Viewer

VRChat ログ情報の保存・表示機能を持つ node.js コマンドラインツールです。
ログファイルから主要なログ情報の取得と保存、閲覧機能と型定義を提供します。

Github Packages で公開されている `@kamakiri/vrchat-activity-viewer` は Deprecated です。
新しい `vrchat-activity-viewer` パッケージを npm(npmjs) から利用してください。

## Usage

### CLI
```
$ va --filter myFriendName --range 24h
2021-1-1 00:00:00 join myFriendName
2021-1-1 00:00:05 leave myFriendName
2021-1-2 00:00:00 join myFriendName
2021-1-2 00:00:05 leave myFriendName
```

### TypeScript / JavaScript
```
import { findLatestVRChatLogFullPath, parseVRChatLog } from "vrchat-activity-viewer";
const filePath = findLatestVRChatLogFullPath();
const latestLog = parseVRChatLog(
    fs.readFileSync(path.resolve(filePath), "utf8"), false); // you can get ActivityLog[]
```


## Install

```
$ npm install vrchat-activity-viewer
```

`va` コマンドとしてグローバルにインストールする場合は、

```
$ npm install -g vrchat-activity-viewer
```

## Run

```
$ ./bin/run
```

または、グローバルにインストールした場合、

```
$ va
```

初回実行時、ホームディレクトリに `~/.vrchatActivityViewer/db.json` を生成します。

### Options

* `-f --filter <words...>`:
  指定された字句で検索結果をフィルタします。複数指定すると OR マッチングします
* `-cf --case-filter`:
  フィルタ時に単語の大文字小文字を区別します
* `-ia --instance-all`
  フィルタ結果に同じインスタンスのユーザ名・ワールド入室ログを含めます
* `-ie --instance-enter`
  フィルタ結果に同じインスタンスのワールド入室ログを含めます
* `-i, --import-dir <dir>`
  指定したディレクトリからログを読み込みます
* `-V --verbose`:
  詳細情報を表示します
* `-r --range <year/month/week/day/hour>`:
  検索範囲を指定します(ex: 1y, 2m, 3w, 4d, 5h)
* `-w --watch <sec>`:
   一定間隔で繰り返し実行します
* `--no-video-title`:
  yt-dlp による動画タイトルの取得を無効にします
* `-v --version`:
  アプリケーションのバージョン情報を表示します
* `-h --help`:
  ヘルプを表示します

## 動画タイトル

新しく見つかった動画再生ログに対して、 [yt-dlp](https://github.com/yt-dlp/yt-dlp) で動画タイトルを取得し、
ログに保存します。既に保存済みのログに対して取得し直すことはありません。

タイトルの取得が初めて必要になったとき、実行環境に対応する yt-dlp のバイナリ(20〜40MB)を
本パッケージの `thirdparty` ディレクトリへ自動的にダウンロードします。 `PATH` 上の yt-dlp は使用しません。

yt-dlp は動作を保ち続けるために定期的な更新が必要です。更新するには、

```
$ npm run update-ytdlp
```

または `thirdparty` ディレクトリを削除すると、次回実行時に最新版を取得します。

`--no-video-title` を指定すると、ダウンロードも取得も行いません。

yt-dlp は Unlicense によりパブリックドメインで公開されています。

## Note

VRChat ログファイルの仕様は公に定められていません。
そのため、本モジュールの実行結果は、予期せぬタイミングで変わる・動作しなくなる可能性があります。
