import { app, BrowserWindow, shell, ipcMain } from "electron"
import { fileURLToPath } from "node:url"
import path from "node:path"
import os from "node:os"
import dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

import AppState from "./state"
import { cleanup, initMCPClient, port } from "./service"
import { getDarwinSystemPath, modifyPath } from "./util"
import { binDirList, darwinPathList } from "./constant"
import { update } from "./update"
import { ipcHandler } from "./ipc/index.js"
import { initTray } from "./tray"
import { store } from "./store"
import { initProtocol } from "./protocol"

// Get the directory path
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Define types for knowledge base storage
interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  content?: string;
}

interface KnowledgeCollection {
  id: string;
  name: string;
  description?: string;
  documents: Document[];
}

interface Document {
  id: string;
  name: string;
  path: string;
  content: string;
  dateAdded: Date;
}

// In-memory storage for knowledge bases
const knowledgeBases: KnowledgeBase[] = [];
const knowledgeCollections: KnowledgeCollection[] = [];

// Export collections for other modules to access
export { knowledgeCollections }

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, "../..")

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron")
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist")
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1"))
  app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === "win32")
  app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Register essential IPC handlers immediately (before window creation)
ipcMain.handle('env:getResourcesPath', (_event, p: string) => {
  try {
    return app.isPackaged ? path.join(process.resourcesPath, p) : p;
  } catch (error) {
    console.error(`Failed to get resources path: ${error}`);
    return '';
  }
});

ipcMain.handle('env:port', async () => {
  try {
    // Get the port for API connections
    const servicePort = await port;
    console.log(`Service available on port: ${servicePort}`);
    return servicePort;
  } catch (error) {
    console.error(`Failed to get port: ${error}`);
    // Fallback port
    return 3000;
  }
});

ipcMain.handle("env:getHotkeyMap", async () => {
  return {
    submit: "CommandOrControl+Enter",
    hide: "CommandOrControl+H",
    show: "CommandOrControl+J",
    editLastMessage: "ArrowUp",
    newChat: "CommandOrControl+N",
  };
});

ipcMain.handle('env:getPlatform', () => {
  try {
    return process.platform;
  } catch (error) {
    console.error(`Failed to get platform: ${error}`);
    return '';
  }
});

// Critical fix for knowledge:list that's being called before setupKnowledgeBaseHandlers
ipcMain.handle('knowledge:list', async () => {
  console.log("Direct knowledge:list handler invoked");
  return knowledgeBases;
});

// Knowledge:add handler
ipcMain.handle('knowledge:add', async (_event, content: string, name: string, description?: string) => {
  console.log(`Direct knowledge:add handler invoked: ${name}`);
  const id = `kb-${Date.now()}`;
  const newKnowledgeBase = { id, name, description, content };
  knowledgeBases.push(newKnowledgeBase);
  return { id };
});

// Knowledge:get-documents handler
ipcMain.handle('knowledge:get-documents', async (_event, knowledgeBaseId: string) => {
  console.log(`Direct knowledge:get-documents handler invoked: ${knowledgeBaseId}`);
  const kb = knowledgeBases.find(kb => kb.id === knowledgeBaseId);
  return kb ? [{ id: `doc-${Date.now()}`, knowledgeBaseId, content: kb.content }] : [];
});

// Knowledge:search handler
ipcMain.handle('knowledge:search', async (_event, query: string, k?: number) => {
  console.log(`Direct knowledge:search handler invoked: ${query}, k=${k}`);
  return [];
});

// Knowledge:delete handler
ipcMain.handle('knowledge:delete', async (_event, id: string) => {
  console.log(`Direct knowledge:delete handler invoked: ${id}`);
  const index = knowledgeBases.findIndex(kb => kb.id === id);
  if (index !== -1) {
    knowledgeBases.splice(index, 1);
  }
  return true;
});

// Critical fix for knowledge-base handlers
ipcMain.handle('knowledge-base:list', async () => {
  console.log("Direct knowledge-base:list handler invoked");
  return knowledgeCollections;
});

ipcMain.handle('knowledge-base:create', async (_event, name: string, description?: string) => {
  console.log(`Direct knowledge-base:create handler invoked: ${name}`);
  const id = `collection-${Date.now()}`;
  const newCollection = { id, name, description, documents: [] };
  knowledgeCollections.push(newCollection);
  return newCollection;
});

ipcMain.handle('knowledge-base:get-chunks', async (_event, knowledgeBaseId: number) => {
  console.log(`Direct knowledge-base:get-chunks handler invoked: ${knowledgeBaseId}`);
  const collection = knowledgeCollections.find(c => c.id === knowledgeBaseId.toString());
  const documents = collection ? collection.documents : [];
  
  // For simplicity, just return the documents as chunks
  const chunks = documents.map(doc => ({
    id: `chunk-${doc.id}`,
    text: doc.content,
    metadata: {
      documentId: doc.id,
      documentName: doc.name
    }
  }));
  
  return chunks;
});

let win: BrowserWindow | null = null
const preload = path.join(__dirname, "../preload/index.mjs")
const indexHtml = path.join(RENDERER_DIST, "index.html")

async function onReady() {
  if (process.platform === "win32") {
    binDirList.forEach(modifyPath)
  } else if (process.platform === "darwin") {
    if (!process.env.PATH) {
      process.env.PATH = await getDarwinSystemPath().catch(() => "")
    }

    darwinPathList.forEach(modifyPath)
  }

  initMCPClient()
  initProtocol()
  createWindow()
}

async function createWindow() {
  win = new BrowserWindow({
    title: "Souls",
    icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
    width: 1024,
    height: 768,
    minHeight: 768,
    minWidth: 1024,
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  })

  // resolve cors
  win.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      callback({ requestHeaders: { ...details.requestHeaders, Origin: '*' } });
    },
  );

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Access-Control-Allow-Origin': ['*'],
        'Access-Control-Allow-Credentials': ['true'],
        'Access-Control-Allow-Methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        'Access-Control-Allow-Headers': ['Content-Type', 'Authorization'],
      },
    });
  });

  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.setMenu(null)
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:"))
      shell.openExternal(url)

    return { action: "deny" }
  })

  win.on("close", (event) => {
    if (!AppState.isQuitting) {
      event.preventDefault()
      win?.hide()
      return false
    }

    return true
  })

  // Auto update
  update(win)

  // Tray
  const shouldminimalToTray = store.get("minimalToTray")
  if (process.platform !== "darwin" && shouldminimalToTray) {
    initTray(win)
    AppState.setIsQuitting(false)
  }

  // ipc handler
  ipcHandler(win)

  const shouldAutoLaunch = store.get("autoLaunch")
  app.setLoginItemSettings({
    openAtLogin: shouldAutoLaunch,
    openAsHidden: false
  })
}

app.whenReady().then(onReady)

app.on("window-all-closed", async () => {
  win = null

  if (process.platform !== "darwin" && AppState.isQuitting) {
    await cleanup()
    app.quit()
  }
})

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized())
      win.restore()

    win.focus()
  }
})

app.on("before-quit", () => {
  AppState.setIsQuitting(true)
})

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    if (win) {
      win.show()
    } else {
      createWindow()
    }
  }
})

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})
