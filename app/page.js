"use client"; 
 
import { useState, useEffect } from "react";
import io from "socket.io-client";
import styles from "./page.module.css";


export default function Home() {
  const [socket, setSocket] = useState(null);   
  const [message, setMessage] = useState("");   
  const [chat, setChat] = useState([]);     

  

  useEffect(() => {
  const newSocket = io();
  setSocket(newSocket);

  newSocket.on("receiveMessage", (data) => { // gelen mesaş kendi mesajımız değilse chat ekle
    
    if (data.id !== newSocket.id) {
      setChat((prev) => [...prev, data]);
    }
  });

  return () => newSocket.disconnect(); // sayfa kapanınca socket bağlantısını kes
}, []);


  
  const handleSend = () => {
  if (message.trim() === "") return; // boş mesaj yok

  setChat((prev) => [...prev, { id: socket.id, text: message }]);

  socket.emit("sendMessage", message);
  setMessage("");
};


  return (
    <main className={styles.container}>
  <h1>Chat App</h1>

  <div className={styles.chatBox}>
    {chat.map((entry, i) => (
      <div
        key={i}
        className={
          entry.id === socket?.id
            ? styles.myMessage
            : styles.otherMessage
        }
      >
        <strong>{entry.id === socket?.id ? "Sen" : "Diğer"}:</strong> {entry.text}
      </div>
    ))}
  </div>

  <div className={styles.inputArea}>
    <input
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      className={styles.input}
      placeholder="Mesaj yaz..."
    />
    <button onClick={handleSend} className={styles.button}>
      Gönder
    </button>
  </div>
</main>

  );
}
