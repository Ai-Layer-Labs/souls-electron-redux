import React from 'react';
import { CanvasContentData } from 'stores/useCanvasStore';
import useAppearanceStore from 'stores/useAppearanceStore';

interface MapComponentProps {
  data: CanvasContentData;
}

const MapComponent: React.FC<MapComponentProps> = ({ data }) => {
  const theme = useAppearanceStore((state) => state.theme);
  const position = data.position || [0, 0];
  const zoom = data.zoom || 13;

  // Default to OpenStreetMap
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${position[1] - 0.01},${position[0] - 0.01},${position[1] + 0.01},${position[0] + 0.01}&layer=mapnik&marker=${position[0]},${position[1]}`;

  return (
    <div className="w-full h-full p-4 bg-[rgba(var(--color-bg-surface-1),var(--tw-bg-opacity))]">
      <div className="w-full h-full shadow-md rounded-lg overflow-hidden border border-[rgba(var(--color-border),var(--tw-border-opacity))]">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          src={mapUrl}
          title="Map"
          className="rounded-lg"
        ></iframe>
      </div>
      <div className="mt-2 text-xs text-center">
        <a
          href={`https://www.openstreetmap.org/?mlat=${position[0]}&mlon=${position[1]}#map=${zoom}/${position[0]}/${position[1]}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[rgba(var(--color-accent),var(--tw-text-opacity))] hover:underline"
        >
          View on OpenStreetMap
        </a>
      </div>
    </div>
  );
};

export default MapComponent;