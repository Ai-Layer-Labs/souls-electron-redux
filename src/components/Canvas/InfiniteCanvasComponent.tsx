import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Tldraw, useEditor, TLDocument, TLShape, TLEditorSnapshot, TLTextShape, Editor, createShapeId } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { CanvasContentData } from './CanvasStore'; // No longer directly needed for chat data
import { useAtomValue } from 'jotai'; // Import Jotai hook
import { currentChatIdAtom } from '../../atoms/chatState'; // Import Jotai atom
import useCanvasStore from './CanvasStore';
import { debounce } from 'lodash';

interface InfiniteCanvasComponentProps {
  // data prop might be deprecated if we solely rely on chatStore
  data: CanvasContentData;
}

const InfiniteCanvasComponent: React.FC<InfiniteCanvasComponentProps> = (/*{ data }*/) => {
  const currentChatId = useAtomValue(currentChatIdAtom); // Use Jotai atom for chat ID
  // const updateCanvasData = useChatStore((state) => state.updateCanvasData); // Remove Zustand hook
  const contentData = useCanvasStore((state) => state.contentData); // Keep this for dropped content
  const [persistenceKey, setPersistenceKey] = useState<string>('tldraw-temp'); // Default key for temp chat
  // const [initialSnapshot, setInitialSnapshot] = useState<TLEditorSnapshot | undefined>(undefined); // Let tldraw handle initial loading
  const editorRef = useRef<Editor | null>(null); // Updated type to Editor
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Set persistence key when chat ID changes
  useEffect(() => {
    const key = currentChatId ? `tldraw-chat-${currentChatId}` : 'tldraw-temp';
    setPersistenceKey(key);

    // Remove initial snapshot loading logic - tldraw handles this via persistenceKey/snapshot props
    // if (currentChat.canvasData) {
    //   try {
    //     const parsedData = JSON.parse(currentChat.canvasData);
    //     if (parsedData && parsedData.store) {
    //         setInitialSnapshot(parsedData as TLEditorSnapshot);
    //     } else {
    //         console.warn('Invalid canvas snapshot found in store, starting fresh.');
    //         setInitialSnapshot(undefined);
    //     }
    //   } catch (e) {
    //     console.error('Failed to parse canvas snapshot:', e);
    //     setInitialSnapshot(undefined);
    //   }
    // } else {
    //   setInitialSnapshot(undefined); // No data, start fresh
    // }

  }, [currentChatId]); // Depend only on chat ID

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

  // Debounced function - no longer needs to explicitly save if relying on tldraw persistence
  const debouncedSave = useCallback(
    debounce((editor: Editor) => {
      // tldraw automatically persists changes to localStorage based on persistenceKey
      // No need to call updateCanvasData here if backend persistence isn't implemented
      // if (currentChatId) { // Only save for non-temp chats
      //   const snapshot = editor.getSnapshot();
      //   // console.log('Saving canvas snapshot via tldraw persistence for:', currentChatId);
      //   // updateCanvasData(currentChatId, JSON.stringify(snapshot)); // Remove this call
      // }
      // console.log('Change detected, tldraw should persist for key:', persistenceKey);
    }, 1000), // Debounce interval might still be useful for logging or future extensions
    [persistenceKey] // Depend on persistenceKey to log correctly if needed
    // [currentChatId] // Original dependency was currentChat.id and updateCanvasData
  );

  // Callback for when the editor mounts
  const handleMount = useCallback((editor: Editor) => {
    console.log("handleMount", editor)
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
  const tldrawKey = currentChatId || 'temp';

  return (
    <div className="w-full h-full">
      <Tldraw
        key={tldrawKey} // Force re-mount on chat change
        persistenceKey={persistenceKey} // Let tldraw handle load/save via this key
        // snapshot={initialSnapshot} // Remove explicit snapshot, let tldraw load from persistenceKey
        onMount={handleMount}
        autoFocus
      />
    </div>
  );
};

export default InfiniteCanvasComponent;