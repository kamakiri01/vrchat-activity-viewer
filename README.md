# VRChat Activity Viewer

VRChat ログ情報の保存・表示機能を持つ node.js コマンドラインツールです。
ログファイルから主要なログ情報の取得と保存、閲覧機能と型定義を提供します。

## Usage

### CLI
```
$ va --filter myFriendName --range 48
2021-1-1 00:00:00 join myFriendName
2021-1-1 00:00:05 leave myFriendName
2021-1-2 00:00:00 join myFriendName
2021-1-2 00:00:05 leave myFriendName
```

### TypeScript / JavaScript
```
import { findLatestVRChatLogFullPath, parseVRChatLog } from "@kamakiri01/vrchat-activity-viewer";
const filePath = findLatestVRChatLogFullPath();
const latestLog = parseVRChatLog(
    fs.readFileSync(path.resolve(filePath), "utf8"), false); // you can get ActivityLog[]
```


## Install

GitHub Packages で公開されています。 `npm` コマンドでインストールする場合、 `npm install` を実行する前に、 以下の手順が必要です。

1. GitHubアカウントの個人アクセストークンを準備します。トークンの権限は`read:packages` を含む必要があります。[参考](https://docs.github.com/ja/github/authenticating-to-github/creating-a-personal-access-token)
2. .npmrc に以下の記述を追加します。
[参考](https://docs.github.com/ja/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-with-a-personal-access-token)

```
//npm.pkg.github.com/:_authToken=YOUR_TOKEN
```

その後、npm でインストールする場合は、

```
$ npm config set @kamakiri01:registry=https://npm.pkg.github.com # 初回のみ
$ npm install @kamakiri01/vrchat-activity-viewer
```

`va` コマンドとしてグローバルにインストールしたい場合は、

```
$ npm config set @kamakiri01:registry=https://npm.pkg.github.com # 初回のみ
$ npm install -g @kamakiri01/vrchat-activity-viewer
```

GitHub からリポジトリを clone した場合は、アクセストークンは不要です。

```
$ npm install
$ npm run build
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
* `-cf --case-filter <words...>`:
  filter result with no ignore case words. when specify space separeted words, use "or" matching
* `-i --import <dir>`:
  log directory to additional import
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
