import { useState, useEffect } from "react";
import { socket } from "../socket";
import './multi.css';

export default function MultiplayerGame({ page }) {
  const [step, setStep] = useState("menu");
  const [roomName, setRoomName] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [inputRoomName, setInputRoomName] = useState("");
  const [myRoom, setMyRoom] = useState(null);

  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const [mySymbol, setMySymbol] = useState("");
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState("");

  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    socket.emit("checkMyRoom");

    socket.on("hasRoom", (room) => {
      setRoomName(room);
      setStep("waiting");
    });

    socket.emit("getRooms");

    const handleRoomsAvailable = (rooms) => {
      setAvailableRooms(rooms);
    };

    socket.on("roomsAvailable", handleRoomsAvailable);

    socket.on("boardUpdate", ({ newBoard, nextTurn }) => {
      setBoard(newBoard);
      setTurn(nextTurn);
    });

    socket.on("startGame", ({ symbol, board, turn }) => {
      setMySymbol(symbol);
      setBoard(board);
      setTurn(turn);
      setWinner(null);
      setShowModal(false);
      setModalMessage("");
      setStep("playing");
    });

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

    socket.on("roomError", (message) => {
      setError(message);
      setStep("menu");
    });
    socket.on("playerLeft", (symbol) => {
      setModalMessage(`Jogador ${symbol} saiu da sala.`);
      setShowModal(true);
      setStep("waiting");
    });
    

    const interval = setInterval(() => {
      socket.emit("getRooms");
    }, 2000);

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

  const createRoom = () => {
    if (!inputRoomName.trim()) return;
    socket.emit("createRoom", inputRoomName);
    setRoomName(inputRoomName);
    setStep("waiting");
  };

  const joinRoom = (room) => {
    socket.emit("joinRoom", room);
    setRoomName(room);
    setStep("waiting");
  };

  const clickCell = (index) => {
    if (board[index] !== null || winner || turn !== mySymbol) return;
    socket.emit("playMove", index);
  };

  const restartGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setShowModal(false);
    setModalMessage("");
    socket.emit("restartGame", roomName);
  };

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

  const removeRoom = () => {
    socket.emit("removeRoom");
    setStep("menu");
    setRoomName("");
  };

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

  if (step === "menu") {
    return (
      <div className="flex-center bg-black text-white">
        <div className="wrapper neon-box">
          <h1 className="text-2xl mb-4 neon">Jogo da Velha Multiplayer</h1>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="mb-4">
            <input
              type="text"
              value={inputRoomName}
              onChange={(e) => setInputRoomName(e.target.value)}
              placeholder="Nome da Sala"
              className="p-2 rounded-md text-black"
            />
            <button onClick={createRoom} className="ml-2 p-2 bg-green-600 rounded-md hover:bg-green-700">
              Criar Sala
            </button>
          </div>

          <div>
            <h2 className="text-xl mb-2">Salas Disponíveis:</h2>
            {availableRooms.length === 0 && <p>Nenhuma sala disponível.</p>}
            <div className="flex flex-col space-y-2">
              {availableRooms.map((room) => (
                <button
                  key={room}
                  onClick={() => joinRoom(room)}
                  className="p-2 bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Entrar em {room}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  if (step === "playing") {
    return (
      <div className="flex-center bg-black text-white">
        {/* {mySymbol === "X" ? (
          <button onClick={restartGame} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md mb-2">
            SEU SÍMBOLO É X
          </button>
        ) : (
          <p className="text-white mb-2">SEU SÍMBOLO É O</p>
        )} */}
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

          <div className="wrapper neon-box board-wrapper">
            <div className="board">
              {board.map((cell, idx) => renderCell(cell, idx))}
            </div>
          </div>
        </div>

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

  return null;
}
