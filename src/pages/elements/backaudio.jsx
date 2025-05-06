import { useRef, useEffect } from 'react';

function BackgroundAudio() {
  const audioRef = useRef(null);

  useEffect(() => {
    const tryPlay = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(err => {
          console.error("Erro ao tentar tocar o áudio:", err);
        });
      }
    };

    tryPlay();
  }, []);

  return (
    <audio ref={audioRef} loop>
      <source src="/sounds/Luzes de Neon.mp3" type="audio/mpeg" />
    </audio>
  );
}

export default BackgroundAudio;
