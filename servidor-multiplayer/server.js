const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();



const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Agora o Socket.IO está ligado ao servidor HTTP
server.listen(3001, "0.0.0.0", () => {
  console.log("Servidor Socket.IO ouvindo na porta 3001");
});


const rooms = {};
const playerRooms = {}; // mapeia socket.id para o nome da sala criada

io.on("connection", (socket) => {
  console.log("Novo jogador conectado:", socket.id);

  socket.on("checkMyRoom", () => {
    const myRoom = playerRooms[socket.id];
    if (myRoom && rooms[myRoom]) {
      socket.emit("hasRoom", myRoom);
    }
  });

  socket.on("getRooms", () => {
    const availableRooms = Object.entries(rooms)
      .filter(([_, room]) => room.players.length < 2)
      .map(([name]) => name);
    socket.emit("roomsAvailable", availableRooms);
  });

  socket.on("createRoom", (roomName) => {
    if (rooms[roomName]) {
      socket.emit("roomError", "Sala já existe.");
      return;
    }

    if (Object.values(playerRooms).includes(roomName)) {
      socket.emit("roomError", "Você já criou uma sala.");
      return;
    }

    rooms[roomName] = {
      players: [socket],
      board: Array(9).fill(null),
      turn: "X",
      symbols: { [socket.id]: "X" },
    };

    playerRooms[socket.id] = roomName;

    socket.join(roomName);
    console.log(`Sala criada: ${roomName}`);
  });

  socket.on("joinRoom", (roomName) => {
    const room = rooms[roomName];

    if (!room || room.players.length >= 2) {
      socket.emit("roomError", "Sala cheia ou inexistente.");
      return;
    }

    room.players.push(socket);
    room.symbols[socket.id] = "O";
    socket.join(roomName);

    room.players.forEach((player) => {
      const symbol = room.symbols[player.id];
      player.emit("startGame", {
        symbol,
        board: room.board,
        turn: room.turn,
      });
    });
  });

  socket.on("playMove", (index) => {
    const roomName = [...socket.rooms].find((r) => r !== socket.id);
    const room = rooms[roomName];
    if (!room) return;

    const symbol = room.symbols[socket.id];
    if (!symbol || room.turn !== symbol || room.board[index] !== null) return;

    room.board[index] = symbol;
    room.turn = symbol === "X" ? "O" : "X";

    const winner = checkWinner(room.board);
    const fullBoard = room.board.every((cell) => cell !== null);

    io.to(roomName).emit("boardUpdate", {
      newBoard: room.board,
      nextTurn: room.turn,
    });

    if (winner) {
      io.to(roomName).emit("gameOver", winner);
    } else if (fullBoard) {
      io.to(roomName).emit("gameOver", "draw");
    }
  });

  socket.on("restartGame", () => {
    const roomName = [...socket.rooms].find((r) => r !== socket.id);
    const oldRoom = rooms[roomName];
    if (!oldRoom || oldRoom.players.length < 2) return;

    rooms[roomName] = {
      players: [...oldRoom.players],
      board: Array(9).fill(null),
      turn: "X",
      symbols: { ...oldRoom.symbols },
    };

    for (const player of rooms[roomName].players) {
      const symbol = rooms[roomName].symbols[player.id];
      player.emit("startGame", {
        board: rooms[roomName].board,
        turn: rooms[roomName].turn,
        symbol,
      });
    }
  });

  socket.on("leaveRoom", () => {
    const roomName = playerRooms[socket.id];
    if (roomName) {
      delete rooms[roomName];
      delete playerRooms[socket.id];
      socket.leave(roomName);
    }
  });

  socket.on("removeRoom", () => {
    const roomName = playerRooms[socket.id];
    if (roomName) {
      const room = rooms[roomName];
      if (room) {
        room.players.forEach((p) => {
          if (p.id !== socket.id) {
            p.leave(roomName);
            p.emit("roomError", "O host cancelou a sala.");
          }
        });
      }
      delete rooms[roomName];
      delete playerRooms[socket.id];
      socket.leave(roomName);
    }
  });

  socket.on("disconnect", () => {
    const roomName = playerRooms[socket.id];
    const room = rooms[roomName];
    if (!room) return;
  
    // Remove o jogador da sala
    room.players = room.players.filter((p) => p.id !== socket.id);
  
    // Notifica o outro jogador
    room.players.forEach((player) => {
      const symbol = room.symbols[socket.id];
      player.emit("playerLeft", symbol);
    });
  
    // Se a sala estiver vazia, deletar
    if (room.players.length === 0) {
      delete rooms[roomName];
    }
  
    // Remover da referência de rooms
    delete playerRooms[socket.id];
  });
  
});

function checkWinner(board) {
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

  for (const [a, b, c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}
