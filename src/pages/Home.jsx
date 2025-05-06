import { useEffect } from "react"; // Importa o hook useEffect do React
import { Link } from "react-router-dom"; // Importa o componente Link para navegação entre páginas
import RobotImage from "../pages/elements/RobotImage"; // Componente de imagem do robô
import './Home.css'; // Estilos específicos da página Home
import NeonCursor from "./elements/NeonCursor"; // Componente de cursor neon personalizado

const Home = () => {
  useEffect(() => {
    // Seleciona todos os elementos com a classe .menu-link
    const links = document.querySelectorAll('.menu-link');
    const listeners = []; // Array para armazenar os listeners e limpar depois

    // Para cada link, adiciona comportamento visual dinâmico
    links.forEach(link => {
      // Armazena o texto original do link em um atributo data
      link.setAttribute('data-text', link.textContent);

      // Função para alterar a cor do texto dinamicamente com base na posição do mouse
      const handleMouseMove = (e) => {
        const rect = link.getBoundingClientRect(); // Pega posição e tamanho do link
        const x = e.clientX - rect.left; // Posição do mouse relativa ao link
        const percent = x / rect.width; // Percentual horizontal dentro do link

        const r = Math.floor(255 * percent); // Mais vermelho à direita
        const b = Math.floor(255 * (1 - percent)); // Mais azul à esquerda
        const color = `rgb(${r}, 60, ${b})`; // Gera a cor RGB dinâmica

        link.style.color = color; // Aplica a cor ao link
      };

      // Ao entrar no link, adiciona uma classe para estilo (ex: animações)
      const handleMouseEnter = () => link.classList.add('hovering');

      // Ao sair do link, reseta a cor e remove a classe
      const handleMouseLeave = () => {
        link.style.color = 'white';
        link.classList.remove('hovering');
      };

      // Adiciona os listeners de evento
      link.addEventListener('mousemove', handleMouseMove);
      link.addEventListener('mouseenter', handleMouseEnter);
      link.addEventListener('mouseleave', handleMouseLeave);

      // Armazena para remoção posterior no cleanup
      listeners.push({
        link,
        handleMouseMove,
        handleMouseEnter,
        handleMouseLeave
      });
    });

    // Cleanup para remover todos os event listeners ao desmontar o componente
    return () => {
      listeners.forEach(({ link, handleMouseMove, handleMouseEnter, handleMouseLeave }) => {
        link.removeEventListener('mousemove', handleMouseMove);
        link.removeEventListener('mouseenter', handleMouseEnter);
        link.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []); // Executa apenas uma vez ao montar o componente

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white relative">
      {/* Componente do cursor personalizado com efeito neon */}
      <NeonCursor />
      
      <div className="home-container">
        {/* Título principal com destaque colorido */}
        <h1 className="home-title">
          <span className="title-cyan">VELHA </span>
          <span className="title-red">GAME</span>
        </h1>

        {/* Menu central da home */}
        <div className="home-menu">
          {/* Robô do lado esquerdo (círculo) */}
          <RobotImage path_in_assets="robo_olhos_azuis.png" name_image="robo_circulo" />

          {/* Links de navegação para os modos do jogo */}
          <div className="menu-links">
            <Link to="/local" className="menu-link">JOGAR LOCAL</Link>
            <Link to="/multi" className="menu-link">JOGAR MULTI</Link>
            <Link to="/config" className="menu-link">CONFIGURAÇÕES</Link>
          </div>

          {/* Robô do lado direito (X) */}
          <RobotImage path_in_assets="robo_olhos_x.png" name_image="robo_x" id="robo_x" />
        </div>

        {/* Rodapé com crédito */}
        <p className="footer-text">FEITO POR: CAUÃ LEÃO</p>
      </div>
    </div>
  );
};

export default Home;
