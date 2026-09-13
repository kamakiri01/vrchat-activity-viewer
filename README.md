[JP README](./README_ja.md)

# VRChat Activity Viewer

This is a node.js command line tool with the ability to save and view VRChat log information.
It provides functions for retrieving, saving, and viewing key log information from log files, as well as type definitions.

Old Github Packages `@kamakiri01/vrchat-activity-viewer` is **Deprecated**.
Use `vrchat-activity-viewer` from npm(npmjs).

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
```javascript
import { findLatestVRChatLogFullPath, parseVRChatLog } from "vrchat-activity-viewer";
const filePath = findLatestVRChatLogFullPath();
const latestLog = parseVRChatLog(
    fs.readFileSync(path.resolve(filePath), "utf8"), false); // you can get ActivityLog[]
```


## Install

```
$ npm install vrchat-activity-viewer
```

 To install globally as a `va` command,

```
$ npm install -g vrchat-activity-viewer
```

## Run

```
$ ./bin/run
```

When installed globally,

```
$ va
```

The first time you run it, it will generate `~/.vrchatActivityViewer/db.json` in your home directory.

### Options

* `-f --filter <words...>`:
  filter result with ignore case words. when specify space separeted words, use "or" matching
* `-cf --case-filter`:
  use case sensitive filter
* `-ia --instance-all`
  include same instance user names, world enter log
* `-ie --instance-enter`
  include world enter log
* `-i, --import-dir <dir>`
  specify log directory (default: VRChat App path)
* `-V --verbose`:
  display full result details
* `-r --range <year/month/week/day/hour>`:
  specify show range to display (default: "24h")(ex: 1y, 2m, 3w, 4d, 5h)
* `-w --watch <sec>`:
   update db repeatedly
* `--no-video-title`:
  disable fetching video titles with yt-dlp
* `-v --version`:
  output the current version
* `-h --help`:
  display help for command

## Video title

For newly found video playback logs, this tool fetches the video title with [yt-dlp](https://github.com/yt-dlp/yt-dlp)
and stores it in the log entry. Existing logs are never re-fetched.

The first time a title is needed, the yt-dlp binary for your platform (20-40MB) is downloaded
into the `thirdparty` directory of this package. Nothing on your `PATH` is used.

yt-dlp needs to be updated periodically to keep working. To update it,

```
$ npm run update-ytdlp
```

or just delete the `thirdparty` directory and the latest release will be downloaded on the next run.

Use `--no-video-title` to disable this feature entirely (no download, no fetch).

yt-dlp is released into the public domain under the Unlicense.

## Note

The specifications of the VRChat log file have not been publicly defined.
Therefore, the execution results of this module may change or stop working at unexpected times.
