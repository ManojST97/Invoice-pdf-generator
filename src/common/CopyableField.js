import { useState } from "react";

export const CopyableField = ({ label, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };
  
  return (
    <li style={{ marginBottom: "8px", display: "flex", alignItems: "center" }}>
      <strong style={{ width: "150px" }}>{label}</strong>
      <code style={{ marginRight: "10px" }}>{value}</code>
      <button
        onClick={handleCopy}
        title="Copy"
        style={{
          cursor: "pointer",
          border: "none",
          background: copied ? "#28a745" : "#eee",
          color: copied ? "#fff" : "#000",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          transition: "background 0.3s",
        }}
      >
        {copied ? "✓ Copied" : "📋 Copy"}
      </button>
    </li>
  );
};
