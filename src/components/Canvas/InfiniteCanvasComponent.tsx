import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Tldraw, useEditor, TLDocument, TLShape, TLEditorSnapshot, TLTextShape, Editor, createShapeId, AssetRecordType } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { CanvasContentData } from './CanvasStore'; // No longer directly needed for chat data
import { useAtomValue } from 'jotai'; // Import Jotai hook
import { currentChatIdAtom } from '../../atoms/chatState'; // Import Jotai atom
import useCanvasStore from './CanvasStore';
import { debounce } from 'lodash';

// Create a new atom to access the editor instance externally
import { atom } from 'jotai';
export const canvasEditorAtom = atom<Editor | null>(null);

interface InfiniteCanvasComponentProps {
  // data prop might be deprecated if we solely rely on chatStore
  data: CanvasContentData;
}

// Function to add an image to a TLDraw canvas
export const addImageToCanvas = async (
  editor: Editor | null, 
  imageUrl: string, 
  x?: number, 
  y?: number
): Promise<boolean> => {
  if (!editor) return false;
  
  try {
    // Create an image element to get dimensions
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });
    
    const imageWidth = img.width;
    const imageHeight = img.height;
    
    // Scale down large images
    const MAX_SIZE = 800;
    let scaledWidth = imageWidth;
    let scaledHeight = imageHeight;
    
    if (imageWidth > MAX_SIZE || imageHeight > MAX_SIZE) {
      const aspectRatio = imageWidth / imageHeight;
      if (imageWidth > imageHeight) {
        scaledWidth = MAX_SIZE;
        scaledHeight = MAX_SIZE / aspectRatio;
      } else {
        scaledHeight = MAX_SIZE;
        scaledWidth = MAX_SIZE * aspectRatio;
      }
    }
    
    // Create a unique asset ID
    const assetId = AssetRecordType.createId();
    
    // Add the asset to the editor
    editor.createAssets([
      {
        id: assetId,
        type: 'image',
        typeName: 'asset',
        props: {
          name: `image-${Date.now()}.png`,
          src: imageUrl,
          w: imageWidth,
          h: imageHeight,
          mimeType: 'image/png',
          isAnimated: false,
        },
        meta: {},
      },
    ]);
    
    // Get position for the image - center of viewport if not specified
    const viewportBounds = editor.getViewportPageBounds();
    const posX = x ?? viewportBounds.width / 2 - scaledWidth / 2 + viewportBounds.x;
    const posY = y ?? viewportBounds.height / 2 - scaledHeight / 2 + viewportBounds.y;
    
    // Create the image shape
    editor.createShape({
      type: 'image',
      x: posX,
      y: posY,
      props: {
        assetId,
        w: scaledWidth,
        h: scaledHeight,
      },
    });
    
    // Focus on the added image
    editor.zoomToFit();
    
    return true;
  } catch (error) {
    console.error('Error adding image to canvas:', error);
    return false;
  }
};

const InfiniteCanvasComponent: React.FC<InfiniteCanvasComponentProps> = (/*{ data }*/) => {
  const currentChatId = useAtomValue(currentChatIdAtom); // Use Jotai atom for chat ID
  const contentData = useCanvasStore((state) => state.contentData); // Keep this for dropped content
  const [persistenceKey, setPersistenceKey] = useState<string>(''); // Initialize empty, will be set in useEffect
  const editorRef = useRef<Editor | null>(null); // Updated type to Editor
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  // Use a ref to track if this is a new instance to ensure a unique temp key
  const tempIdRef = useRef<string>(Date.now().toString());
  const previousChatIdRef = useRef<string | null>(null);
  const forceNewCanvasRef = useRef<boolean>(false);
  
  // Set persistence key when chat ID changes
  useEffect(() => {
    // Check if we switched to a new chat or cleared the chat ID (new chat)
    if (previousChatIdRef.current !== currentChatId) {
      // If we switched from a chat to a new chat (empty chatId), force new canvas
      if (previousChatIdRef.current && !currentChatId) {
        forceNewCanvasRef.current = true;
        // Generate a new temp ID for the new chat to ensure a fresh canvas
        tempIdRef.current = Date.now().toString();
        console.log("New chat detected, creating fresh canvas with ID:", tempIdRef.current);
      }
      
      previousChatIdRef.current = currentChatId;
    }
    
    // For a chat with ID, use that ID for persistence
    // For a new chat without ID, use a unique temporary key
    const key = currentChatId 
      ? `tldraw-chat-${currentChatId}` 
      : `tldraw-temp-${tempIdRef.current}`;
    
    setPersistenceKey(key);
    
    // Force a remount of the Tldraw component by changing the key
    if (editorRef.current) {
      console.log('Chat ID changed, canvas will be remounted:', currentChatId || 'new chat');
    }
  }, [currentChatId]); 

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

  // Update the external editor atom when the editor reference changes
  useEffect(() => {
    if (editorRef.current) {
      window.canvasEditor = editorRef.current; // For debugging
    }
  }, [editorRef.current]);

  // Debounced function - no longer needs to explicitly save if relying on tldraw persistence
  const debouncedSave = useCallback(
    debounce((editor: Editor) => {
      // tldraw automatically persists changes to localStorage based on persistenceKey
      console.log('Canvas state auto-saved for chat:', currentChatId || 'new chat', 'with key:', persistenceKey);
    }, 1000),
    [persistenceKey, currentChatId]
  );

  // Callback for when the editor mounts
  const handleMount = useCallback((editor: Editor) => {
    console.log("TLDraw mounted for chat:", currentChatId || 'new chat', "with key:", persistenceKey);
    editorRef.current = editor;
    // Update the global editor reference
    window.canvasEditor = editor;

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
  }, [debouncedSave, currentChatId, persistenceKey]);

  // Generate a unique key for both the component and the persistence to ensure proper remounting
  // For existing chats, use the chat ID
  // For new chats, use a unique temporary ID that changes each time a new chat is created
  const tldrawKey = currentChatId 
    ? `chat-${currentChatId}` 
    : `new-chat-${tempIdRef.current}-${forceNewCanvasRef.current ? 'fresh' : 'existing'}`;

  return (
    <div className="w-full h-full">
      <Tldraw
        key={tldrawKey} // Force re-mount on chat change with a truly unique key
        persistenceKey={persistenceKey} // Let tldraw handle load/save via this key
        onMount={handleMount}
        autoFocus
      />
    </div>
  );
};

// Add to global window for debugging and external access
declare global {
  interface Window {
    canvasEditor: Editor | null;
  }
}

window.canvasEditor = null;

export default InfiniteCanvasComponent;