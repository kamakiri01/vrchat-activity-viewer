# VRChat Activity Viewer

VRChat の ログファイルを読んで、履歴を表示するコマンドラインツールです。

## Usage

```
$ va --filter myFriendName --range 48
2021-1-1 00:00:00 join myFriendName
2021-1-1 00:00:05 leave myFriendName
2021-1-2 00:00:00 join myFriendName
2021-1-2 00:00:05 leave myFriendName
```

### Install

Node.js が必要です。

```
$ npm install
$ npm run build
```

`va` コマンドとしてグローバルにインストールしたい場合、

```
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

初回実行時、ツールのディレクトリに `db.json` を生成します。

### Options

* `-f --filter <name>`:
  filter result with name
* `-i --import <dir>`:
  log directory to additional import
* `-V, --verbose`:
  display full log details
* `-r, --range <hours>`:
  specify show range to display (default: "24")
* `-v --version`:
  output the current version
* `-h --help`:
  display help for command
