const express= require("express"); // web sunucusu kurmaya yarar
const next= require("next");
const http= require("http");
const{Server}= require("socket.io"); // websocket sunucusu kurmak

const dev= process.env.NODE_ENV !== "production"; // yayın modu

const app= next({dev});
const handle= app.getRequestHandler(); //next.js isteklerini yönetiyor
const expressApp= express();

const httpServer= http.createServer(expressApp);
const io= new Server(httpServer, {
  cors: { origin: "*" },
});


const users = {};

io.on("connection", (socket) => {
  console.log("Bağlanan kullanıcı:", socket.id);

 
  socket.on("join", (name) => {
    users[socket.id] = name;

  
    io.emit("users", Object.entries(users).map(([id, name]) => ({ id, name })));
  });

  
  socket.on("sendMessage", (msg) => {
    console.log("Mesaj geldi:", msg);

    
    if (msg.to) {
      io.to(msg.to).emit("receiveMessage", {
        id: socket.id,
        text: msg.text,
        to: msg.to
      });
    } else {
      
      io.emit("receiveMessage", {
        id: socket.id,
        text: msg.text
      });
    }
  });

  
  socket.on("disconnect", () => {
    console.log("Kullanıcı ayrıldı:", socket.id);
    delete users[socket.id];
    io.emit("users", Object.entries(users).map(([id, name]) => ({ id, name })));
  });
});

expressApp.all("*", (req, res) => {
  return handle(req, res);
});

app.prepare().then(() => {
  httpServer.listen(3000, () => {
    console.log("Sunucu 3000 portunda çalışıyor");
  });
});
