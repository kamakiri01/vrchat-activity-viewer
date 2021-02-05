export const Judge = {
    isOnPlayerJoined: (message: string) => { return message.indexOf("OnPlayerJoined") !== -1 },
    isOnPlayerLeft: (message: string) => { return (message.indexOf("OnPlayerLeft") !== -1 && message.indexOf("OnPlayerLeftRoom") === -1) },
    isEnter: (message: string) => { return message.indexOf("Entering Room") !== -1 },
    isSendNotification: (message: string) => { return message.indexOf("Send notification") !== -1 },
    isReceiveNotification: (message: string) => { return message.indexOf("Received Notification") !== -1 },
    isAuthentication: (message: string) => { return message.indexOf("User Authenticated") !== -1 },
    isCheckBuild: (message: string) => { return message.indexOf("VRChat Build") !== -1 },
    isShutdown: (message: string) => { return message.indexOf("shutdown") !== -1 }
}
