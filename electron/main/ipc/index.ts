import { ipcMain, BrowserWindow, Menu } from "electron"
import { ipcSystemHandler } from "./system"
import { ipcDocumentHandler } from "./document"
import { setupEmbeddingsHandlers } from "./embeddings"
import { ipcEnvHandler } from "./env"
import { ipcUtilHandler } from "./util"
import { ipcLlmHandler } from "./llm"
import { ipcMenuHandler } from "./menu"
import { setupKnowledgeBaseHandlers } from "./knowledge"

export function ipcHandler(win: BrowserWindow) {
  let popup: BrowserWindow | null = null

  const DEFAULT_TITLE = "Souls"

  // IPC Handlers
  ipcMain.handle("set-title", (_event, title: string) => {
    win.setTitle(title || DEFAULT_TITLE)
  })

  // Generic context menu
  ipcMain.handle("show-input-context-menu", (event) => {
    const menu = Menu.buildFromTemplate([
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { type: "separator" },
      { role: "selectAll" },
    ])
    menu.popup({ window: BrowserWindow.fromWebContents(event.sender)! })
  })

  ipcMain.handle("show-selection-context-menu", (event) => {
    const menu = Menu.buildFromTemplate([
      {
        label: "Cut",
        click: () => event.sender.cut(),
      },
      {
        label: "Copy",
        click: () => event.sender.copy(),
      },
      {
        label: "Paste",
        click: () => event.sender.paste(),
      },
      { type: "separator" },
      {
        label: "Select All",
        click: () => event.sender.selectAll(),
      },
    ])
    menu.popup({ window: BrowserWindow.fromWebContents(event.sender)! })
  })

  // Handle popup windows (simple implementation)
  ipcMain.handle('popup:open', (_event, options: { url: string, width?: number, height?: number, modal?: boolean }) => {
    const { url, width = 500, height = 600, modal = false } = options;
    
    // Close existing popup if it exists
    if (popup && !popup.isDestroyed()) {
      popup.show();
      return true;
    }
    
    // Create a new popup
    popup = new BrowserWindow({
      width,
      height,
      parent: modal ? win : undefined,
      modal,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false
      }
    });
    
    // Load the URL
    popup.loadURL(url);
    
    // Show when ready
    popup.once('ready-to-show', () => {
      popup?.show();
    });
    
    // Handle closed event
    popup.on('closed', () => {
      win.webContents.send('popup:closed');
      popup = null;
    });
    
    return true;
  });
  
  // Close popup window
  ipcMain.handle('popup:close', () => {
    if (popup && !popup.isDestroyed()) {
      popup.close();
      return true;
    }
    return false;
  });
  
  // Set up document and knowledge base handlers
  ipcDocumentHandler(win)
  
  // Set up embedding handlers 
  setupEmbeddingsHandlers()

  ipcMain.handle("env:getPlatform", async () => {
    return process.platform
  })

  ipcEnvHandler()
  ipcSystemHandler(win)
  ipcUtilHandler()
  ipcLlmHandler()
  ipcMenuHandler()
  setupKnowledgeBaseHandlers()

  return () => {
    // Close popup
    if (popup) {
      popup.close()
      popup = null
    }
  }
}