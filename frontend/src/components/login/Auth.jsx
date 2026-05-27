import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Auth.css";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  const navigate = useNavigate();
  const { login: contextLogin } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3006/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setLoginEmail("");
        setLoginPassword("");

        contextLogin(data.username);
        setTimeout(() => navigate("/map"), 100);
      }
    } catch (error) {
      console.error("Login error:", error);
    }

    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3006/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: registerUsername,
          email: registerEmail,
          password: registerPassword,
          confirmPassword: registerConfirmPassword,
        }),
      });

      if (response.ok) {
        setRegisterUsername("");
        setRegisterEmail("");
        setRegisterPassword("");
        setRegisterConfirmPassword("");
        setIsLogin(true);
      }
    } catch (error) {
      console.error("Register error:", error);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      {isLogin ? (
        <>
          <h1 className="auth-title">Login</h1>

          <form onSubmit={handleLogin}>
            <input
              className="auth-input"
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />

            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="auth-button login"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <button className="auth-link-btn" onClick={() => setIsLogin(false)}>
              Register
            </button>
          </p>
        </>
      ) : (
        <>
          <h1 className="auth-title">Register</h1>

          <form onSubmit={handleRegister}>
            <input
              className="auth-input"
              placeholder="Username"
              value={registerUsername}
              onChange={(e) => setRegisterUsername(e.target.value)}
              required
            />
            <input
              className="auth-input"
              placeholder="Email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              required
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              required
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Confirm password"
              value={registerConfirmPassword}
              onChange={(e) => setRegisterConfirmPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="auth-button register"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <button className="auth-link-btn" onClick={() => setIsLogin(true)}>
              Login
            </button>
          </p>
        </>
      )}
    </div>
  );
}

export default Auth;