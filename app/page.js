"use client";

import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import styles from "./page.module.css";
import Message from "./components/Message";

const socket = io();

export default function Home() {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [chat, setChat] = useState([]);
  const [username, setUsername] = useState("");
  const [inputName, setInputName] = useState("");
  const [users, setUsers] = useState([]);
  const [theme, setTheme] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("theme") || "light"
      : "light"
  );

  const fileInputRef = useRef(null); // dosya yükleme 
  const chatRef = useRef(null); // sohbet ktusu referasnı

  useEffect(() => {
    const savedName = localStorage.getItem("username");
    if (savedName) {
      setUsername(savedName);
      socket.emit("join", savedName); // servera haber
    }
  }, []);

  useEffect(() => { // sohbet kutusunu kaydırmak
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chat]);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const fetchLinkPreview = async (url) => { // link önizlemesi yapıyor
    try {
      const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const extractFirstUrl = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
  };

  const handleSend = async () => {
    if (!message.trim() && !image) return; // boş mesaj ve resim yoksa gönderme

    let linkPreview = null;
    const url = extractFirstUrl(message); // mesajda link var mı
    if (url) { //önizleme varsa
      linkPreview = await fetchLinkPreview(url);
    }

    const data = {
      username,
      text: message,
      image,
      type: "user",
      linkPreview,
    };
    socket.emit("message", data);
    setChat((prev) => [...prev, { ...data, self: true }]); // kendi mesajı ekle
    setMessage("");
    setImage(null);
  };

  const handleJoin = () => { // kullanıcı ismini kaydeder
    if (!inputName.trim()) return;
    setUsername(inputName.trim());
    localStorage.setItem("username", inputName.trim());
    socket.emit("join", inputName.trim());
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  if (!username) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #1de9b6 0%, #1976d2 100%)"
      }}>
        <div style={{
          background: "rgba(255,255,255,0.12)",
          padding: 32,
          borderRadius: 16,
          boxShadow: "0 2px 16px rgba(30,136,229,0.08)",
          minWidth: 320,
          textAlign: "center"
        }}>
          <h2 style={{ marginBottom: 24, color: "#1976d2" }}>İsminizi girin</h2>
          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyDown={(e) => { if(e.key === "Enter") handleJoin(); }}
            placeholder="Kullanıcı adı"
            style={{
              padding: "10px 16px",
              fontSize: "1.1rem",
              marginBottom: "16px",
              width: "80%",
              border: "1px solid #1976d2",
              borderRadius: "8px"
            }}
            autoFocus
          />
          <br />
          <button
            onClick={handleJoin}
            disabled={!inputName.trim()}
            style={{
              marginTop: "8px",
              width: "80%",
              fontSize: "1.1rem"
            }}
          >
            Giriş
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Kullanıcı Listesi ve Tema Butonu */}
      <aside className={styles.userList}>
        <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
          <span className={styles.userListTitle}>Kullanıcılar</span>
          <button
            style={{
              padding: "4px 14px",
              fontSize: "0.95rem",
              borderRadius: "6px",
              background: theme === "dark"
                ? "linear-gradient(90deg, #232526 0%, #000000 100%)"
                : "linear-gradient(90deg, #1de9b6 0%, #1976d2 100%)",
              color: theme === "dark" ? "#e0e0e0" : "#fff",
              border: "none",
              marginLeft: "8px",
              cursor: "pointer"
            }}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Tema değiştir"
          >
            {theme === "light" ? "Dark" : "Light"}
          </button>
        </div>
        <ul style={{ listStyle: "none", padding: 0, width: "100%" }}>
          {users.map((user) => (
            <li
              key={user.id}
              className={
                user.username === username
                  ? `${styles.userItem} ${styles.active} userItem active`
                  : `${styles.userItem} userItem`
              }
            >
              {user.username}
            </li>
          ))}
        </ul>
      </aside>

      {/* Sohbet ve input */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          className={styles.chatBox}
          ref={chatRef}
        >
          {chat.map((entry, i) => (
            <Message
              key={i}
              entry={entry}
              isOwn={entry.username === username || entry.self}
            />
          ))}
        </div>

        <div className={styles.inputArea} style={{ display: "flex", alignItems: "center", padding: "10px" }}>
          <input
            type="text"
            placeholder="Mesajınızı yazın"
            value={message}
            maxLength={1000}
            onChange={(e) => setMessage(e.target.value)}
            style={{ flex: 1, padding: "8px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <div style={{ marginLeft: "10px", fontSize: "0.8rem", color: "#555" }}>
            {1000 - message.length} karakter kaldı
          </div>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
            accept="image/*"
          />
          <button
            style={{ marginLeft: "10px" }}
            onClick={() => fileInputRef.current?.click()}
          >
            Dosya Ekle
          </button>
          <button
            style={{ marginLeft: "10px" }}
            onClick={handleSend}
            disabled={!message.trim() && !image}
          >
            Gönder
          </button>
        </div>
      </main>
    </div>
  );
}

