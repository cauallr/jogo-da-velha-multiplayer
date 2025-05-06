import { useEffect } from "react";

const NeonCursor = () => {
  useEffect(() => {
    const cursor = document.createElement("div");
    cursor.style.width = "0px";
    cursor.style.height = "0px";
    cursor.style.borderRadius = "50%";
    cursor.style.position = "fixed";
    cursor.style.zIndex = "9999";
    cursor.style.pointerEvents = "none";
    cursor.style.transition = "transform 0.1s ease";
    document.body.appendChild(cursor);

    const moveCursor = (e) => {
      const halfWidth = window.innerWidth / 2;
      const isLeft = e.clientX < halfWidth;

      const color = isLeft ? "cyan" : "red";
      const glow = isLeft ? "0 0 10px cyan, 0 0 20px #00ffff" : "0 0 10px red, 0 0 20px darkred";

      // Atualiza o cursor principal
      cursor.style.background = color;
      cursor.style.boxShadow = glow;
      cursor.style.transform = `translate(${e.clientX - cursor.offsetWidth}px, ${e.clientY - cursor.offsetHeight}px)`;

      // Cria o rastro neon
      const trail = document.createElement("div");
      trail.style.width = "14px";
      trail.style.height = "14px";
      trail.style.borderRadius = "50%";
      trail.style.position = "fixed";
      trail.style.left = `${e.clientX - 5}px`;
      trail.style.top = `${e.clientY - 5}px`;
      trail.style.background = color;
      trail.style.pointerEvents = "none";
      trail.style.zIndex = "9998";
      trail.style.opacity = "0.8";
      trail.style.boxShadow = isLeft
        ? "0 0 8px cyan, 0 0 15px #00ffff"
        : "0 0 8px red, 0 0 15px darkred";
      trail.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";

      document.body.appendChild(trail);

      setTimeout(() => {
        trail.style.opacity = "0";
        trail.style.transform = "scale(2)";
      }, 10);

      setTimeout(() => {
        trail.remove();
      }, 600);
    };

    window.addEventListener("mousemove", moveCursor);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      cursor.remove();
    };
  }, []);

  return null;
};

export default NeonCursor;
