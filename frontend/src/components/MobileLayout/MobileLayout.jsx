import { Outlet, NavLink } from "react-router-dom";
import LogoImage from "../../assets/logo-animap.png";
import "./MobileLayout.css";

function MobileLayout() {
  return (
    <div className="mobileShell">
      <header className="mobileTopBar">
        <NavLink to="/map" className="mobileBrand" aria-label="AniMap home">
          <img src={LogoImage} alt="" className="mobileBrandLogo" />
          <span className="mobileBrandText">AniMap</span>
        </NavLink>
      </header>

      <main className="mobileMain">
        <Outlet />
      </main>

      <nav className="mobileTabBar" aria-label="Primary">
        <NavLink
          to="/map"
          className={({ isActive }) => (isActive ? "tabItem tabActive" : "tabItem")}
        >
          <span className="tabIcon" aria-hidden="true">
            {"\u{1F5FA}"}
          </span>
          <span className="tabLabel">Map</span>
        </NavLink>

        <NavLink
          to="/stats"
          className={({ isActive }) => (isActive ? "tabItem tabActive" : "tabItem")}
        >
          <span className="tabIcon" aria-hidden="true">
            {"\u{1F4CA}"}
          </span>
          <span className="tabLabel">Stats</span>
        </NavLink>

        <NavLink
          to="/user"
          className={({ isActive }) => (isActive ? "tabItem tabActive" : "tabItem")}
        >
          <span className="tabIcon" aria-hidden="true">
            {"\u{1F464}"}
          </span>
          <span className="tabLabel">Account</span>
        </NavLink>
      </nav>
    </div>
  );
}

export default MobileLayout;

