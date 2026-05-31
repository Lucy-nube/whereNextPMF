import "../../styles/invites.css";

export default function CompanionsModal({ friends, onSelect, onClose }) {
  return (
    <div className="td-modal-overlay" onClick={onClose}>
      <div className="td-modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>Selecciona compañeros</h3>

        {friends.length === 0 ? (
          <p>No tienes compañeros aún.</p>
        ) : (
          <div className="companions-list">
            {friends.map((f) => (
              <div
                key={f.id}
                className="companion-item"
                onClick={() => onSelect(f)}
              >
                @{f.username}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
