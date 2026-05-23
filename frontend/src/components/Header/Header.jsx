import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./Header.css";

function Header() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <nav className="nav">
        <NavLink
          to="/map"
          className={({ isActive }) => (isActive ? "activeNav" : "")}
        >
          Map
        </NavLink>

        <NavLink
          to="/stats"
          className={({ isActive }) => (isActive ? "activeNav" : "")}
        >
          Statistics
        </NavLink>

        <NavLink
          to="/user"
          className={({ isActive }) => (isActive ? "activeNav" : "")}
        >
          Account
        </NavLink>
      </nav>
    </header>
  );
}

export default Header;
