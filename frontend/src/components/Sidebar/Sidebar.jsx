import "./Sidebar.css";
import LogoImage from "../../assets/logo-animap.png";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        <img src={LogoImage} alt="AniMap logo" />
        <span>AniMap</span>
      </div>
      <div className="japaneseText bottomText">
        旅<br />は<br />道<br />連<br />れ
      </div>
    </aside>
  );
}

export default Sidebar;