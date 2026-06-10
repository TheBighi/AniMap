import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./Header.css";

function Header() {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
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

        {isLoggedIn && (
          <NavLink
            to="/user"
            className={({ isActive }) => (isActive ? "activeNav" : "")}
          >
            Account
          </NavLink>
        )}
        {!isLoggedIn && (
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? "activeNav" : "")}
          >
            Login
          </NavLink>
        )}
      </nav>
    </header>
  );
}

export default Header;
