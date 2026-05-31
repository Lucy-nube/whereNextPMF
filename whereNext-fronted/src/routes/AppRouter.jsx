import { Routes, Route } from "react-router-dom";

import Login from "../pages/login";
import Register from "../pages/Register";

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
import EditProfile from "../pages/EditProfile";
import Invites from "../pages/Invites";


import CompanionsHub from "../pages/CompanionsHub"; 

export default function AppRouter() {
  return (
    <Routes>

      {/* 🌍 PUBLIC ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 🔐 PROTECTED ROUTES */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}> 

          {/* HOME */}
          <Route path="/" element={<Home />} />

          {/* TRIPS */}
          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/create" element={<TripCreate />} />
          <Route path="/trips/:id" element={<TripDetail />} />

          {/* EXPLORE */}
          <Route path="/explore" element={<Explore />} />
          <Route path="/places/:id" element={<PlaceDetails />} />

          {/* PROFILE */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/users/:id" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />

          {/* COMPANIONS HUB */}
          <Route path="/companions-hub" element={<CompanionsHub />} />

          {/* CHATS */}
          <Route path="/chats/:id?" element={<ChatsPage />} />

          <Route path="/invites" element={<Invites />} />


        </Route>
      </Route>

    </Routes>
  );
}