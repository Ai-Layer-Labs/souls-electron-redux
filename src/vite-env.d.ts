/// <reference types="vite/client" />

type ModelResults = {
  error?: string
  results: string[]
}

type HotkeyMap = {
  [key: string]: string | boolean | number | null
}

interface Window {
  // expose in the `electron/preload/index.ts`
  electron: {
    ipcRenderer: import("electron").IpcRenderer & {
      port: () => Promise<number>
      getResourcesPath: (p: string) => Promise<string>
      openScriptsDir: () => Promise<void>
      fillPathToConfig: (config: string) => Promise<string | null>
      openaiModelList: (apiKey: string) => Promise<ModelResults>
      openaiCompatibleModelList: (apiKey: string, baseURL: string) => Promise<ModelResults>
      anthropicModelList: (apiKey: string, baseURL: string) => Promise<ModelResults>
      ollamaModelList: (baseURL: string) => Promise<ModelResults>
      googleGenaiModelList: (apiKey: string) => Promise<ModelResults>
      mistralaiModelList: (apiKey: string) => Promise<ModelResults>
      bedrockModelList: (accessKeyId: string, secretAccessKey: string, sessionToken: string, region: string) => Promise<ModelResults>
      showDocumentOpenDialog: () => Promise<{ filePath: string | null }>
      startDocumentImport: (filePath: string) => void
      showSelectionContextMenu: () => Promise<void>
      showInputContextMenu: () => Promise<void>
      getHotkeyMap: () => Promise<HotkeyMap>
      getPlatform: () => Promise<string>
      getAutoLaunch: () => Promise<boolean>
      setAutoLaunch: (enable: boolean) => Promise<boolean>
      getMinimalToTray: () => Promise<boolean>
      setMinimalToTray: (enable: boolean) => Promise<boolean>
      openPopup: (options: { url: string, width?: number, height?: number, modal?: boolean }) => Promise<boolean>
      closePopup: () => Promise<boolean>
      unsubscribeAll: (channel: string) => void
    }
    
    knowledge: {
      createCollection: (name: string, description?: string) => Promise<any>
      listCollections: () => Promise<any[]>
      listFiles: (knowledgeBaseId: number) => Promise<any[]>
      getChunks: (knowledgeBaseId: number) => Promise<any[]>
      importFile: ({ file, collectionId }: { file: any, collectionId: string }) => Promise<any>
      selectFiles: () => Promise<any>
      removeFile: (fileId: string) => Promise<boolean>
    }
    
    embeddings: {
      getModelFileStatus: () => Promise<{ [key: string]: boolean }>
      removeModel: () => Promise<void>
      saveModelFile: (fileName: string, filePath: string) => Promise<void>
    }
  }

  PLATFORM: "darwin" | "win32" | "linux"
}
