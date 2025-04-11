import React from 'react';
import { CanvasContentData } from 'stores/useCanvasStore';
import useAppearanceStore from 'stores/useAppearanceStore';

interface ImageComponentProps {
  data: CanvasContentData;
}

const ImageComponent: React.FC<ImageComponentProps> = ({ data }) => {
  const theme = useAppearanceStore((state) => state.theme);

  if (!data.src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[rgba(var(--color-bg-surface-1),var(--tw-bg-opacity))]">
        <div className="text-[rgba(var(--color-text-secondary),var(--tw-text-opacity))] text-center p-4">
          <svg
            className="w-12 h-12 mx-auto mb-2 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p>No image source provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-4 overflow-auto bg-[rgba(var(--color-bg-surface-1),var(--tw-bg-opacity))]">
      <div className="relative max-w-full max-h-full rounded-lg overflow-hidden shadow-md border border-[rgba(var(--color-border),var(--tw-border-opacity))]">
        <img
          src={data.src}
          alt={data.alt || "Content"}
          className="max-w-full max-h-full object-contain"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default ImageComponent;