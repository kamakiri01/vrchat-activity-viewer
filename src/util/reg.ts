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

/**
 * details文字列をobject構造にして返す
 */
export function detailParse(detailsRaw: string) {
    detailsRaw = detailsRaw.slice(2, detailsRaw.length - 2); // 両端の{{ }}を落とす
    const elements: string[] = [];
    const reg = /\w+=.+?,\s/g;
    let xArray;
    let lastIndex = 0;
    while(xArray = reg.exec(detailsRaw)) {
        const element = xArray[0];
        elements.push(element.slice(0, element.length - 2)); // 末尾の[ ,]を落とす
        lastIndex = xArray.index + xArray[0].length;
    }
    const lastElement = detailsRaw.slice(lastIndex);
    elements.push(lastElement);

    const result: {[key: string]: string} = {};
    elements.forEach((e) => {
        const reg2 = /(\w+)=(.+)/.exec(e);
        if (!reg2) return;
        result[reg2[1]] = reg2[2];
    })
    return result;
}
