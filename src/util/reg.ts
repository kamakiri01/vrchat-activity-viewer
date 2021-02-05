/**
 * ログ1行から日付とメッセージを分離
 * 
 * Log以外のException/Error/Warning/にはnullを返す。
 *
 * ex:
 * 2021.01.01 00:00:00 Log        -  message
 * 
 * [1]: "2021.01.01"
 * [2]: "00:00:00"
 * [3]: "message"
 */
export function parseMessageBodyFromLogLine(rawActivity: string) {
    return /^(\d{4}\.\d{2}\.\d{2})\s(\d{2}:\d{2}:\d{2}) Log\s{8}-\s{2}(.+)/.exec(rawActivity);
}

/**
 * 日時以外のメッセージから括弧タグ（含まれる場合）とメッセージテキストを分離
 *
 * ex:
 * [abcde] efghi
 * [1]: "[abcde] "
 * [2]: "abcde"
 * [3]: "efghi"
 */
export function parseSquareBrackets(message: string) {
    return /^(\[(.+)\]\s)?(.+)/.exec(message);
}
