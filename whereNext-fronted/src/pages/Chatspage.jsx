import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/chats.css";

export default function ChatPage() {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [chatRooms, setChatRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [receiverId, setReceiverId] = useState(null);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // =========================================================
  // 1. CARGAR LISTA DE CHATS
  // =========================================================
  useEffect(() => {
    const loadChatRoomsList = async () => {
      try {
        const res = await API.get("chats/");
        const rooms = res.data || [];
        setChatRooms(rooms);

        // Detectar receptor REAL
        const activeRoom = chatRooms.find(r => String(r.room) === String(roomId));


        if (activeRoom) {
          setReceiverId(activeRoom.friend.id);
        }
      } catch (err) {
        console.error("Error cargando la lista de conversaciones:", err);
      } finally {
        setLoadingRooms(false);
      }
    };

    loadChatRoomsList();
  }, [roomId]);

  // =========================================================
  // 2. CARGAR HISTORIAL DE MENSAJES
  // =========================================================
  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    const loadMessagesHistory = async () => {
      setLoadingMessages(true);
      try {
        const token = localStorage.getItem("access");
        const res = await API.get(`chats/${roomId}/messages/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data || []);
      } catch (err) {
        console.error("Error cargando mensajes antiguos:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessagesHistory();
  }, [roomId]);

  // =========================================================
  // 3. WEBSOCKET ESTABLE
  // =========================================================
  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem("access");

    // Cerrar socket previo si existe
    if (socketRef.current) {
      socketRef.current.close();
    }

    const wsUrl = `ws://localhost:8000/ws/chat/${roomId}/?token=${token}`;
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log(`✅ Conectado a la sala: ${roomId}`);
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      const normalizedMsg = {
        id: data.id,
        username: data.sender_username,
        user_id: data.sender_id,
        message: data.message,
        timestamp: data.timestamp,
      };

      setMessages((prev) => [...prev, normalizedMsg]);
    };

    socketRef.current.onclose = () => {
      console.log(`🔌 WebSocket cerrado para sala ${roomId}`);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [roomId]);

  // =========================================================
  // AUTO SCROLL
  // =========================================================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =========================================================
  // ENVÍO DE MENSAJES
  // =========================================================
  const sendMessage = () => {
    console.log("🔥 sendMessage ejecutado", { text, receiverId });
    console.log("🔌 Estado socket:", socketRef.current?.readyState);

    if (!text.trim() || !socketRef.current || !receiverId) return;

    if (socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          message: text,
          receiver: receiverId,
        })
      );
      setText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const getMediaUrl = (path, fallback = "/default-avatar.png") => {
    if (!path) return fallback;
    if (path.startsWith("http")) return path;
    return `http://127.0.0.1:8000${path}`;
  };

  // =========================================================
  // RENDER
  // =========================================================
  if (loadingRooms) {
    return (
      <div className="chat-loading">
        <p>⏳ Sincronizando tu buzón de mensajes...</p>
      </div>
    );
  }

  return (
    <div className="chat-page chat-layout-workspace">
      {/* =========================================================
         COLUMNA IZQUIERDA
         ========================================================= */}
      <div className="chat-sidebar-rooms">
        <div className="sidebar-rooms-header">
          <h3>Tus Mensajes</h3>
        </div>

        <div className="rooms-list-container">
          {chatRooms.length === 0 ? (
            <p className="chat-empty-sidebar-msg">
              Aún no tienes conversaciones abiertas.
            </p>
          ) : (
            chatRooms.map((roomItem) => {
              const friendData = roomItem.friend || {};
              const isSelected = String(roomId) === String(roomItem.room);

              return (
                <div
                  key={roomItem.room}
                  className={`room-item-row ${
                    isSelected ? "room-item-row--active" : ""
                  }`}
                  onClick={() => navigate(`/chats/${roomItem.room}`)}
                >
                  <img
                    src={getMediaUrl(friendData.avatar)}
                    alt="Avatar"
                    className="room-item-avatar"
                  />
                  <div className="room-item-meta">
                    <strong>@{friendData.username}</strong>
                    <p className="room-item-last-txt">
                      {roomItem.last_message || "Sin mensajes aún."}
                    </p>
                  </div>
                  {roomItem.unread && <span className="room-item-unread-dot" />}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* =========================================================
         COLUMNA DERECHA
         ========================================================= */}
      <div className="chat-main-conversation-panel">
        {!roomId ? (
          <div className="chat-unselected-state-view">
            <div className="unselected-icon-capsule">💬</div>
            <h2>Selecciona una conversación</h2>
          </div>
        ) : loadingMessages ? (
          <div className="chat-loading">
            <p>⏳ Recuperando historial...</p>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <h2>🗣️ Sala de Chat</h2>
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <p className="chat-empty">
                  No hay mensajes todavía. ¡Escribe algo!
                </p>
              ) : (
                messages.map((msg, index) => {
                  const isMe =
                    currentUser?.id === msg.user_id ||
                    currentUser?.username === msg.username;

                  return (
                    <div
                      key={msg.id || index}
                      className={`chat-message ${
                        isMe ? "chat-message--me" : "chat-message--them"
                      }`}
                    >
                      <div className="chat-bubble">
                        <strong>@{msg.username}</strong>
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  );
                })
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
          </>
        )}
      </div>
    </div>
  );
}
