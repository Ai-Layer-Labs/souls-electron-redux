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
  console.log('Setting up system handlers - explicitly logging');

  ipcMain.handle("system:openScriptsDir", async () => {
    console.log('openScriptsDir handler invoked');
    try {
      // Use the scripts directory defined in constants
      logging.info(`Opening scripts directory at: ${scriptsDir}`)
      
      // Create the directory if it doesn't exist
      if (!fs.existsSync(scriptsDir)) {
        logging.info(`Scripts directory doesn't exist, creating at: ${scriptsDir}`)
        fs.mkdirSync(scriptsDir, { recursive: true })
      }
      
      // Open the directory
      logging.info(`Attempting to open: ${scriptsDir}`)
      const result = await shell.openPath(scriptsDir)
      
      // Check if there was an error opening the directory
      if (result !== "") {
        logging.error(`Error opening scripts directory: ${result}`)
        throw new Error(result)
      }
      
      return { success: true, path: scriptsDir }
    } catch (error) {
      console.error(`Failed to open scripts directory: ${error}`);
      return { success: false, error: String(error) }
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
