export interface NavbarParams {
  onSave: () => void;
  onLoad: () => void;
}

function Navbar({ onSave, onLoad }: NavbarParams) {
  return (
    <nav
      className="navbar is-light"
      role="navigation"
      aria-label="dropdown navigation"
    >
      <div className="navbar-item has-dropdown is-hoverable">
        <a className="navbar-link">Konfigurationen</a>

        <div className="navbar-dropdown">
          <a className="navbar-item" onClick={onLoad}>
            Laden
          </a>
          <a className="navbar-item" onClick={onSave}>
            Speichern
          </a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
