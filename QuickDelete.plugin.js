/**
 * @name QuickDelete
 * @version 1.0.0
 * @description Deletes the clicked message while holding a keybind.
 * @author strawberrys
 * @website https://github.com/strawberrys/BetterDiscordPlugins
 */

// https://gitlab.com/_Lighty_/bdstuff/blob/master/public/plugins/QuickDeleteMessages.plugin.js

// variables
let keybind = "Delete" // DEL key ; is overwritten if keybind saved data
let keyDown = false

// tables
const events = {
    keyDown: (keyboardEvent) => {
        if (keyboardEvent.key == keybind) {
            keyDown = true
        }
    },
    keyUp: (keyboardEvent) => {
        if (keyboardEvent.key == keybind) {
            keyDown = false
        }
    },
    click: (target) => {
        const message = ZeresPluginLibrary.ReactTools.getReactInstance(target.target.parentElement)

        if (keyDown && message.sibling && message.sibling.pendingProps.channel && message.sibling.pendingProps.message) {
            const [channelId, messageId] = [message.sibling.pendingProps.channel.id, message.sibling.pendingProps.message.id]

            ZeresPluginLibrary.DiscordModules.MessageActions.deleteMessage(channelId, messageId)
            ZeresPluginLibrary.Toasts.show("Deleted message!", {type: "success", timeout: 1000})
        }
    }
}

// functions
const getModules = () => {
    new Promise((resolve, reject) => {
        if (!global.ZeresPluginLibrary) {
            console.warn("QuickDelete: ZeresPluginLibrary does not exist... creating.")

            require("https").get("https://betterdiscord.app/Download?id=9", (response) => {
                let body = ""

                response.setEncoding("utf8")
                response.on("data", (chunk) => body += chunk)
                response.on("end", () => resolve(body))
            }).on("error", reject)
        }
    }).then(
        (body) => {
            require("fs").writeFileSync(__dirname + "\\0PluginLibrary.plugin.js", body)
        },
        (error) => {
            console.error("Failed to fetch ZeresPluginLibrary data: " + error)
        }
    )
}

class QuickDelete {
    start() {
        getModules()

        keybind = BdApi.loadData("QuickDelete", "keybind") || "Delete"

        document.addEventListener("keydown", events.keyDown)
        document.addEventListener("keyup", events.keyUp)
        document.addEventListener("click", events.click)
    }
    stop() {
        document.removeEventListener("keydown", events.keyDown)
        document.removeEventListener("keyup", events.keyUp)
        document.removeEventListener("click", events.click)
    }
    getSettingsPanel() {
        const Settings = ZeresPluginLibrary.Settings

        return Settings.SettingPanel.build((() => {}),
            new Settings.Keybind("Keybind", "The keybind you will hold to delete messages.", this.keybind, (keycodes) => {
                //this.keybind = keycodes
                //BdApi.saveData("QuickDelete", "keybind", this.keybind)
                //keycodes arent returned, bug with the library not my code.
            })
        )
    }
}

module.exports = QuickDelete