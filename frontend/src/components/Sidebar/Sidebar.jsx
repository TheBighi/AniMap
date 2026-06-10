import "./Sidebar.css";
import LogoImage from "../../assets/logo-animap.png";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <Link to="/map" className="logo">
        <img src={LogoImage} alt="AniMap logo" />
        <span>AniMap</span>
      </Link>
      <div className="japaneseText bottomText">
        旅<br />は<br />道<br />連<br />れ
      </div>
    </aside>
  );
}

export default Sidebar;