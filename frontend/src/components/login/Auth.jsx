import { useState } from 'react';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:3006/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('✓ Login successful!');
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setMessage('✗ ' + (data.message || 'Login failed'));
      }
    } catch (error) {
      setMessage('✗ Error: ' + error.message);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:3006/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: registerUsername, email: registerEmail, password: registerPassword, confirmPassword: registerConfirmPassword })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('✓ Registration successful!');
        setRegisterUsername('');
        setRegisterEmail('');
        setRegisterPassword('');
        setRegisterConfirmPassword('');
      } else {
        setMessage('✗ ' + (data.message || 'Registration failed'));
      }
    } catch (error) {
      setMessage('✗ Error: ' + error.message);
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
          {message && <p style={{ marginTop: '10px', padding: '8px', backgroundColor: message.includes('✓') ? '#d4edda' : '#f8d7da', color: message.includes('✓') ? '#155724' : '#721c24', borderRadius: '4px' }}>{message}</p>}
          <p>
            Don't have an account? <button onClick={() => { setIsLogin(false); setMessage(''); }} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>Register</button>
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
          {message && <p style={{ marginTop: '10px', padding: '8px', backgroundColor: message.includes('✓') ? '#d4edda' : '#f8d7da', color: message.includes('✓') ? '#155724' : '#721c24', borderRadius: '4px' }}>{message}</p>}
          <p>
            Already have an account? <button onClick={() => { setIsLogin(true); setMessage(''); }} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>Login</button>
          </p>
        </>
      )}
    </div>
  );
}

export default Auth;
