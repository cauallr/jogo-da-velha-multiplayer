import { useRef, useEffect, useContext } from 'react';
import { ConfigContext } from "../context/ConfigContext";

function BackgroundAudio() {
  const { settings } = useContext(ConfigContext);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.volume = settings.musicVolume;

    if (settings.music) {
      audioRef.current.play().catch(err => {
        console.error("Erro ao tentar tocar o áudio:", err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [settings.music, settings.musicVolume]);

  return (
    <audio ref={audioRef} loop style={{ display: "none" }}>
      <source src="/sounds/Luzes de Neon.mp3" type="audio/mpeg" />
    </audio>
  );
}

export default BackgroundAudio;
