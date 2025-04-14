import { ipcRenderer, contextBridge } from "electron"

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    on(...args: Parameters<typeof ipcRenderer.on>) {
      const [channel, listener] = args
      return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
    },
    off(...args: Parameters<typeof ipcRenderer.off>) {
      const [channel, ...omit] = args
      return ipcRenderer.off(channel, ...omit)
    },
    send(...args: Parameters<typeof ipcRenderer.send>) {
      const [channel, ...omit] = args
      return ipcRenderer.send(channel, ...omit)
    },
    invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
      const [channel, ...omit] = args
      return ipcRenderer.invoke(channel, ...omit)
    },
    unsubscribeAll(channel: string) {
      ipcRenderer.removeAllListeners(channel);
    },

    // util
    fillPathToConfig: (config: string) => ipcRenderer.invoke("util:fillPathToConfig", config),

    // system
    openScriptsDir: () => ipcRenderer.invoke("system:openScriptsDir"),
    getAutoLaunch: () => ipcRenderer.invoke("system:getAutoLaunch"),
    setAutoLaunch: (enable: boolean) => ipcRenderer.invoke("system:setAutoLaunch", enable),
    getMinimalToTray: () => ipcRenderer.invoke("system:getMinimalToTray"),
    setMinimalToTray: (enable: boolean) => ipcRenderer.invoke("system:setMinimalToTray", enable),

    // popup
    openPopup: (options: { url: string, width?: number, height?: number, modal?: boolean }) => {
      return ipcRenderer.invoke('popup:open', options)
    },
    closePopup: () => {
      return ipcRenderer.invoke('popup:close')
    },

    // llm
    openaiModelList: (apiKey: string) => ipcRenderer.invoke("llm:openaiModelList", apiKey),
    openaiCompatibleModelList: (apiKey: string, baseURL: string) => ipcRenderer.invoke("llm:openaiCompatibleModelList", apiKey, baseURL),
    anthropicModelList: (apiKey: string, baseURL: string) => ipcRenderer.invoke("llm:anthropicModelList", apiKey, baseURL),
    ollamaModelList: (baseURL: string) => ipcRenderer.invoke("llm:ollamaModelList", baseURL),
    googleGenaiModelList: (apiKey: string) => ipcRenderer.invoke("llm:googleGenaiModelList", apiKey),
    mistralaiModelList: (apiKey: string) => ipcRenderer.invoke("llm:mistralaiModelList", apiKey),
    bedrockModelList: (accessKeyId: string, secretAccessKey: string, sessionToken: string, region: string) => ipcRenderer.invoke("llm:bedrockModelList", accessKeyId, secretAccessKey, sessionToken, region),

    // document
    showDocumentOpenDialog: (knowledgeBaseId?: string | number) => 
      ipcRenderer.invoke("document:show-open-dialog", knowledgeBaseId),
    processDocument: (filePath: string, knowledgeBaseId?: string | number) => 
      ipcRenderer.invoke("document:process", filePath, knowledgeBaseId),

    // context menu
    showSelectionContextMenu: () => ipcRenderer.invoke("show-selection-context-menu"),
    showInputContextMenu: () => ipcRenderer.invoke("show-input-context-menu"),

    // env
    getHotkeyMap: () => ipcRenderer.invoke("env:getHotkeyMap"),
    getPlatform: () => ipcRenderer.invoke("env:getPlatform"),
    port: () => ipcRenderer.invoke("env:port"),
    getResourcesPath: (p: string) => ipcRenderer.invoke("env:getResourcesPath", p),

    sendToMain: (channel: string, ...args: unknown[]) => {
      ipcRenderer.send(channel, ...args)
    },
    
    // Popup window management
    onPopupClosed: (callback: () => void) => {
      const subscription = () => callback()
      ipcRenderer.on('popup:closed', subscription)
      return () => {
        ipcRenderer.removeListener('popup:closed', subscription)
      }
    },
  },
  
  // Knowledge base specific API
  knowledge: {
    // Create a new knowledge base
    createCollection: (name: string, description?: string) => 
      ipcRenderer.invoke("knowledge-base:create", name, description),
    
    // List all knowledge bases
    listCollections: () => 
      ipcRenderer.invoke("knowledge-base:list"),
    
    // Get documents for a knowledge base
    listFiles: (knowledgeBaseId: number) => 
      ipcRenderer.invoke("knowledge-base:get-documents", knowledgeBaseId),
    
    // Get chunks for a knowledge base
    getChunks: (knowledgeBaseId: number) => 
      ipcRenderer.invoke("knowledge-base:get-chunks", knowledgeBaseId),
    
    // Import a file to a knowledge base
    importFile: ({ file, collectionId }: { file: File, collectionId: string }) => 
      ipcRenderer.invoke("document:process", file.path, collectionId),
    
    // Select files for import
    selectFiles: () => ipcRenderer.invoke("document:show-open-dialog"),
    
    // Remove a file from a knowledge base
    removeFile: (fileId: string) => 
      ipcRenderer.invoke("document:remove-file", fileId),
  },
  
  // Embeddings API
  embeddings: {
    // Get model file status
    getModelFileStatus: () => ipcRenderer.invoke("embeddings:get-file-status"),
    
    // Remove model files
    removeModel: () => ipcRenderer.invoke("embeddings:remove-model"),
    
    // Save a model file
    saveModelFile: (fileName: string, filePath: string) => 
      ipcRenderer.invoke("embeddings:save-model-file", fileName, filePath),
  },

  /**
   * Utility functions
   *
   * @example
   * const utils = window.soulAPI.utils
   */
  utils: {
    showLoading: () => {
      const loadingId = 'loading-mask'
      const loadingEl = document.getElementById(loadingId)
      if (loadingEl) {
        loadingEl.style.display = 'flex'
      } else {
        const loadingEl = document.createElement('div')
        loadingEl.id = loadingId
        loadingEl.style.cssText = 'display:flex;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.2);align-items:center;justify-content:center;z-index:9999;'
        const loadingContentEl = document.createElement('div')
        loadingContentEl.style.cssText = 'padding:20px;background:#fff;border-radius:8px;box-shadow:0 0 10px rgba(0,0,0,0.2);text-align:center;'
        loadingContentEl.innerHTML = '<div>Loading...</div>'
        loadingEl.appendChild(loadingContentEl)
        document.body.appendChild(loadingEl)
      }
    },
    removeLoading: () => {
      const loadingId = 'loading-mask'
      const loadingEl = document.getElementById(loadingId)
      if (loadingEl) {
        loadingEl.style.display = 'none'
      }
    },
  },
})

// --------- Preload scripts loading ---------
function domReady(condition: DocumentReadyState[] = ["complete", "interactive"]) {
  return new Promise(resolve => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener("readystatechange", () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  },
}

/**
 * Loading animation utility
 * Adapted from various spinner libraries:
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function createLoadingAnimation() {
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
  `
  const oStyle = document.createElement("style")
  const oDiv = document.createElement("div")

  oStyle.id = "app-loading-style"
  oStyle.innerHTML = styleContent
  oDiv.className = "app-loading-wrap"
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const loadingUtils = createLoadingAnimation()
domReady().then(() => loadingUtils.appendLoading())

window.onmessage = (ev) => {
  if (ev.data.payload === "removeLoading") {
    loadingUtils.removeLoading()
  }
}

setTimeout(() => loadingUtils.removeLoading(), 30000)
