import { useRef, useState } from 'react';

function BackgroundAudio() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    if (!playing) {
      audioRef.current.play()
        .then(() => setPlaying(true))
        .catch((err) => console.log("Erro ao tocar:", err));
    }
  };

  return (
    <div>
      
      <audio ref={audioRef} loop>
        <source src="/Luzes de Neon.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}

export default BackgroundAudio;
