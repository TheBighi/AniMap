import { useState, useContext } from "react";
import "./App.css";
import MapComponent from "./components/MapComponent/Map";
import UserComponent from "./components/UserComponent/User";
import StatsComponent from "./components/StatsComponent/Stats";
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import Auth from "./components/login/Auth";
import { AuthContext } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/map" element={<MapComponent />} />
          <Route path="/" element={<MapComponent />} />
          <Route path="/user" element={<UserComponent />} />
          <Route path="/stats" element={<StatsComponent />} />
        </Route>

        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
