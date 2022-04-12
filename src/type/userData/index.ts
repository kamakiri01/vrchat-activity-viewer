/**
 * UserData の最新状態と displayName の履歴
 */
export interface UserDataLog {
    latestUserData: UserData;
    history: {
        displayName: string[];
    }
}

/**
 * [API] Fetched APIUser から取得できる情報
 * NOTE: 列挙されうる要素を網羅できないので、 Type Alias は積極的には採用せず string で受ける
 * bool 型と、 Unicode エスケープシーケンス変換を行う必要がある。 JSON.stringify() のみでこの型の実体を生成することはできない
 */
export interface UserData {
    /**
     * 表示名
     */
    displayName: string;

    /**
     * 登録時のユーザ名
     */
    username: string;

    /**
     * 自己紹介文
     * 元データは Unicode エスケープシーケンスあり。
     * この型は UTF-8 変換後の文字列を格納する。
    */
    bio: string;

    /**
     * 自己紹介URL
     */
    bioLinks: string[];

    /**
     * ワールドインスタンスのフルパス
     * state が offline の場合、 "offline" 。 online の場合、 "private" or "woridId:instanceId"
     *
     */
    location: string;

    /**
     * メアドがあるかどうか
     */
    hasEmail: boolean;

    /**
     * 誕生日を設定しているかどうか
     */
    hasBirthday: boolean;

    /**
     * フレンドなら真
     */
    isFriend: boolean;

    /**
     * usr_のidとは別にあるユニークID。自身にも割り振られる。フレンドでなければ空文字列
     */
    friendKey: string;

    /**
     * 最終ログイン時刻。ISO 8601 拡張形式または空文字列
     */
    last_login: string;

    /**
     * VRChat サインアップ日付。 YYYY-MM-DD 形式
     */
    date_joined: string;

    /**
     * None または none のみ確認
     */
    developerType: string;

    /**
     * 自身は 7 、それ以外は 0 のみ確認
     */
    acceptedTOSVersion: number;

    /**
     * アバターサムネURL
     */
    currentAvatarImageUrl: string;

    /**
     * 小さいアバターサムネURL
     */
    currentAvatarThumbnailImageUrl: string;

    /**
     * メール認証
     */
    emailVerified: boolean;

    /**
     * 認証状態
     */
    hasPendingEmail: boolean;

    /**
     * locationのインスタンス省いた部分。: の前半
     */
    worldId: string;

    /**
     * location の : の右側
     */
    instanceId: string;

    /**
     * 自分以外は False 以外未確認
     */
    unsubscribe: boolean;

    /**
     * False 以外未確認
     */
    hasLoggedInFromClient: boolean;

    /**
     * ユーザに付随するタグ付け
     */
    tags: string[];

    /**
     * ユーザが設定したステータス
     * "active" or "ask me" or "join me" or "offline" or "busy"
     */
    status: boolean;

    /**
     * ユーザがwebで書き込めるステータス
     * 元データは Unicode エスケープシーケンスあり。
     * この型は UTF-8 変換後の文字列を格納する。
     */
    statusDescription: string;

    /**
     * online か offline か。非フレンドのオンラインを取得できるかは未確認
     */
    state: string;

    /**
     * アバタークローン可能かどうか
     */
    allowAvatarCopying: boolean;

    /**
     * ユーザが設定した Icon 画像の blob リンク。無ければ空文字列
     */
    userIcon: string;

    /**
     * ユーザが設定した自画像 blob リンク。無ければ空文字列
     */
    profilePicOverride: string;

    /**
     * "standalonewindows" 以外は未確認
     */
    last_platform: string;

    /**
     * 二段階認証しているかどうか
     */
    twoFactorAuthEnabled: boolean;

    /**
     * ユーザID
     */
    id: string;
}

/**
 * 自身の UserData にのみ含まれる情報
 */
export interface OwnUserData extends UserData {
    /**
     * ":" 以外未確認
     */
    obfuscatedPendingEmail: string;

    /**
     * フレンドのユーザ ID リスト
     */
    friends: string[];

    /**
     * 使用中アバターの vrca URL
     */
    currentAvatarAssetUrl: string;

    /**
     * 空オブジェクト以外未確認
     */
    steamDetails: {};

    /**
     * 先頭1文字と @ ドメイン以下のみ表示されたメールアドレス文字列
     */
    obfuscatedEmail: string;
}
