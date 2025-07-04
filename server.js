const express= require("express"); // web sunucusu kurmaya yarar
const next= require("next");
const http= require("http");
const{Server}= require("socket.io"); // websocket sunucusu kurmak

const dev= process.env.NODE_ENV !== "production"; // yayın modu

const app= next({dev});
const handle= app.getRequestHandler(); //next.js isteklerini yönetiyor
const expressApp= express();

const httpServer= http.createServer(expressApp);
const io= new Server(httpServer,{
  cors:{origin:"*"},
});

io.on("connection", (socket) => { // wbsocket sunucusu oluşturuluyor
  console.log("Bağlanan kullanıcı:", socket.id);

  socket.on("sendMessage", (msg)=> {
    console.log ("Mesaj geldi:", msg);

    io.emit("receiveMessage", {
      id:socket.id,
      text:msg
    });
  });

  socket.on("disconnect", () => {
    console.log("Kullanıcı ayrıldı:", socket.id);
  });
});

expressApp.all("*", (req,res)=> {
  return handle(req,res);
});

app.prepare().then(()=>{
  httpServer.listen(3000, () => {
    console.log("Sunucu 3000 portunda çalışıyor");

  });
});

// express web sunucusu kuruyor
//next next.js arayüzünü ayağa kaldırıyor
//socket.io gerçek zamanlı mesajlaşma sağlar
//app.prepare sunucuyu başlatır