import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import { Outlet } from "react-router-dom";
import "./Layout.css";

function Layout() {
  return (
    <div className="layout">
      <Sidebar />

      <div className="contentArea">
        <Header />

        <main className="pageContent">
          <Outlet />
        </main>

        <footer className="appFooter">
          <div className="footerContent">
            <span>© 2026 AniMap</span>
            <span>Manage your anime location pins with ease.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Layout;
