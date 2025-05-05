import { useEffect } from "react";
import { Link } from "react-router-dom";
import RobotImage from "../pages/elements/RobotImage";
import './Home.css';
import NeonCursor from "./elements/NeonCursor";

const Home = () => {
  useEffect(() => {
    const links = document.querySelectorAll('.menu-link');

    const listeners = [];

    links.forEach(link => {
      link.setAttribute('data-text', link.textContent);

      const handleMouseMove = (e) => {
        const rect = link.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;

        const r = Math.floor(255 * percent);
        const b = Math.floor(255 * (1 - percent));
        const color = `rgb(${r}, 60, ${b})`;

        link.style.color = color;
      };

      const handleMouseEnter = () => link.classList.add('hovering');
      const handleMouseLeave = () => {
        link.style.color = 'white';
        link.classList.remove('hovering');
      };

      link.addEventListener('mousemove', handleMouseMove);
      link.addEventListener('mouseenter', handleMouseEnter);
      link.addEventListener('mouseleave', handleMouseLeave);

      listeners.push({
        link,
        handleMouseMove,
        handleMouseEnter,
        handleMouseLeave
      });
    });

    // cleanup
    return () => {
      listeners.forEach(({ link, handleMouseMove, handleMouseEnter, handleMouseLeave }) => {
        link.removeEventListener('mousemove', handleMouseMove);
        link.removeEventListener('mouseenter', handleMouseEnter);
        link.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white relative">
      <NeonCursor />
      
      <div className="home-container">
        <h1 className="home-title">
          <span className="title-cyan">VELHA </span>
          <span className="title-red">GAME</span>
        </h1>

        <div className="home-menu">
          <RobotImage path_in_assets="robo_olhos_azuis.png" name_image="robo_circulo" />

          <div className="menu-links">
            <Link to="/local" className="menu-link">JOGAR LOCAL</Link>
            <Link to="/multi" className="menu-link">JOGAR MULTI</Link>
            <Link to="/config" className="menu-link">CONFIGURAÇÕES</Link>
          </div>

          <RobotImage path_in_assets="robo_olhos_x.png" name_image="robo_x" id="robo_x" />
        </div>

        <p className="footer-text">FEITO POR: CAUÃ LEÃO</p>
      </div>
    </div>
  );
};

export default Home;
