import React from 'react';
import { CanvasContentData } from './CanvasStore';

interface PDFComponentProps {
  data: CanvasContentData;
}

const PDFComponent: React.FC<PDFComponentProps> = ({ data }) => {
  if (!data.src) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">No PDF source provided</div>
      </div>
    );
  }

  const handleOpenExternal = () => {
    // Open in a new browser tab as a fallback
    window.open(data.src, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="w-full h-full shadow-md rounded overflow-hidden">
        <iframe
          src={data.src}
          width="100%"
          height="100%"
          title="PDF Viewer"
          className="border-0"
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
          Open in External Viewer
        </button>
      </div>
    </div>
  );
};

export default PDFComponent;