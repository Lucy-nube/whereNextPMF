import { useEffect, useState } from "react";
import { getMe } from "../services/authService";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getMe().then((res) => setUser(res.data));
  }, []);

  return (
    <div>
      <h1>Perfil</h1>

      {user ? (
        <>
          <p>Usuario: {user.username}</p>
          <p>Email: {user.email}</p>
        </>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
}