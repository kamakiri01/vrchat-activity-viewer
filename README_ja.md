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
  filter result with ignore case words. when specify space separeted words, use "or" matching
* `-V --verbose`:
  display full log details
* `-r --range <hours>`:
  specify show range to display (default: "24")
* `-v --version`:
  output the current version
* `-h --help`:
  display help for command

## Note

VRChat ログファイルの仕様は公に定められていません。
そのため、本モジュールの実行結果は、予期せぬタイミングで変わる・動作しなくなる可能性があります。
