import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useCanvasStore from './CanvasStore';
import ContentRouter from './ContentRouter';
import CanvasDebugTools from './CanvasDebugTools';
import './Canvas.css';

interface CanvasProps {
  chatId: string;
}

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development';

// Min and max widths for the canvas
const MIN_WIDTH = 300;
const MAX_WIDTH = 1200;

const Canvas: React.FC<CanvasProps> = ({ chatId }) => {
  const { t } = useTranslation();
  const { contentType, contentData, isVisible, width, setVisibility, setWidth } = useCanvasStore();
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(width);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = startXRef.current - e.clientX;
    const newWidth = Math.min(Math.max(startWidthRef.current + deltaX, MIN_WIDTH), MAX_WIDTH);
    setWidth(newWidth);
  }, [isDragging, setWidth]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      className="right-sidebar ml-5 -mr-5 z-20 pt-2.5 flex-shrink-0 border-l hidden sm:flex inset-y-0 top-0 flex-col duration-300 md:relative pl-2"
      style={{ width: `${width}px` }}
    >
      <div
        className={`canvas-resize-handle ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
      />
      <div className="h-full canvas-container">
        <div className="canvas-header p-2 border-b">
          <div className="flex justify-between items-center">
            <strong>
              {t('Common.Canvas', 'Canvas')}
            </strong>
            <div className="flex items-center">
              <button
                className="text-gray-600 hover:text-gray-900"
                aria-label={t('Common.Close', 'Close')}
                onClick={() => setVisibility(false)}
              >
                &#x00D7;
              </button>
            </div>
          </div>
        </div>

        {/* Always show debug tools in development mode */}
        {/* {isDev && (
          <div className="canvas-debug-toolbar p-2 border-b">
            <CanvasDebugTools chatId={chatId} />
          </div>
        )} */}

        <div className="canvas-content">
          <ContentRouter contentType={contentType} data={contentData} />
        </div>
      </div>
    </aside>
  );
};

export default Canvas;