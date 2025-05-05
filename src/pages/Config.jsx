import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./config.css";

const defaultConfig = {
  music: true,
  soundEffects: true,
  theme: "dark",
};

export default function Config() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("velha-config");
    return saved ? JSON.parse(saved) : defaultConfig;
  });

  const updateSetting = (key, value) => {
    const newSettings = {
      ...settings,
      [key]: key === "theme" ? (value ? "dark" : "light") : value,
    };
    setSettings(newSettings);
    localStorage.setItem("velha-config", JSON.stringify(newSettings));

    if (key === "theme") {
      document.documentElement.classList.toggle("dark", newSettings.theme === "dark");
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, []);

  return (
    <div className="config-overlay">
      <div className="config-modal">
        <h2 className="config-title">Configurações</h2>

        <div className="config-option">
          <span>Música</span>
          <input
            type="checkbox"
            checked={settings.music}
            onChange={() => updateSetting("music", !settings.music)}
          />
        </div>

        <div className="config-option">
          <span>Efeitos Sonoros</span>
          <input
            type="checkbox"
            checked={settings.soundEffects}
            onChange={() => updateSetting("soundEffects", !settings.soundEffects)}
          />
        </div>

        <div className="config-option">
          <span>Tema Claro</span>
          <input
            type="checkbox"
            checked={settings.theme === "dark"}
            onChange={() => updateSetting("theme", settings.theme !== "dark")}
          />
        </div>

        <button className="config-button" onClick={() => navigate("/")}>
          Fechar
        </button>
      </div>
    </div>
  );
}
