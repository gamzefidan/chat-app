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
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Socket bağlantısını aç, mesaj dinle
  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on("users", (userList) => {
      setUsers(userList);
    });

    newSocket.on("receiveMessage", (data) => {
      // Eğer özel mesaj ise, sadece kendimizeyse ekle
      if (data.to && data.to !== newSocket.id) return;

      setChat((prev) => [...prev, data]);
    });

    return () => newSocket.disconnect();
  }, []);

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

    if (message.length > 1000) {
      alert("Mesaj en fazla 1000 karakter olabilir.");
      return;
    }

    const msgObj = { id: socket.id, text: { message, name } };
    setChat((prev) => [...prev, msgObj]);

    socket.emit("sendMessage", { message, name });
    setMessage("");
  };

  const handleNameSubmit = () => {
    if (name.trim() === "") {
      alert("Lütfen geçerli bir isim giriniz.");
      return;
    }

    // İsmi server'a gönder
    socket.emit("join", name);

    setShowNamePopup(false);
  };

  return (
    <main className={styles.container}>
      <h1>Chat App</h1>

      {/* Dark mode toggle */}
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
        <div className={styles.mainContent}>
          {/* Kullanıcı listesi */}
          <aside className={styles.userList}>
            <h3>Kullanıcılar</h3>
            <ul>
              {users
                .filter((user) => user.id !== socket.id)
                .map((user) => (
                  <li
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={selectedUser?.id === user.id ? styles.activeUser : ""}
                  >
                    {user.name}
                  </li>
                ))}
            </ul>
          </aside>

          {/* Chat bölümü */}
          <section className={styles.chatSection}>
            <div className={styles.chatBox}>
              {chat.map((entry, i) => {
                const isMine = entry.id === socket?.id;
                const displayName = isMine
                  ? "Sen"
                  : entry.text && entry.text.name
                  ? entry.text.name
                  : "Anonim";
                const displayMessage =
                  typeof entry.text === "string"
                    ? entry.text
                    : entry.text && entry.text.message
                    ? entry.text.message
                    : "";

                return (
                  <Message
                    key={i}
                    name={displayName}
                    message={displayMessage}
                    isMine={isMine}
                  />
                );
              })}
            </div>

            <div className={styles.inputArea}>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
                onKeyDown={(e) => {
                  if (e.keyCode === 13) {
                    handleSend();
                  }
                }}
                className={styles.input}
                placeholder="Mesaj yaz..."
              />
              <div className={styles.charCount}>
                {1000 - message.length} karakter kaldı
              </div>
              <button onClick={handleSend} className={styles.button}>
                Gönder
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
