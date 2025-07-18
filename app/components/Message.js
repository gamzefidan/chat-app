import React from "react";
import styles from "./message.module.css";

const urlRegex = /(https?:\/\/[^\s]+)/g;

function renderTextWithLinks(text) {
  return text.split(urlRegex).map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#1976d2", textDecoration: "underline" }}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

export default function Message({ entry, isOwn }) {
  if (entry.type === "system") {
    return <div className={styles.system}>{entry.text}</div>;
  }

  const messageClass = isOwn ? styles.own : styles.other;

  return (
    <div className={`${styles.message} ${messageClass}`} style={{ marginBottom: 12, textAlign: isOwn ? "right" : "left" }}>
      {entry.image && (
        <div>
          <img src={entry.image} alt="Gönderilen görsel" style={{ maxWidth: "100%", borderRadius: "8px" }} />
        </div>
      )}
      <div>{renderTextWithLinks(entry.text)}</div>
      {entry.linkPreview && (
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 6,
            padding: 8,
            marginTop: 6,
            background: "#fafcff",
            maxWidth: 400,
            textAlign: "left",
            display: "inline-block",
          }}
        >
          {entry.linkPreview.image && (
            <img
              src={entry.linkPreview.image}
              alt=""
              style={{ width: "100%", maxHeight: 120, objectFit: "cover", borderRadius: 4, marginBottom: 6 }}
            />
          )}
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>
            {entry.linkPreview.title}
          </div>
          <div style={{ color: "#555", fontSize: "0.95em" }}>
            {entry.linkPreview.description}
          </div>
        </div>
      )}
    </div>
  );
}
