# ChangeLog

## 1.1.0
- `--filter` オプションを大文字小文字を区別しないよう変更
- 大文字小文字を区別する `--case-filter` オプションを追加

## 1.0.0
内部構造の破壊的変更によるメジャーバージョン更新です。

- invite/request invite/responseの画像とメッセージをログ表示できるよう変更
- 内部構造の変更
  - `NotificationLogData#details` を、パース済みのdetailsデータ構造に変更しました。従来のパース前のdetails文字文字列を `NotificationLogData#detailsRaw` に変更しました。

## 0.0.4
- invite/request inviteのメッセージのレスポンスをパースできるよう変更

## 0.0.3
- `--filter` オプションに複数のキーワードを指定できるよう変更
  - or条件でマッチします。and条件には grep コマンドなどを利用してください。

## 0.0.2
- VRChat 2021.1.2-1046-Release のログ出力に対応

## 0.0.1
- リリース
