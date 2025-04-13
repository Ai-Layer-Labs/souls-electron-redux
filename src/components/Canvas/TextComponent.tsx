import React from 'react';
import { CanvasContentData } from 'stores/useCanvasStore';

interface TextComponentProps {
  data: CanvasContentData;
}

const TextComponent: React.FC<TextComponentProps> = ({ data }) => {
  return (
    <div className="w-full h-full p-4 overflow-auto bg-[rgba(var(--color-bg-surface-1),var(--tw-bg-opacity))]">
      <div className="prose max-w-none text-[rgba(var(--color-text-base),var(--tw-text-opacity))]">
        {data.text || 'No text content to display'}
      </div>
    </div>
  );
};

export default TextComponent;