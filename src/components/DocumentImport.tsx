import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import Tooltip from "./Tooltip"
import "../styles/DocumentImport.css"

interface DocumentImportProps {
  onImportComplete?: () => void
}

const DocumentImport: React.FC<DocumentImportProps> = ({ onImportComplete }) => {
  const { t } = useTranslation()
  const [isImporting, setIsImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)

  useEffect(() => {
    // Listen for import progress updates
    const handleImportProgress = (_event: Electron.IpcRendererEvent, message: string) => {
      setImportStatus(message)
      
      // Update progress based on message content
      if (message.includes("chunk")) {
        const match = message.match(/chunk (\d+)\/(\d+)/)
        if (match) {
          const current = parseInt(match[1])
          const total = parseInt(match[2])
          setProgress(Math.round((current / total) * 100))
        }
      } else if (message.includes("complete")) {
        setProgress(100)
        setIsImporting(false)
        if (onImportComplete) {
          onImportComplete()
        }
      } else if (message.includes("Error")) {
        setIsImporting(false)
      }
    }

    window.electron.ipcRenderer.on("document:import-progress", handleImportProgress)

    return () => {
      window.electron.ipcRenderer.off("document:import-progress", handleImportProgress)
    }
  }, [onImportComplete])

  const handleImportClick = async () => {
    try {
      setIsImporting(true)
      setImportStatus("Selecting document...")
      setProgress(0)
      
      const result = await window.electron.ipcRenderer.showDocumentOpenDialog()
      
      if (result.filePath) {
        setImportStatus("Starting import...")
        window.electron.ipcRenderer.startDocumentImport(result.filePath)
      } else {
        setIsImporting(false)
        setImportStatus(null)
      }
    } catch (error) {
      console.error("Error starting document import:", error)
      setImportStatus(`Error: ${error instanceof Error ? error.message : String(error)}`)
      setIsImporting(false)
    }
  }

  return (
    <div className="document-import">
      <Tooltip content={t("Import document (PDF, EPUB, MOBI)")}>
        <button 
          className="document-import-button" 
          onClick={handleImportClick}
          disabled={isImporting}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </button>
      </Tooltip>
      
      {isImporting && (
        <div className="document-import-status">
          <div className="document-import-progress">
            <div 
              className="document-import-progress-bar" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="document-import-message">{importStatus}</div>
        </div>
      )}
    </div>
  )
}

export default DocumentImport 