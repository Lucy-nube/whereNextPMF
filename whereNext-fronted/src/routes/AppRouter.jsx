import { Routes, Route } from "react-router-dom";

import Login from "../pages/login";
import Register from "../pages/Register";
import Landing from "../pages/Landing";

import PrivateRoute from "./PrivateRoute";

import Home from "../pages/Home";
import AppLayout from "../components/layout/layout";

import Trips from "../pages/trips";
import TripCreate from "../pages/tripsCreate";
import TripDetail from "../pages/TripDetails";
import Explore from "../pages/Explore";
import Profile from "../pages/Profile";
import ChatsPage from "../pages/Chatspage";
import PlaceDetails from "../pages/PlaceDetails";
import Favorites from "../pages/favorites";
import EditProfile from "../pages/EditProfile";
import Invites from "../pages/Invites";
import CompanionsHub from "../pages/CompanionsHub"; 

export default function AppRouter() {
  return (
    <Routes>

      {/* 🌍 PUBLIC ROUTES */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 🌍 PUBLIC EXPLORE */}
      <Route element={<AppLayout />}>
        <Route path="/explore" element={<Explore />} />
        <Route path="/places/:id" element={<PlaceDetails />} />
        <Route path="/favorites" element={<Favorites />} />
      </Route>

      {/* 🔐 PROTECTED ROUTES */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}> 

          {/* HOME (solo para usuarios logueados) */}
          <Route path="/home" element={<Home />} />

          {/* TRIPS */}
          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/create" element={<TripCreate />} />
          <Route path="/trips/:id" element={<TripDetail />} />

          {/* PROFILE */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/users/:id" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />

          {/* COMPANIONS HUB */}
          <Route path="/companions-hub" element={<CompanionsHub />} />

          {/* CHATS */}
          <Route path="/chats/:id?" element={<ChatsPage />} />

          <Route path="/trip-invites" element={<Invites />} />

        </Route>
      </Route>

    </Routes>
  );
}
