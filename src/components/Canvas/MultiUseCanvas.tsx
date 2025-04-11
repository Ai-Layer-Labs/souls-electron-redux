import React, { useCallback } from 'react';
import { CanvasContentType, CanvasContentData } from 'stores/useCanvasStore';
import { CalendarView } from './CalendarView';
import useCanvasStore from 'stores/useCanvasStore';
import InfiniteCanvasComponent from './InfiniteCanvasComponent';

interface MultiUseCanvasProps {
  contentType: CanvasContentType;
  contentData: CanvasContentData;
}

export const MultiUseCanvas: React.FC<MultiUseCanvasProps> = ({ contentType, contentData }) => {
  const setContent = useCanvasStore((state) => state.setContent);
  const currentChatId = useCanvasStore((state) => state.chatId);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const text = e.dataTransfer.getData('text/plain');
    if (!text || !currentChatId) return;

    // Switch to canvas view and pass the dropped text
    setContent(currentChatId, 'canvas', {
      droppedText: text,
      timestamp: Date.now(),
    });
  }, [currentChatId, setContent]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // Wrap all content in a drop target div
  return (
    <div 
      className="w-full h-full relative"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {contentType === 'canvas' ? (
        <InfiniteCanvasComponent />
      ) : (
        <div className="w-full h-full">
          {(() => {
            switch (contentType) {
              case 'text':
                return <div className="p-4">{contentData.text}</div>;
              case 'code':
                return (
                  <pre className="p-4 bg-gray-100 rounded">
                    <code className={`language-${contentData.language}`}>{contentData.code}</code>
                  </pre>
                );
              case 'image':
                return <img src={contentData.src} alt="Canvas content" className="max-w-full" />;
              case 'web-content':
                return (
                  <iframe
                    src={contentData.url}
                    className="w-full h-full border-0"
                    title="Web content"
                  />
                );
              case 'calendar':
                return <CalendarView events={contentData.events || []} />;
              default:
                return <div>Unsupported content type: {contentType}</div>;
            }
          })()}
        </div>
      )}
    </div>
  );
}; 