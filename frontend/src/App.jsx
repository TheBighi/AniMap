import { useState, useContext } from 'react'
import './App.css'
import MapComponent from './components/MapComponent/Map'
import UserComponent from './components/UserComponent/User'
import StatsComponent from './components/StatsComponent/Stats'
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import Auth from './components/login/Auth'
import { AuthContext } from './context/AuthContext'

const navLinkStyles = ({ isActive }) => ({
  color: isActive ? '#007bff' : '#333',
  textDecoration: isActive ? 'none' : 'underline',
  fontWeight: isActive ? 'bold' : 'normal',
  padding: '5px 10px'
});

function NavBar() {
  const { isLoggedIn, logout, username } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav>
      {!isLoggedIn && <NavLink style={navLinkStyles} to='/login'>sign in</NavLink>}
      <NavLink style={navLinkStyles} to='/map'>MAP</NavLink>
      {isLoggedIn && (
        <>
          <NavLink style={navLinkStyles} to='/user'>Account</NavLink>
          <NavLink style={navLinkStyles} to='/stats'>Stats</NavLink>
        </>
      )}
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/login" element={<Auth />}/>
        <Route path="/register" element={<Auth />}/>
        <Route path="/map" element={<MapComponent />}/>
        <Route path="/" element={<MapComponent />}/>
        <Route path="/user" element={<UserComponent/>}/>
        <Route path="/stats" element={<StatsComponent/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
