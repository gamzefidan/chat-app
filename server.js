const express = require("express");
const next = require("next");
const http = require("http");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();
const expressApp = express();

const httpServer = http.createServer(expressApp);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const users = new Map(); //kullanıcıyı takip et

io.on("connection", (socket) => {
  console.log("Bağlanan kullanıcı:", socket.id);

  socket.on("join", (username) => {
    users.set(socket.id, { id: socket.id, username });
    io.emit("users", Array.from(users.values()));
    io.emit("message", {
      type: "system",
      text: `${username} odaya katıldı.`,
    });
  });

  socket.on("message", (data) => {
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      io.emit("users", Array.from(users.values()));
      io.emit("message", {
        type: "system",
        text: `${user.username} ayrıldı.`,
      });
    }
  });
});

expressApp.all("*", (req, res) => { // istekleri next.js gönder
  return handle(req, res);
});

app.prepare().then(() => { //sunucuyu başlat
  httpServer.listen(3000, () => {
    console.log("Sunucu 3000 portunda çalışıyor");
  });
});
