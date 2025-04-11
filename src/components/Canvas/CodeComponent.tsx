import React, { useEffect } from 'react';
import { CanvasContentData } from 'stores/useCanvasStore';
import hljs from 'highlight.js';
import useAppearanceStore from 'stores/useAppearanceStore';
import 'highlight.js/styles/atom-one-light.css';
import 'highlight.js/styles/atom-one-dark.css';
import './CodeComponent.css';

interface CodeComponentProps {
  data: CanvasContentData;
}

const CodeComponent: React.FC<CodeComponentProps> = ({ data }) => {
  const theme = useAppearanceStore((state) => state.theme);

  useEffect(() => {
    hljs.highlightAll();
  }, [data.code, data.language]);

  if (!data.code) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-[rgba(var(--color-text-secondary),var(--tw-text-opacity))]">No code content provided</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 overflow-auto bg-[rgba(var(--color-bg-surface-1),var(--tw-bg-opacity))]">
      <pre className={`rounded-lg shadow-md overflow-auto p-4 ${theme === 'dark' ? 'dark' : ''}`}>
        <code className={`language-${data.language || 'javascript'}`}>
          {data.code}
        </code>
      </pre>
    </div>
  );
};

export default CodeComponent;