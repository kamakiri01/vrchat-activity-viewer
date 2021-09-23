[JP README](./README_ja.md)

# VRChat Activity Viewer

This is a node.js command line tool with the ability to save and view VRChat log information.
It provides functions for retrieving, saving, and viewing key log information from log files, as well as type definitions.

Github Packages `@kamakiri/vrchat-activity-viewer` is Deprecated.
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
* `-cf --case-filter <words...>`:
  filter result with no ignore case words. when specify space separeted words, use "or" matching
* `-i --import <dir>`:
  log directory to additional import
* `-V --verbose`:
  display full log details
* `-r --range <year/month/week/day/hour>`:
  specify show range to display (default: "24h")
* `-v --version`:
  output the current version
* `-h --help`:
  display help for command

## Note

The specifications of the VRChat log file have not been publicly defined.
Therefore, the execution results of this module may change or stop working at unexpected times.
