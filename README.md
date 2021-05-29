# VRChat Activity Viewer

VRChat ログ情報の保存・表示機能を持つ node.js コマンドラインツールです。
ログファイルから主要なログ情報の取得と保存、閲覧機能と型定義を提供します。

## Usage

```
$ va --filter myFriendName --range 48
2021-1-1 00:00:00 join myFriendName
2021-1-1 00:00:05 leave myFriendName
2021-1-2 00:00:00 join myFriendName
2021-1-2 00:00:05 leave myFriendName
```

### Install

GitHub Packages で公開されています。

npm でインストールする場合は、

```
$ npm config set @kamakiri01:registry=https://npm.pkg.github.com # 初回のみ
$ npm install @kamakiri01/vrchat-activity-viewer
```

GitHub からリポジトリを clone した場合は、

```
$ npm install
$ npm run build
```

`va` コマンドとしてグローバルにインストールしたい場合は、

```
$ npm config set @kamakiri01:registry=https://npm.pkg.github.com # 初回のみ
$ npm install -g
```

### Run

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

### Note

VRChat ログファイルの仕様は公に定められていません。
そのため、本モジュールの実行結果は、予期せぬタイミングで変わる・動作しなくなる可能性があります。
