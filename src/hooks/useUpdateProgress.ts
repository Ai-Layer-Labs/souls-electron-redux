import { getAutoDownload } from "../updater"
import { ProgressInfo } from "electron-updater"
import { useCallback, useEffect, useState } from "react"
import { newVersionAtom } from "../atoms/globalState"
import { useAtomValue } from "jotai"

export default function useUpdateProgress(onComplete: () => void, onError: (e: { message: string, error: Error }) => void) {
  const [progress, setProgress] = useState(0)
  const newVersion = useAtomValue(newVersionAtom)

  useEffect(() => {
    window.electron.ipcRenderer.invoke("check-update")
  }, [])

  const update = useCallback(async () => {
    if (window.PLATFORM === "darwin") {
      window.open("https://github.com/OpenAgentPlatform/Souls/releases/latest", "_blank")
      return
    }

    const autoDownload = getAutoDownload()
    if (autoDownload || progress >= 100) {
      window.electron.ipcRenderer.invoke("quit-and-install")
      return
    }

    window.electron.ipcRenderer.invoke("start-download")
    setProgress(0.1)
  }, [progress])

  const handleDownloadProgress = useCallback((event: Electron.IpcRendererEvent, progressInfo: ProgressInfo) => {
    if (progressInfo.percent > 0) {
      setProgress(progressInfo.percent)
    }
  }, [setProgress])

  const handleError = useCallback((event: Electron.IpcRendererEvent, error: Error) => {
    setProgress(0)
    onError({
      message: error.message,
      error,
    })
  }, [onError])

  useEffect(() => {
    if (getAutoDownload()) {
      setProgress(0)
      return
    }

    window.electron.ipcRenderer.on("download-progress", handleDownloadProgress)
    window.electron.ipcRenderer.on("update-downloaded", onComplete)
    window.electron.ipcRenderer.on("update-error", handleError)

    return () => {
      window.electron.ipcRenderer.off("download-progress", handleDownloadProgress)
      window.electron.ipcRenderer.off("update-downloaded", onComplete)
      window.electron.ipcRenderer.off("update-error", handleError)
    }
  }, [handleDownloadProgress, onComplete, onError])

  return { progress, update, newVersion }
}
