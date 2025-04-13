import React from 'react';
import { CanvasContentData } from './CanvasStore';

interface WebComponentProps {
  data: CanvasContentData;
}

const WebComponent: React.FC<WebComponentProps> = ({ data }) => {
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
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
          onClick={handleOpenExternal}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5 0V6.375c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125V10.5m-4.5 0h4.5M12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
          </svg>
          Open in Browser
        </button>
      </div>
    </div>
  );
};

export default WebComponent;