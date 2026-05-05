import { useState } from "react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I can help you find products." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();

      setMessages(prev => [...prev, { sender: "bot", text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { sender: "bot", text: "Error. Try again." }]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", bottom: 20, right: 20,
          width: 56, height: 56, borderRadius: "50%",
          border: "none", cursor: "pointer"
        }}
        title="Chat"
      >
        💬
      </button>

      {/* Chat Box */}
      {open && (
        <div style={{
          position: "fixed", bottom: 90, right: 20,
          width: 320, height: 420, background: "#fff",
          border: "1px solid #ddd", borderRadius: 10,
          display: "flex", flexDirection: "column"
        }}>
          <div style={{ padding: 10, borderBottom: "1px solid #eee" }}>
            <b>SmartShop Assistant</b>
          </div>

          <div style={{ flex: 1, padding: 10, overflowY: "auto" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ textAlign: m.sender === "user" ? "right" : "left", marginBottom: 8 }}>
                <span style={{
                  display: "inline-block",
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: m.sender === "user" ? "#e6f3ff" : "#f1f1f1"
                }}>
                  {m.text}
                </span>
              </div>
            ))}
            {loading && <div>Typing...</div>}
          </div>

          <div style={{ display: "flex", borderTop: "1px solid #eee" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask for products..."
              style={{ flex: 1, padding: 10, border: "none", outline: "none" }}
            />
            <button onClick={sendMessage} style={{ padding: "0 12px" }}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}