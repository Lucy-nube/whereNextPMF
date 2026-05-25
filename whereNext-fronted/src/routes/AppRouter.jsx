import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/login";
import PrivateRoute from "./PrivateRoute";

import Home from "../pages/Home";
import AppLayout from "../components/layout/layout";

import Trips from "../pages/trips";
import Explore from "../pages/Explore";
import Profile from "../pages/Profile";
import ChatsPage from "../pages/Chatspage";

export default function AppRouter() {
  return (
    <Routes>

      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* RUTAS PROTEGIDAS */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>

          <Route path="/" element={<Home />} />

          <Route path="/trips" element={<Trips />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile" element={<Profile />} />

          {/* CHAT */}
          <Route path="/chats" element={<Navigate to="/chats/1" replace />} />
          <Route path="/chats/:id" element={<ChatsPage />} />

        </Route>
      </Route>

    </Routes>
  );
}
