"use client";

import { useState, useEffect } from "react";
import io from "socket.io-client";
import styles from "./page.module.css";

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [name, setName] = useState("Isim giriniz.");

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on("receiveMessage", (data) => {
      // gelen mesaş kendi mesajımız değilse chat ekle

      if (data.id !== newSocket.id) {
        setChat((prev) => [...prev, data]);
      }
    });

    return () => newSocket.disconnect(); // sayfa kapanınca socket bağlantısını kes
  }, []);

  const handleSend = () => {
    if (message.trim() === "") return; // boş mesaj yok

    setChat((prev) => [...prev, { id: socket.id, text: { message, name } }]);

    socket.emit("sendMessage", { message, name });
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
              entry.id === socket?.id ? styles.myMessage : styles.otherMessage
            }
          >
            <strong>
              {entry.id === socket?.id ? "Sen" : entry.text.name}:
            </strong>{" "}
            {entry.text.message}
          </div>
        ))}
      </div>

      <div className={styles.inputArea}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ minWidth: 80, maxWidth: 80 }}
          placeholder="Adiniz"
        />
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.keyCode === 13) {
              handleSend();
            }
          }}
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
