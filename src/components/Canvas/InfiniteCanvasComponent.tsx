import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Tldraw, useEditor, TLDocument, TLShape, TLEditorSnapshot, TLTextShape, Editor, createShapeId } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { CanvasContentData } from 'stores/useCanvasStore';
import useChatStore from 'stores/useChatStore';
import useCanvasStore from 'stores/useCanvasStore';
import { debounce } from 'lodash';

interface InfiniteCanvasComponentProps {
  // data prop might be deprecated if we solely rely on chatStore
  // data: CanvasContentData;
}

const InfiniteCanvasComponent: React.FC<InfiniteCanvasComponentProps> = (/*{ data }*/) => {
  const currentChat = useChatStore((state) => state.chat);
  const updateCanvasData = useChatStore((state) => state.updateCanvasData);
  const contentData = useCanvasStore((state) => state.contentData);
  const [persistenceKey, setPersistenceKey] = useState<string>('tldraw-temp'); // Default key for temp chat
  const [initialSnapshot, setInitialSnapshot] = useState<TLEditorSnapshot | undefined>(undefined);
  const editorRef = useRef<Editor | null>(null); // Updated type to Editor
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Set persistence key and load initial data when chat changes
  useEffect(() => {
    const key = currentChat.id ? `tldraw-chat-${currentChat.id}` : 'tldraw-temp';
    setPersistenceKey(key);

    // Load initial document from store if available
    if (currentChat.canvasData) {
      try {
        const parsedData = JSON.parse(currentChat.canvasData);
        // Validate snapshot structure (basic check for store)
        if (parsedData && parsedData.store) {
            setInitialSnapshot(parsedData as TLEditorSnapshot);
        } else {
            console.warn('Invalid canvas snapshot found in store, starting fresh.');
            setInitialSnapshot(undefined);
        }
      } catch (e) {
        console.error('Failed to parse canvas snapshot:', e);
        setInitialSnapshot(undefined);
      }
    } else {
      setInitialSnapshot(undefined); // No data, start fresh
    }

    // Reset editor state when chat changes to force reload with new document/key
    // This might depend on how Tldraw handles key changes internally.
    // If direct key change doesn't reload document, more forceful reset might be needed.

  }, [currentChat.id, currentChat.canvasData]); // Depend on chat ID and the data itself

  // Handle dropped text when contentData changes
  useEffect(() => {
    if (editorRef.current && contentData.droppedText && contentData.timestamp) {
      const editor = editorRef.current;
      
      // Get the center of the viewport
      const { width, height } = editor.getViewportPageBounds();
      const point = {
        x: width / 2,
        y: height / 2,
      };

      // Create a note shape with the dropped text
      editor.createShape({
        id: createShapeId(),
        type: 'geo',
        x: point.x,
        y: point.y,
        props: {
          geo: 'rectangle',
          color: 'yellow',
          size: 'l',
          text: contentData.droppedText,
          fill: 'solid',
        },
      });
    }
  }, [contentData.droppedText, contentData.timestamp]);

  // Debounced function to save canvas data
  const debouncedSave = useCallback(
    debounce((editor: any) => {
      if (currentChat.id) { // Only save for non-temp chats
        const snapshot = editor.getSnapshot();
        // console.log('Saving canvas snapshot for:', currentChat.id);
        updateCanvasData(currentChat.id, JSON.stringify(snapshot));
      }
    }, 1000), // Save 1 second after the last change
    [currentChat.id, updateCanvasData] // Dependencies for useCallback
  );

  // Callback for when the editor mounts
  const handleMount = useCallback((editor: Editor) => {
    editorRef.current = editor;

    // Set up drop handling
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const text = e.dataTransfer?.getData('text/plain');
      if (!text) return;

      const point = editor.screenToPage({
        x: e.clientX,
        y: e.clientY,
      });

      // Create a sticky note
      editor.mark('creating sticky note');
      
      const id = createShapeId();
      editor.createShape({
        id,
        type: 'geo',
        x: point.x,
        y: point.y,
        props: {
          geo: 'rectangle',
          color: 'yellow',
          size: 'l',
          text: text,
          fill: 'solid',
        },
      });

      // Select the newly created shape
      editor.select(id);
      editor.complete();
    };

    // Add drop event listener to the editor's container
    const container = editor.getContainer();
    container.addEventListener('drop', handleDrop);
    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'copy';
    });

    // Set up listener for changes
    const handleChange = () => {
      debouncedSave(editor);
    };
    editor.on('change', handleChange);

    // Cleanup listener on unmount or editor change
    return () => {
      container.removeEventListener('drop', handleDrop);
      container.removeEventListener('dragover', (e) => e.preventDefault());
      editor.off('change', handleChange);
    };
  }, [debouncedSave]);

  // Use a key prop on Tldraw to force re-mount when chat ID changes
  const tldrawKey = currentChat.id || 'temp';

  return (
    <div className="w-full h-full">
      <Tldraw
        key={tldrawKey}
        persistenceKey={persistenceKey}
        snapshot={initialSnapshot}
        onMount={handleMount}
        autoFocus
      />
    </div>
  );
};

export default InfiniteCanvasComponent; 