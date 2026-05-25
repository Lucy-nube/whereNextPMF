import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import "../styles/chats.css";

export default function ChatPage() {
  const { id: roomId } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // =========================
  // CARGAR MENSAJES ANTIGUOS
  // =========================
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const token = localStorage.getItem("access");

        const res = await API.get(`/chats/${roomId}/messages/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMessages(res.data || []);
      } catch (err) {
        console.error("Error cargando mensajes:", err);
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      loadMessages();
    }
  }, [roomId]);

  // =========================
  // WEBSOCKET
  // =========================
  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem("access");

    socketRef.current = new WebSocket(
      `ws://localhost:8000/ws/chat/${roomId}/?token=${token}`
    );

    socketRef.current.onopen = () => {
      console.log("✅ WebSocket conectado");
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    socketRef.current.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
    };

    socketRef.current.onclose = () => {
      console.log("🔌 WebSocket desconectado");
    };

    return () => {
      socketRef.current?.close();
    };
  }, [roomId]);

  // =========================
  // AUTO SCROLL
  // =========================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // =========================
  // ENVIAR MENSAJE
  // =========================
  const sendMessage = () => {
    if (!text.trim()) return;

    if (
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN
    ) {
      socketRef.current.send(
        JSON.stringify({
          message: text,
        })
      );

      setText("");
    }
  };

  // =========================
  // ENTER PARA ENVIAR
  // =========================
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="chat-loading">
        ⏳ Cargando conversación...
      </div>
    );
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="chat-page">
      <div className="chat-header">
        <h2>💬 Conversación</h2>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="chat-empty">No hay mensajes todavía.</p>
        ) : (
          messages.map((msg, index) => (
            <div key={msg.id || index} className="chat-message">
              <div className="chat-bubble">
                <strong>@{msg.user || msg.username || "Usuario"}</strong>
                <p>{msg.message || msg.content}</p>
              </div>
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          className="chat-input"
        />

        <button onClick={sendMessage} className="chat-send-btn">
          Enviar
        </button>
      </div>
    </div>
  );
}
