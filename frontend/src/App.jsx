import { useState } from 'react'
import './App.css'
import MapComponent from './components/MapComponent/Map'
import { BrowserRouter, Routes, Route, Link, Outlet, NavLink } from 'react-router-dom';
import Auth from './components/login/Auth'

const navLinkStyles = ({ isActive }) => ({
  color: isActive ? '#007bff' : '#333',
  textDecoration: isActive ? 'none' : 'underline',
  fontWeight: isActive ? 'bold' : 'normal',
  padding: '5px 10px'
});

function App() {
  console.log(document.cookie);
  return (
    <BrowserRouter>
      <nav>
        <NavLink style={navLinkStyles} to='/login'>LOGIN</NavLink>
        <NavLink style={navLinkStyles} to='/map'>MAP</NavLink>
      </nav>

      <Routes>
        <Route path="/login" element={<Auth />}/>
        <Route path="/register" element={<Auth />}/>
        <Route path="/map" element={<MapComponent />}/>
        <Route path="/" element={<MapComponent />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
