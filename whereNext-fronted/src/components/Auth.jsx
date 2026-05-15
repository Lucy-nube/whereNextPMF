import { useEffect, useState } from "react";

function Auth({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const images = [
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
    "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1",
    "https://images.unsplash.com/photo-1505761671935-60b3a7427bad",
    "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba",
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21",
    "https://images.unsplash.com/photo-1526772662000-3f88f10405ff",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef",
    "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2",
  ];

  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // 🚀 carrusel CORRECTO
useEffect(() => {
  const interval = setInterval(() => {
    setFade(false);

    setTimeout(() => {
      setIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % images.length;

        setPrevIndex(prevIndex);

        setFade(true);

        return nextIndex;
      });
    }, 4000);
  }, 5000);

  return () => clearInterval(interval);
 }, []);

  const handleSubmit = () => {
    const endpoint = isLogin ? "login" : "register";

    fetch(`http://127.0.0.1:8000/api/${endpoint}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("AUTH RESPONSE:", data);

        if (data.token) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
        } else {
          alert("Error de login");
        }
      });
  };

  return (
    <div className="auth-background">

      <div
        className="auth-bg-image"
        style={{
          backgroundImage: `url(${images[prevIndex]})`,
          opacity: fade ? 0 : 1,
        }}
      />

      <div
        className="auth-bg-image"
        style={{
          backgroundImage: `url(${images[index]})`,
          opacity: fade ? 1 : 0,
        }}
      />

      <div className="auth-overlay" />

      <div className="auth-container">

        <h2>{isLogin ? "Login" : "Register"}</h2>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleSubmit}>
          {isLogin ? "Login" : "Register"}
        </button>

        <p onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Crear cuenta" : "Ya tengo cuenta"}
        </p>

      </div>

    </div>
  );
}

export default Auth;