export interface LogLineParseResult {
    utcTime: number;

    /**
     * 括弧を含むメッセージ
     */
    message: string;
    //noBracketMessage: string;
    bracket?: string;
}

/**
 * ログ1行から日付とメッセージを分離
 *
 * Log以外のException/Error/Warningにはnullを返す。
 *
 * rawActivity: "2021.01.01 00:00:00 Log        -  messageBody"
 * [1]: "2021.01.01"
 * [2]: "00:00:00"
 * [3]: "messageBody"
 */
export function parseMessageBodyFromLogLine(rawActivity: string): LogLineParseResult | null {
    const reg = /^(\d{4}\.\d{2}\.\d{2})\s(\d{2}:\d{2}:\d{2}) Log\s{8}-\s{2}(.+)/.exec(rawActivity);
    if (!reg || reg.length < 4) return null;
    const mmmmyydd = reg[1];
    const hhmmss = reg[2];
    const utcTime = new Date(mmmmyydd + " " + hhmmss).getTime();
    const message = reg[3]; // 括弧を含むメッセージ

    const parsedMessage = parseSquareBrackets(message);
    return {
        utcTime,
        message,
        bracket: parsedMessage ? parsedMessage.bracket : undefined

    };
}

export interface BracketMessageParseResult {
    bracket?: string;
    message: string;
}

/**
 * 日時以外のメッセージから括弧タグ（含まれる場合）とメッセージテキストを分離
 *
 * message: "[abcde] efghi"
 * [1]: "[abcde] "
 * [2]: "abcde"
 * [3]: "efghi"
 */
export function parseSquareBrackets(messageWithTag: string): BracketMessageParseResult | null {
    const reg = /^(\[(.+)\]\s)?(.+)/.exec(messageWithTag);
    if (!reg || reg.length < 4) return null;
    const bracket: string | undefined = reg[2];
    const message = reg[3];

    return {
        bracket,
        message
    };
}

/**
 * Notificationログのdetails文字列を構造体にして返す
 */
export function detailParse(detailsRaw: string): {[key: string]: string} {
    detailsRaw = detailsRaw.slice(2, detailsRaw.length - 2); // 両端の{{ }}を落とす
    const elements: string[] = [];
    const reg = /\w+=.+?,\s/g;
    let xArray;
    let lastIndex = 0;
    // eslint-disable-next-line no-cond-assign
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
