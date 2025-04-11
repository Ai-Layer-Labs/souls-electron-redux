import React from 'react';
import { CanvasContentData } from 'stores/useCanvasStore';
import { Button } from '@fluentui/react-components';
import { OpenRegular } from '@fluentui/react-icons';

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
        <Button
          appearance="primary"
          icon={<OpenRegular />}
          onClick={handleOpenExternal}
        >
          Open in External Viewer
        </Button>
      </div>
    </div>
  );
};

export default PDFComponent;