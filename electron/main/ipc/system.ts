import { app, ipcMain, shell, BrowserWindow } from "electron"
import AppState from "../state"
import { scriptsDir } from "../constant"
import { store } from "../store"
import * as path from 'path'
import * as fs from 'fs'
import * as logging from './logging'

import {
  checkAppImageAutoLaunchStatus,
  setAppImageAutoLaunch,
} from "../platform/appimage"
import { destroyTray, initTray } from "../tray"

export function ipcSystemHandler(win: BrowserWindow) {
  logging.info('Setting up system handlers')

  ipcMain.handle("system:openScriptsDir", async () => {
    try {
      const scriptsDir = path.join(app.getPath('userData'), 'scripts')
      
      // Create the directory if it doesn't exist
      if (!fs.existsSync(scriptsDir)) {
        fs.mkdirSync(scriptsDir, { recursive: true })
      }
      
      // Open the directory
      await shell.openPath(scriptsDir)
      return true
    } catch (error) {
      logging.error(`Failed to open scripts directory: ${error}`)
      return false
    }
  })

  ipcMain.handle("system:getAutoLaunch", async () => {
    if (process.env.APPIMAGE) {
      return checkAppImageAutoLaunchStatus()
    }

    return app.getLoginItemSettings().openAtLogin
  })

  ipcMain.handle("system:setAutoLaunch", (event, enable) => {
    store.set("autoLaunch", enable)

    if (process.env.APPIMAGE) {
      setAppImageAutoLaunch(enable)
    } else {
      app.setLoginItemSettings({
        openAtLogin: enable,
        openAsHidden: false,
      })
    }

    return enable
  })

  ipcMain.handle("system:getMinimalToTray", () => {
    return store.get("minimalToTray")
  })

  ipcMain.handle("system:setMinimalToTray", (event, enable) => {
    store.set("minimalToTray", enable)
    AppState.setIsQuitting(!enable)

    if (enable) {
      initTray(win)
    } else {
      destroyTray()
    }
  })
}
