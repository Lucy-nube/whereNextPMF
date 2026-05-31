import "../../styles/layout.css";

function Footer() {
  return (
    <footer className="footer">
      <p>✈️ WhereNext - Planifica tus viajes</p>

      <small>
        © {new Date().getFullYear()} - Todos los derechos reservados
      </small>

      <small className="footer-brand">
        Built with ❤️ by Lucy Esther De León Corporán
      </small>
    </footer>
  );
}

export default Footer;