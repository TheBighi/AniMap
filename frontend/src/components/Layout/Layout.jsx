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
      </div>
    </div>
  );
}

export default Layout;
