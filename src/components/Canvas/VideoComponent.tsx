import React from 'react';
import { CanvasContentData } from './CanvasStore';

interface VideoComponentProps {
  data: CanvasContentData;
}

const VideoComponent: React.FC<VideoComponentProps> = ({ data }) => {

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
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p>No video source provided</p>
        </div>
      </div>
    );
  }

  // Handle YouTube URLs specially
  const isYouTube = data.src.includes('youtube.com') || data.src.includes('youtu.be');

  if (isYouTube) {
    // Convert YouTube URL to embed URL if needed
    let embedUrl = data.src;
    if (data.src.includes('watch?v=')) {
      const videoId = data.src.split('watch?v=')[1].split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (data.src.includes('youtu.be/')) {
      const videoId = data.src.split('youtu.be/')[1].split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    return (
      <div className="w-full h-full flex items-center justify-center p-4 bg-[rgba(var(--color-bg-surface-1),var(--tw-bg-opacity))]">
        <div className="relative w-full max-w-4xl rounded-lg overflow-hidden shadow-md border border-[rgba(var(--color-border),var(--tw-border-opacity))]">
          <div className="relative pt-[56.25%]">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={embedUrl}
              title="YouTube Video Player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    );
  }

  // For direct video sources
  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-[rgba(var(--color-bg-surface-1),var(--tw-bg-opacity))]">
      <div className="relative max-w-full max-h-full rounded-lg overflow-hidden shadow-md border border-[rgba(var(--color-border),var(--tw-border-opacity))]">
        <video
          className="max-w-full max-h-full"
          controls
          src={data.src}
          title={data.alt || "Video Player"}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default VideoComponent;