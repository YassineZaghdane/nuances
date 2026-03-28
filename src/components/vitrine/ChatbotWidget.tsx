/**
 * @module ChatbotWidget
 * @description Widget chatbot flottant — conseiller parfum IA
 */
"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const MESSAGE_INITIAL: Message = {
  role: "assistant",
  content:
    "Bonjour ! Je suis Nour, votre conseillère parfum ✿\n\nJe suis là pour vous aider à trouver votre fragrance idéale. Cherchez-vous un parfum pour vous-même ou souhaitez-vous offrir un cadeau ?",
  timestamp: new Date(),
};

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([MESSAGE_INITIAL]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const historyForApi =
        messages[0]?.role === "assistant" ? messages.slice(1) : messages;
      const apiMessages = [...historyForApi, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              data.error ||
              "Je n'ai pas pu répondre pour le moment. Réessayez plus tard.",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message || "Je n'ai pas pu répondre. Réessayez.",
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Une erreur est survenue. Veuillez réessayer.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([MESSAGE_INITIAL]);
    setInput("");
  };

  return (
    <>
      <style>{`
        @keyframes chatPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(196,150,10,0.4); }
          50%       { box-shadow: 0 0 0 12px rgba(196,150,10,0); }
        }
        @keyframes chatSlide {
          from { opacity:0; transform:translateY(20px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes dotBounce {
          0%,80%,100% { transform:translateY(0); }
          40%         { transform:translateY(-6px); }
        }
        .chat-dot-1 { animation:dotBounce 1.2s infinite 0s; }
        .chat-dot-2 { animation:dotBounce 1.2s infinite 0.2s; }
        .chat-dot-3 { animation:dotBounce 1.2s infinite 0.4s; }
      `}</style>

      <div
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 1000,
        }}
      >
        {!open && (
          <div
            style={{
              position: "absolute",
              bottom: "70px",
              right: 0,
              background: "white",
              border: "1px solid rgba(196,150,10,0.2)",
              padding: "0.7rem 1rem",
              fontSize: "0.78rem",
              color: "#1A1208",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 20px rgba(26,18,8,0.1)",
              fontFamily: "Jost,sans-serif",
            }}
          >
            ✿ Besoin d&apos;un conseil parfum ?
            <div
              style={{
                position: "absolute",
                bottom: "-6px",
                right: "20px",
                width: "10px",
                height: "10px",
                background: "white",
                border: "1px solid rgba(196,150,10,0.2)",
                borderTop: "none",
                borderLeft: "none",
                transform: "rotate(45deg)",
              }}
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: open
              ? "#1A1208"
              : "linear-gradient(135deg,#C4960A,#A07808)",
            border: "none",
            cursor: "pointer",
            fontSize: "1.4rem",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: open
              ? "0 4px 20px rgba(26,18,8,0.3)"
              : "0 4px 20px rgba(196,150,10,0.4)",
            animation: pulse && !open ? "chatPulse 2s infinite" : "none",
            transition: "all 0.3s",
          }}
        >
          {open ? "×" : "✿"}
        </button>
      </div>

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "6rem",
            right: "2rem",
            width: "360px",
            height: "500px",
            background: "white",
            border: "1px solid rgba(196,150,10,0.2)",
            boxShadow: "0 20px 60px rgba(26,18,8,0.15)",
            display: "flex",
            flexDirection: "column",
            zIndex: 999,
            animation: "chatSlide 0.3s ease",
            fontFamily: "Jost,sans-serif",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg,#1A1208,#2C1E10)",
              padding: "1rem 1.2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg,#C4960A,#A07808)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                flexShrink: 0,
              }}
            >
              ✿
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: "white",
                  letterSpacing: "0.04em",
                }}
              >
                Nour
              </div>
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "#C4960A",
                  letterSpacing: "0.08em",
                }}
              >
                Conseillère parfum IA
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              title="Nouvelle conversation"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                cursor: "pointer",
                fontSize: "0.7rem",
                color: "rgba(255,255,255,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ↺
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
              background: "#FDFAF5",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                {msg.role === "assistant" && (
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#C4960A,#A07808)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6rem",
                      color: "white",
                      flexShrink: 0,
                      marginRight: "0.5rem",
                      marginTop: "2px",
                    }}
                  >
                    ✿
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "0.65rem 0.9rem",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg,#C4960A,#A07808)"
                        : "white",
                    color: msg.role === "user" ? "white" : "#1A1208",
                    fontSize: "0.8rem",
                    lineHeight: 1.6,
                    border:
                      msg.role === "assistant"
                        ? "1px solid rgba(196,150,10,0.12)"
                        : "none",
                    boxShadow: "0 1px 4px rgba(26,18,8,0.06)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#C4960A,#A07808)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.6rem",
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  ✿
                </div>
                <div
                  style={{
                    padding: "0.65rem 0.9rem",
                    background: "white",
                    border: "1px solid rgba(196,150,10,0.12)",
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                  }}
                >
                  <div
                    className="chat-dot-1"
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#C4960A",
                    }}
                  />
                  <div
                    className="chat-dot-2"
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#C4960A",
                    }}
                  />
                  <div
                    className="chat-dot-3"
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#C4960A",
                    }}
                  />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div
            style={{
              padding: "0.8rem",
              borderTop: "1px solid rgba(196,150,10,0.12)",
              background: "white",
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Décrivez vos préférences..."
              disabled={loading}
              style={{
                flex: 1,
                padding: "0.6rem 0.8rem",
                border: "1px solid rgba(196,150,10,0.2)",
                background: "#FDFAF5",
                fontSize: "0.8rem",
                color: "#1A1208",
                outline: "none",
                fontFamily: "Jost,sans-serif",
              }}
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                padding: "0.6rem 0.9rem",
                background:
                  loading || !input.trim()
                    ? "#C4B090"
                    : "linear-gradient(135deg,#C4960A,#A07808)",
                color: "white",
                border: "none",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontSize: "0.9rem",
                transition: "all 0.2s",
              }}
            >
              →
            </button>
          </div>

          <div
            style={{
              padding: "0.4rem",
              background: "#FAF7F2",
              textAlign: "center",
              fontSize: "0.58rem",
              color: "#C4B090",
              borderTop: "1px solid rgba(196,150,10,0.08)",
            }}
          >
            Conseils personnalisés par IA · Nuances Parfums
          </div>
        </div>
      )}
    </>
  );
}
