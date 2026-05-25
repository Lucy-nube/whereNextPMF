import { useEffect, useRef, useState } from "react";

export function useChat(roomName) {
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!roomName) return;

    const token = localStorage.getItem("access");

    const socket = new WebSocket(
      `ws://localhost:8000/ws/chat/${roomName}/?token=${token}`
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket conectado");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      } catch (err) {
        console.error("Error parseando mensaje WS:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
    };

    socket.onclose = () => {
      console.log("🔌 WebSocket desconectado");
    };

    return () => socket.close();
  }, [roomName]);

  const sendMessage = (message, userId) => {
    if (!message?.trim()) return;

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("❌ Socket no conectado");
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        message,
        sender: userId,
      })
    );
  };

  return { messages, sendMessage };
}
