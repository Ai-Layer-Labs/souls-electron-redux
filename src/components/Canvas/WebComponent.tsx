import React from 'react';
import { CanvasContentData } from 'stores/useCanvasStore';
import { Button } from '@fluentui/react-components';
import { OpenRegular } from '@fluentui/react-icons';
import useAppearanceStore from 'stores/useAppearanceStore';

interface WebComponentProps {
  data: CanvasContentData;
}

const WebComponent: React.FC<WebComponentProps> = ({ data }) => {
  const theme = useAppearanceStore((state) => state.theme);

  if (!data.url) {
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
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
          <p>No URL provided</p>
        </div>
      </div>
    );
  }

  const handleOpenExternal = () => {
    window.open(data.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[rgba(var(--color-bg-surface-1),var(--tw-bg-opacity))]">
      <div className="w-full h-full shadow-md rounded-lg overflow-hidden border border-[rgba(var(--color-border),var(--tw-border-opacity))]">
        <iframe
          src={data.url}
          width="100%"
          height="100%"
          title="Web Content"
          className="border-0"
          sandbox="allow-scripts allow-same-origin allow-forms"
        ></iframe>
      </div>
      <div className="mt-2 flex justify-center">
        <Button
          appearance="primary"
          icon={<OpenRegular />}
          onClick={handleOpenExternal}
        >
          Open in Browser
        </Button>
      </div>
    </div>
  );
};

export default WebComponent;