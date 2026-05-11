import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  const navigate = useNavigate();
  const { login: contextLogin } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3006/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await response.json();
      console.log('Login response:', data); // Debug log
      if (response.ok) {
        setLoginEmail('');
        setLoginPassword('');

        contextLogin(data.username);
        setTimeout(() => navigate('/map'), 100); // Small delay to ensure state updates
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3006/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: registerUsername, email: registerEmail, password: registerPassword, confirmPassword: registerConfirmPassword })
      });
      if (response.ok) {
        setRegisterUsername('');
        setRegisterEmail('');
        setRegisterPassword('');
        setRegisterConfirmPassword('');
      }
    } catch (error) {
      console.error('Register error:', error);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      {isLogin ? (
        <>
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }} />
            <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }} />
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p>
            Don't have an account? <button onClick={() => setIsLogin(false)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>Register</button>
          </p>
        </>
      ) : (
        <>
          <h1>Register</h1>
          <form onSubmit={handleRegister}>
            <input type="text" placeholder="Username" value={registerUsername} onChange={(e) => setRegisterUsername(e.target.value)} required style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }} />
            <input type="email" placeholder="Email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }} />
            <input type="password" placeholder="Password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }} />
            <input type="password" placeholder="Confirm Password" value={registerConfirmPassword} onChange={(e) => setRegisterConfirmPassword(e.target.value)} required style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }} />
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p>
            Already have an account? <button onClick={() => setIsLogin(true)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>Login</button>
          </p>
        </>
      )}
    </div>
  );
}

export default Auth;
