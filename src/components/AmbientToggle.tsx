import { useState, useEffect, useRef } from 'react';

interface AmbientToggleProps {
  onToggle: (isEnabled: boolean) => void;
}

export const AmbientToggle = ({ onToggle }: AmbientToggleProps) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/ambient.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.1;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleToggle = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    onToggle(newState);

    if (audioRef.current) {
      if (newState) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`fixed bottom-4 right-4 p-3 rounded-full transition-all duration-300 ${
        isEnabled 
          ? 'bg-green-500 hover:bg-green-600' 
          : 'bg-gray-700 hover:bg-gray-600'
      }`}
      aria-label={isEnabled ? 'Disable ambient sound' : 'Enable ambient sound'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {isEnabled ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5.586 15.536a5 5 0 010-7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728"
          />
        )}
      </svg>
    </button>
  );
}; 