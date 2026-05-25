import { useNavigate } from "react-router-dom";
import "../../styles/explore.css";

export default function UserCard({ user }) {
  const navigate = useNavigate();

  return (
    <div
      className="user-card"
      onClick={() => navigate(`/apps.ausers/${user.id}`)}
      style={{ cursor: "pointer" }}
    >
      {/* AVATAR */}
      <img
        src={
          user.avatar
            ? (
                user.avatar.startsWith("http")
                  ? user.avatar
                  : `http://127.0.0.1:8000${user.avatar}`
              )
            : "/default-avatar.png"
        }
        alt="avatar"
        className="user-card-avatar"
      />

      {/* USERNAME */}
      <h3 className="user-card-name">
        {user.username}

        {/* BADGE VERIFICADO */}
        {user.is_verified && (
          <span className="verified-badge">✔</span>
        )}
      </h3>

      {/* BIO (opcional) */}
      {user.bio && <p className="user-card-bio">{user.bio}</p>}
    </div>
  );
}
