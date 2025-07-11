"use client";

import { useState, useEffect } from "react";
import io from "socket.io-client";
import styles from "./page.module.css";
import Message from "./components/Message";

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [name, setName] = useState("");
  const [showNamePopup, setShowNamePopup] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Socket bağlantısını aç, mesaj dinle
  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on("receiveMessage", (data) => {
      if (data.id !== newSocket.id) {
        setChat((prev) => [...prev, data]);
      }
    });

    return () => newSocket.disconnect();
  }, []);

  // Dark mode durumuna göre body'ye attribute ekle/kaldır
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [darkMode]);

  const handleSend = () => {
    if (!name) {
      alert("Lütfen adınızı giriniz.");
      return;
    }
    if (message.trim() === "") return;

    setChat((prev) => [...prev, { id: socket.id, text: { message, name } }]);

    socket.emit("sendMessage", { message, name });
    setMessage("");
  };

  const handleNameSubmit = () => {
    if (name.trim() === "") {
      alert("Lütfen geçerli bir isim giriniz.");
      return;
    }
    setShowNamePopup(false);
  };

  return (
    <main className={styles.container}>
      <h1>Chat App</h1>

      {/* Dark mode toggle butonu */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={styles.button}
        style={{ marginBottom: "1rem" }}
      >
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>

      {showNamePopup && (
        <div className={styles.namePopup}>
          <h2>Hoşgeldiniz!</h2>
          <input
            type="text"
            placeholder="İsminizi girin"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={handleNameSubmit}>Başla</button>
        </div>
      )}

      {!showNamePopup && (
        <>
          <div className={styles.chatBox}>
            {chat.map((entry, i) => (
              <Message
                key={i}
                name={entry.id === socket?.id ? "Sen" : entry.text.name}
                message={entry.text.message}
                isMine={entry.id === socket?.id}
              />
            ))}
          </div>

          <div className={styles.inputArea}>
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
        </>
      )}
    </main>
  );
}
