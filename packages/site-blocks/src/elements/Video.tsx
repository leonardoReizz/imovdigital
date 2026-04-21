import type { VideoElement } from '@imovdigital/types';
import { elementStyleToCss } from '../utils/style';

function getYouTubeEmbed(src: string): string | null {
  const match = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function getVimeoEmbed(src: string): string | null {
  const match = src.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : null;
}

export function VideoBlock({ element }: { element: VideoElement }) {
  const frame = {
    width: '100%',
    height: '100%',
    minHeight: 240,
    border: 'none',
    ...elementStyleToCss(element.style),
  } as const;

  if (element.provider === 'youtube') {
    const embed = getYouTubeEmbed(element.src);
    if (!embed) return null;
    return (
      <iframe
        src={embed}
        style={frame}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (element.provider === 'vimeo') {
    const embed = getVimeoEmbed(element.src);
    if (!embed) return null;
    return <iframe src={embed} style={frame} allowFullScreen />;
  }

  return (
    <video
      src={element.src}
      style={frame}
      autoPlay={element.autoplay}
      loop={element.loop}
      controls={element.controls ?? true}
      muted={element.muted}
      playsInline
    />
  );
}
