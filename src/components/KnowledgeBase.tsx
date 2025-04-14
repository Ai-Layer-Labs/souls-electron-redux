import React, { useState, useEffect, ChangeEvent, MouseEvent } from 'react'
import { Button, Input, List, Modal, message } from 'antd'
import { PlusOutlined, FileTextOutlined } from '@ant-design/icons'
import './KnowledgeBase.css'

// Add type declarations for the window.electron object
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke(channel: string, ...args: unknown[]): Promise<unknown>
      }
    }
  }
}

interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Document {
  pageContent: string;
  metadata: {
    id: string;
    name: string;
    description?: string;
  };
}

interface ImportResult {
  filePath?: string
  error?: string
}

interface ProcessResult {
  success?: boolean
  chunks?: number
  error?: string
}

export const KnowledgeBase: React.FC = () => {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [selectedBase, setSelectedBase] = useState<KnowledgeBase | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [newBaseName, setNewBaseName] = useState('')
  const [newBaseDescription, setNewBaseDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadKnowledgeBases()
  }, [])

  useEffect(() => {
    if (selectedBase) {
      loadDocuments(selectedBase.id)
    }
  }, [selectedBase])

  const loadKnowledgeBases = async () => {
    setIsLoading(true)
    try {
      const bases = await window.electron.ipcRenderer.invoke('knowledge:list') as KnowledgeBase[]
      setKnowledgeBases(bases)
    } catch (err) {
      console.error('Failed to load knowledge bases:', err)
      message.error('Failed to load knowledge bases. Please check the console for details.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadDocuments = async (baseId: string) => {
    setIsLoading(true)
    try {
      const docs = await window.electron.ipcRenderer.invoke('knowledge:get-documents', baseId) as Document[]
      setDocuments(docs)
    } catch (err) {
      console.error('Failed to load documents:', err)
      message.error('Failed to load documents. Please check the console for details.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateBase = async () => {
    if (!newBaseName.trim()) {
      message.error('Please enter a name for the knowledge base')
      return
    }

    setIsLoading(true)
    try {
      await window.electron.ipcRenderer.invoke(
        'knowledge:add',
        newBaseName,
        newBaseDescription || undefined
      )
      
      await loadKnowledgeBases()
      setIsModalVisible(false)
      setNewBaseName('')
      setNewBaseDescription('')
      message.success('Knowledge base created successfully')
    } catch (err) {
      console.error('Failed to create knowledge base:', err)
      message.error('Failed to create knowledge base. Please check the console for details.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportDocument = async (baseId: string) => {
    setIsLoading(true)
    try {
      const result = await window.electron.ipcRenderer.invoke('document:show-open-dialog', baseId) as ImportResult
      
      if (result.error) {
        message.error(result.error)
        return
      }

      if (result.filePath) {
        const processResult = await window.electron.ipcRenderer.invoke('document:process', result.filePath, baseId) as ProcessResult
        
        if (processResult.error) {
          message.error(processResult.error)
          return
        }

        message.success(`Document imported successfully: ${processResult.chunks} chunks processed`)
        loadDocuments(baseId)
      }
    } catch (err) {
      console.error('Failed to import document:', err)
      message.error('Failed to import document. Please check the console for details.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="knowledge-base-container">
      <div className="knowledge-base-header">
        <h2>Knowledge Bases</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          loading={isLoading}
        >
          New Knowledge Base
        </Button>
      </div>

      <div className="knowledge-base-content">
        <div className="knowledge-base-list">
          <List
            loading={isLoading}
            dataSource={knowledgeBases}
            renderItem={(base: KnowledgeBase) => (
              <List.Item
                className={selectedBase?.id === base.id ? 'selected' : ''}
                onClick={() => setSelectedBase(base)}
              >
                <List.Item.Meta
                  title={base.name}
                  description={base.description}
                />
                <Button
                  type="primary"
                  icon={<FileTextOutlined />}
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation()
                    handleImportDocument(base.id)
                  }}
                  loading={isLoading}
                >
                  Import Document
                </Button>
              </List.Item>
            )}
          />
        </div>

        {selectedBase && (
          <div className="knowledge-base-documents">
            <h3>Documents in {selectedBase.name}</h3>
            <List
              loading={isLoading}
              dataSource={documents}
              renderItem={(doc: Document) => (
                <List.Item>
                  <List.Item.Meta
                    title={doc.metadata.name}
                    description={doc.metadata.description}
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </div>

      <Modal
        title="Create New Knowledge Base"
        open={isModalVisible}
        onOk={handleCreateBase}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={isLoading}
      >
        <Input
          placeholder="Knowledge Base Name"
          value={newBaseName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewBaseName(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Input.TextArea
          placeholder="Description (optional)"
          value={newBaseDescription}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewBaseDescription(e.target.value)}
        />
      </Modal>
    </div>
  )
} 