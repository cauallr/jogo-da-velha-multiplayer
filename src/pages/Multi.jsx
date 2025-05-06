import { useState, useEffect } from "react";
import { socket } from "../socket"; // Importa o socket configurado para comunicação em tempo real
import './multi.css'; // Estilos específicos para o modo multiplayer

// Componente principal do modo multiplayer
export default function MultiplayerGame({ page }) {
  // Estados do jogo e interface
  const [step, setStep] = useState("menu"); // Controla qual etapa o jogador está (menu, esperando ou jogando)
  const [roomName, setRoomName] = useState(""); // Nome da sala atual
  const [availableRooms, setAvailableRooms] = useState([]); // Lista de salas disponíveis
  const [inputRoomName, setInputRoomName] = useState(""); // Nome digitado para criar sala
  const [myRoom, setMyRoom] = useState(null); // Nome da sala do jogador (não está sendo usado no momento)

  // Estados do tabuleiro e jogo
  const [board, setBoard] = useState(Array(9).fill(null)); // Tabuleiro do jogo da velha
  const [turn, setTurn] = useState("X"); // Indica de quem é a vez
  const [mySymbol, setMySymbol] = useState(""); // Símbolo do jogador local ("X" ou "O")
  const [winner, setWinner] = useState(null); // Vencedor da partida
  const [error, setError] = useState(""); // Mensagens de erro

  // Placar e modais
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Efeito que configura os listeners do socket
  useEffect(() => {
    socket.emit("checkMyRoom"); // Verifica se o jogador já possui uma sala

    socket.on("hasRoom", (room) => {
      setRoomName(room);
      setStep("waiting"); // Vai para tela de espera
    });

    socket.emit("getRooms"); // Solicita as salas disponíveis

    // Atualiza a lista de salas disponíveis
    const handleRoomsAvailable = (rooms) => {
      setAvailableRooms(rooms);
    };
    socket.on("roomsAvailable", handleRoomsAvailable);

    // Atualiza o tabuleiro e a vez após uma jogada
    socket.on("boardUpdate", ({ newBoard, nextTurn }) => {
      setBoard(newBoard);
      setTurn(nextTurn);
    });

    // Início do jogo: define símbolo, estado inicial do tabuleiro e turno
    socket.on("startGame", ({ symbol, board, turn }) => {
      setMySymbol(symbol);
      setBoard(board);
      setTurn(turn);
      setWinner(null);
      setShowModal(false);
      setModalMessage("");
      setStep("playing");
    });

    // Fim de jogo: define o vencedor e mostra mensagem/modal
    socket.on("gameOver", (winningSymbol) => {
      setWinner(winningSymbol);
      let msg = "";
      if (winningSymbol === "draw") {
        msg = "Empate!";
      } else {
        msg = `Vitória de ${winningSymbol}!`;
        if (winningSymbol === "X") {
          setPlayer1Score((p) => p + 1);
        } else {
          setPlayer2Score((p) => p + 1);
        }
      }
      setModalMessage(msg);
      setShowModal(true);
    });

    // Caso ocorra erro ao criar/entrar na sala
    socket.on("roomError", (message) => {
      setError(message);
      setStep("menu");
    });

    // Quando um jogador sai da sala
    socket.on("playerLeft", (symbol) => {
      setModalMessage(`Jogador ${symbol} saiu da sala.`);
      setShowModal(true);
      setStep("waiting");
    });

    // Atualiza a lista de salas a cada 2 segundos
    const interval = setInterval(() => {
      socket.emit("getRooms");
    }, 2000);

    // Limpa os listeners ao desmontar o componente
    return () => {
      socket.off("roomsAvailable", handleRoomsAvailable);
      socket.off("boardUpdate");
      socket.off("startGame");
      socket.off("gameOver");
      socket.off("roomError");
      socket.off("hasRoom");
      clearInterval(interval);
    };
  }, [page]);

  // Cria uma nova sala com o nome informado
  const createRoom = () => {
    if (!inputRoomName.trim()) return;
    socket.emit("createRoom", inputRoomName);
    setRoomName(inputRoomName);
    setStep("waiting");
  };

  // Entra em uma sala existente
  const joinRoom = (room) => {
    socket.emit("joinRoom", room);
    setRoomName(room);
    setStep("waiting");
  };

  // Envia jogada ao servidor se for a vez do jogador
  const clickCell = (index) => {
    if (board[index] !== null || winner || turn !== mySymbol) return;
    socket.emit("playMove", index);
  };

  // Reinicia a partida (só pode ser feito pelo jogador X)
  const restartGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setShowModal(false);
    setModalMessage("");
    socket.emit("restartGame", roomName);
  };

  // Volta ao menu e reseta o estado do jogo
  const backToMenu = () => {
    setStep("menu");
    setRoomName("");
    setBoard(Array(9).fill(null));
    setWinner(null);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setShowModal(false);
    setModalMessage("");
    socket.emit("leaveRoom");
  };

  // Remove a sala e volta ao menu
  const removeRoom = () => {
    socket.emit("removeRoom");
    setStep("menu");
    setRoomName("");
  };

  // Renderiza cada célula do tabuleiro com estilo correspondente
  const renderCell = (cell, idx) => {
    const cellClass =
      cell === "X" ? "cell x-cell" :
      cell === "O" ? "cell o-cell" :
      "cell empty-cell";

    return (
      <div key={idx} onClick={() => clickCell(idx)} className={cellClass}>
        {cell === "X" && <span className="neon-red">X</span>}
        {cell === "O" && <span className="neon-blue">O</span>}
      </div>
    );
  };

  // Tela de menu: criar ou entrar em uma sala
  if (step === "menu") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black p-4 text-white font-orbitron">
        <div className="wrapper space-y-6 w-full max-w-3xl">
          <h1 className="title">Jogo da Velha Multiplayer</h1>

          {error && <div className="text-red-500 text-center">{error}</div>}

          <div className="w-full space-y-2">
            <input
              type="text"
              value={inputRoomName}
              onChange={(e) => setInputRoomName(e.target.value)}
              placeholder="Digite o nome da sala..."
              className="w-full p-3 rounded-md text-black text-lg placeholder:text-gray-400"
            />
            <button
              onClick={createRoom}
              className="w-full p-3 bg-red-600 hover:bg-red-700 rounded-md text-white text-lg shadow-md transition-all"
            >
              Criar Sala
            </button>
          </div>

          <div className="w-full">
            <h2 className="room-list-title text-center">Salas Disponíveis:</h2>
            {availableRooms.length === 0 ? (
              <p className="text-center text-white">Nenhuma sala disponível no momento.</p>
            ) : (
              <div className="room-box">
                {availableRooms.map((room) => (
                  <button
                    key={room}
                    onClick={() => joinRoom(room)}
                    className="room-btn"
                  >
                    Entrar em <strong>{room}</strong>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Tela de espera por outro jogador
  if (step === "waiting") {
    return (
      <div className="flex-center bg-black text-white">
        <div className="wrapper neon-box">
          <h1 className="text-2xl mb-4 neon">Sala: {roomName}</h1>
          <p>Aguardando outro jogador entrar...</p>
          <button onClick={removeRoom} className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md">
            Cancelar Sala
          </button>
        </div>
      </div>
    );
  }

  // Tela de jogo principal
  if (step === "playing") {
    return (
      <div className="flex-center bg-black text-white">
        <h1 className={`text-2xl mb-4 turn-indicator ${turn === mySymbol ? "neon" : ""}`}>
          {turn === mySymbol ? "Sua vez" : "Aguardando oponente"}
        </h1>

        <div className="score-and-board">
          <div className="score neon-box">
            <p className="mb-2 text-lg">Você é: {mySymbol}</p>
            <p className="text-lg">Placar:</p>
            <p>X: {player1Score}</p>
            <p>O: {player2Score}</p>
          </div>

          <div className="wrapper neon-box board-wrapper" id='board-multi'>
            <div className="board">
              {board.map((cell, idx) => renderCell(cell, idx))}
            </div>
          </div>
        </div>

        {/* Modal de fim de jogo ou desconexão */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2 className="text-2xl mb-4">{modalMessage}</h2>
              {winner ? (
                mySymbol === "X" ? (
                  <button onClick={restartGame} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md mb-2">
                    Jogar Novamente
                  </button>
                ) : (
                  <p className="text-white mb-2">Aguardando o host reiniciar a partida...</p>
                )
              ) : null}
              <br />
              <button onClick={backToMenu} className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md">
                Voltar ao Menu
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null; // Caso nenhum estado seja correspondente
}
