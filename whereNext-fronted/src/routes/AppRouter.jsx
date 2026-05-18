import { Routes, Route } from "react-router-dom";

import Login from "../components/layout/login";
import PrivateRoute from "./PrivateRoute";

import Home from "../components/layout/Home";
import AppLayout from "../components/layout/layout";

import Trips from "../components/layout/Trips";
import Explore from "../pages/Explore";
import Profile from "../pages/Profile";

export default function AppRouter() {
  return (
    <Routes>

      {/* LOGIN */}
      <Route path="/login" element={<Login />} />
      
      <Route path="/profile" element={<Profile />} />

      {/* RUTAS PROTEGIDAS */}
      <Route element={<PrivateRoute />}>

        <Route element={<AppLayout />}>

          <Route path="/" element={<Home />} />

          {/* NUEVAS RUTAS */}
          <Route path="/viajes" element={<Trips />} />
          <Route path="/explorar" element={<Explore />} />

        </Route>

      </Route>

    </Routes>
  );
}