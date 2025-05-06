import React, { useState, useEffect, useRef } from "react";
import './Local.css';
import NeonCursor from "./elements/NeonCursor"; // Componente visual do cursor neon

const Local = () => {
  const popSoundRef = useRef(null);
  const [gameActive, setGameActive] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [gameBoard, setGameBoard] = useState(Array(9).fill(null));
  const [isComputer, setIsComputer] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem("velha-config"));
    setSoundEffectsEnabled(settings?.soundEffects ?? true);
  }, []);

  const switchPlayer = () => {
    setCurrentPlayer((prevPlayer) => (prevPlayer === "X" ? "O" : "X"));
  };

  const restartGame = () => {
    setGameBoard(Array(9).fill(null));
    setGameActive(true);
    setCurrentPlayer("X");
    setShowModal(false);
    setModalMessage("");
    setHasStarted(true);
  };

  const backToMenu = () => {
    setGameBoard(Array(9).fill(null));
    setGameActive(false);
    setCurrentPlayer("X");
    setIsComputer(false);
    setHasStarted(false);
    setShowModal(false);
    setModalMessage("");
    setPlayer1Score(0);
    setPlayer2Score(0);
  };

  const startGame = (mode) => {
    setIsComputer(mode === "computer");
    setGameBoard(Array(9).fill(null));
    setGameActive(true);
    setCurrentPlayer("X");
    setShowModal(false);
    setModalMessage("");
    setHasStarted(true);
  };

  const checkWinner = (board) => {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return true;
      }
    }
    return false;
  };

  const renderCell = (cell, idx) => {
    const cellClass =
      cell === "X" ? "cell x-cell" :
      cell === "O" ? "cell o-cell" :
      "cell empty-cell";

    return (
      <div key={idx} onClick={() => handleCellClick(idx)} className={cellClass}>
        {cell === "X" && <span className="neon-red">X</span>}
        {cell === "O" && <span className="neon-blue">O</span>}
      </div>
    );
  };

  const handleMove = (index, player) => {
    const newBoard = [...gameBoard];
    newBoard[index] = player;
    setGameBoard(newBoard);

    // 🔊 Toca o som da jogada (se permitido)
    if (soundEffectsEnabled && popSoundRef.current) {
      popSoundRef.current.currentTime = 0;
      popSoundRef.current.play().catch(err => {
        console.error("Erro ao tocar som da jogada:", err);
      });
    }

    if (checkWinner(newBoard)) {
      setGameActive(false);
      setTimeout(() => {
        if (isComputer) {
          if (player === "X") {
            setPlayer1Score(prev => prev + 1);
            setModalMessage("Você venceu!");
          } else {
            setPlayer2Score(prev => prev + 1);
            setModalMessage("A Máquina venceu!");
          }
        } else {
          if (player === "X") {
            setPlayer1Score(prev => prev + 1);
            setModalMessage("Jogador 1 venceu!");
          } else {
            setPlayer2Score(prev => prev + 1);
            setModalMessage("Jogador 2 venceu!");
          }
        }
        setShowModal(true);
      }, 100);
    } else if (newBoard.every(cell => cell !== null)) {
      setGameActive(false);
      setTimeout(() => {
        setModalMessage('Deu velha!');
        setShowModal(true);
      }, 100);
    } else {
      switchPlayer();
    }
  };

  const handleCellClick = (index) => {
    if (!gameActive || gameBoard[index]) return;

    if (isComputer) {
      if (currentPlayer === "X") {
        handleMove(index, "X");
      }
    } else {
      handleMove(index, currentPlayer);
    }
  };

  const computerMove = () => {
    const bestMove = findBestMove(gameBoard);
    if (bestMove !== -1) {
      handleMove(bestMove, "O");
    }
  };

  const findBestMove = (board) => {
    let move = findWinningMove(board, "O");
    if (move !== -1) return move;

    move = findWinningMove(board, "X");
    if (move !== -1) return move;

    const availableCells = board
      .map((value, index) => (value === null ? index : null))
      .filter((index) => index !== null);

    return availableCells[Math.floor(Math.random() * availableCells.length)];
  };

  const findWinningMove = (board, player) => {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      const line = [board[a], board[b], board[c]];
      const emptyIndex = line.indexOf(null);

      if (emptyIndex !== -1 && line.filter(x => x === player).length === 2) {
        return [a, b, c][emptyIndex];
      }
    }

    return -1;
  };

  useEffect(() => {
    if (isComputer && currentPlayer === "O" && gameActive) {
      const timer = setTimeout(() => {
        computerMove();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentPlayer, isComputer, gameActive]);

  return (
    <div className="local-container">
      <audio ref={popSoundRef} src="/sounds/pop.mp3" preload="auto" />
      <NeonCursor />

      {!hasStarted && (
        <div id="menu" className="menu-container">
          <h1 className="menu-title">
            <span className="title-cyan">ESCOLHA </span>
            <span className="title-red">O MODO</span>
          </h1>
          <div className="mode-buttons">
            <button className="mode-btn" onClick={() => startGame("local")}>
              👥 Jogar Local (2 jogadores)
            </button>
            <button className="mode-btn" onClick={() => startGame("computer")}>
              🤖 Jogar contra a Máquina
            </button>
          </div>
        </div>
      )}

      {hasStarted && (
        <div id="game" className="game-container">
          <h1>{isComputer ? "Contra a Máquina" : "Jogo Local"}</h1>

          <div className="scoreboard">
            <div className="player player1">
              <img src="/src/assets/imgs/robo_olhos_azuis.png" alt="Jogador 1" />
              <span className="score blue">{player1Score}</span>
            </div>
            <div className="vs-icon">⚔️</div>
            <div className="player player2">
              <img src="/src/assets/imgs/robo_olhos_x.png" alt="Jogador 2" />
              <span className="score red">{player2Score}</span>
            </div>
          </div>

          <div className="game-board">
            <div className="player-turn">
              {gameActive ? (
                isComputer 
                  ? (currentPlayer === "X" ? "Sua vez!" : "Vez da Máquina...")
                  : `Jogador ${currentPlayer === "X" ? 1 : 2}: Sua vez!`
              ) : null}
            </div>

            <div className="board">
              {gameBoard.map((cell, index) => renderCell(cell, index))}
            </div>
          </div>

          <div className="game-info">
            <button id="restartBtn" onClick={restartGame}>Reiniciar Jogo</button>
            <button id="menuBtn" onClick={backToMenu} style={{ marginLeft: '10px' }}>
              Voltar ao Menu
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{modalMessage}</h2>
            <button onClick={restartGame}>Jogar de Novo</button>
            <button onClick={backToMenu} style={{ marginTop: '10px' }}>
              Voltar ao Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Local;
