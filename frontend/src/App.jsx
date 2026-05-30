import "./App.css";
import MapComponent from "./components/MapComponent/Map";
import UserComponent from "./components/UserComponent/User";
import StatsComponent from "./components/StatsComponent/Stats";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./components/login/Auth";
import Layout from "./components/Layout/Layout";
import MobileLayout from "./components/MobileLayout/MobileLayout";
import useMediaQuery from "./hooks/useMediaQuery";

function App() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const Shell = isMobile ? MobileLayout : Layout;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
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
