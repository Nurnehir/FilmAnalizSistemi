import { useEffect } from 'react';

export default function TrailerModal({ trailer, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const embedUrl =
    trailer.site === 'YouTube'
      ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1`
      : `https://player.vimeo.com/video/${trailer.key}?autoplay=1`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black text-white rounded-full w-9 h-9 flex items-center justify-center text-lg transition-colors"
        >
          ✕
        </button>
        <iframe
          src={embedUrl}
          title={trailer.name}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
