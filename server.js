
const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const PORT = Number(process.env.PORT || 3000);
const STUN_SERVERS = ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const liveRooms = new Map();

app.use(express.static(path.join(__dirname)));

app.get("/health", (_req, res) => {
  res.json({ ok: true, rooms: liveRooms.size });
});

app.get("/api/live-config", (_req, res) => {
  res.json({ iceServers: buildIceServers() });
});

io.on("connection", (socket) => {
  socket.emit("live:rooms", summarizeRooms());

  socket.on("live:list", () => {
    socket.emit("live:rooms", summarizeRooms());
  });

  socket.on("live:start", (payload, ack = () => {}) => {
    const title = String(payload?.title || "").trim();
    const topic = String(payload?.topic || "general").trim().toLowerCase();
    const hostUserId = String(payload?.hostUserId || "").trim();
    const hostUsername = String(payload?.hostUsername || "").trim();

    if (!title || !hostUserId || !hostUsername) {
      ack({ ok: false, message: "Datos de LIVE incompletos." });
      return;
    }

    if (socket.data.hostingRoomId) {
      stopRoom(socket.data.hostingRoomId, "host_restarted");
    }

    const roomId = `live_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const room = {
      id: roomId,
      title,
      topic,
      hostSocketId: socket.id,
      hostUserId,
      hostUsername,
      startedAt: new Date().toISOString(),
      viewers: new Map(),
      chat: []
    };

    liveRooms.set(roomId, room);
    socket.join(roomId);
    socket.data.hostingRoomId = roomId;

    const summary = summarizeRoom(room);
    ack({ ok: true, room: summary });
    io.emit("live:started", summary);
    io.emit("live:rooms", summarizeRooms());
  });

  socket.on("live:join", (payload, ack = () => {}) => {
    const roomId = String(payload?.roomId || "");
    const room = liveRooms.get(roomId);
    if (!room) {
      ack({ ok: false, message: "El LIVE ya no esta disponible." });
      return;
    }

    if (socket.id === room.hostSocketId) {
      ack({ ok: true, room: summarizeRoom(room) });
      return;
    }

    const viewerUserId = String(payload?.userId || `guest_${socket.id}`);
    const viewerUsername = String(payload?.username || "invitado");

    room.viewers.set(socket.id, {
      socketId: socket.id,
      userId: viewerUserId,
      username: viewerUsername,
      joinedAt: new Date().toISOString()
    });

    socket.join(roomId);
    socket.data.viewerRoomId = roomId;

    io.to(room.hostSocketId).emit("live:viewer-joined", {
      roomId,
      viewerSocketId: socket.id,
      viewerUserId,
      viewerUsername
    });

    io.to(roomId).emit("live:viewer-count", {
      roomId,
      viewerCount: room.viewers.size
    });

    io.emit("live:rooms", summarizeRooms());
    ack({ ok: true, room: summarizeRoom(room) });
  });
  socket.on("live:leave", (payload = {}) => {
    const roomId = String(payload.roomId || socket.data.viewerRoomId || "");
    if (!roomId) return;
    leaveRoomAsViewer(socket, roomId);
  });

  socket.on("live:chat", (payload = {}) => {
    const roomId = String(payload.roomId || "");
    const room = liveRooms.get(roomId);
    if (!room) return;

    const text = String(payload.text || "").trim();
    if (!text) return;

    const senderIsHost = socket.id === room.hostSocketId;
    const senderIsViewer = room.viewers.has(socket.id);
    if (!senderIsHost && !senderIsViewer) return;

    const msg = {
      id: `m_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId: String(payload.userId || (senderIsHost ? room.hostUserId : "guest")),
      username: String(payload.username || (senderIsHost ? room.hostUsername : "invitado")),
      text,
      createdAt: new Date().toISOString()
    };

    room.chat.push(msg);
    if (room.chat.length > 200) room.chat = room.chat.slice(-200);

    io.to(roomId).emit("live:chat", { roomId, message: msg });
  });

  socket.on("live:signal", (payload = {}) => {
    const roomId = String(payload.roomId || "");
    const targetSocketId = String(payload.targetSocketId || "");
    const type = String(payload.type || "");
    const data = payload.data;

    const room = liveRooms.get(roomId);
    if (!room || !targetSocketId || !type) return;

    const senderIsHost = socket.id === room.hostSocketId;
    const senderIsViewer = room.viewers.has(socket.id);
    if (!senderIsHost && !senderIsViewer) return;

    io.to(targetSocketId).emit("live:signal", {
      roomId,
      fromSocketId: socket.id,
      type,
      data
    });
  });

  socket.on("live:stop", (payload = {}, ack = () => {}) => {
    const roomId = String(payload.roomId || socket.data.hostingRoomId || "");
    const room = liveRooms.get(roomId);
    if (!room) {
      ack({ ok: false, message: "LIVE no encontrado." });
      return;
    }

    if (room.hostSocketId !== socket.id) {
      ack({ ok: false, message: "Solo el host puede finalizar el LIVE." });
      return;
    }

    stopRoom(roomId, "host_stopped");
    ack({ ok: true });
  });

  socket.on("disconnect", () => {
    if (socket.data.hostingRoomId) {
      stopRoom(socket.data.hostingRoomId, "host_disconnected");
    }

    if (socket.data.viewerRoomId) {
      leaveRoomAsViewer(socket, socket.data.viewerRoomId);
    }
  });
});

function leaveRoomAsViewer(socket, roomId) {
  const room = liveRooms.get(roomId);
  if (!room) return;

  const removed = room.viewers.delete(socket.id);
  socket.leave(roomId);

  if (!removed) return;

  io.to(room.hostSocketId).emit("live:viewer-left", {
    roomId,
    viewerSocketId: socket.id
  });

  io.to(roomId).emit("live:viewer-count", {
    roomId,
    viewerCount: room.viewers.size
  });

  io.emit("live:rooms", summarizeRooms());
}
function stopRoom(roomId, reason) {
  const room = liveRooms.get(roomId);
  if (!room) return;

  io.to(roomId).emit("live:stopped", {
    roomId,
    reason
  });

  liveRooms.delete(roomId);
  io.emit("live:rooms", summarizeRooms());
}

function summarizeRoom(room) {
  return {
    id: room.id,
    title: room.title,
    topic: room.topic,
    hostSocketId: room.hostSocketId,
    hostUserId: room.hostUserId,
    hostUsername: room.hostUsername,
    startedAt: room.startedAt,
    viewerCount: room.viewers.size
  };
}

function summarizeRooms() {
  return [...liveRooms.values()].map(summarizeRoom);
}

function buildIceServers() {
  const iceServers = [{ urls: STUN_SERVERS }];
  const turnUrl = process.env.TURN_URL;
  const turnUsername = process.env.TURN_USERNAME;
  const turnCredential = process.env.TURN_CREDENTIAL;

  if (turnUrl && turnUsername && turnCredential) {
    iceServers.push({
      urls: [turnUrl],
      username: turnUsername,
      credential: turnCredential
    });
  }

  return iceServers;
}

server.listen(PORT, () => {
  console.log(`elchetv server running on http://localhost:${PORT}`);
});
