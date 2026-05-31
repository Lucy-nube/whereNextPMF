import "../../styles/layout.css";

import { Outlet } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

export default function AppLayout() {
  return (
    <div className="app-layout">
      {/* HEADER GLOBAL */}
      <Navbar />

      {/* CONTENIDO DINÁMICO */}
      <main className="app-content">
        <Outlet />
      </main>

      {/* FOOTER GLOBAL */}
      <Footer />
    </div>
  );
}