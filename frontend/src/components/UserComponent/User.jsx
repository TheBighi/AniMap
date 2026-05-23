import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import "./User.css";

const fetchUserPins = async () => {
  const response = await fetch("http://localhost:3006/api/pins/userPins", {
    method: "POST",
    credentials: "include",
  });

  const data = await response.json();
  return data.pins;
};

function User() {
  const { username, logout } = useContext(AuthContext);

  const [pins, setPins] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const loadPins = async () => {
      const data = await fetchUserPins();
      setPins(data || []);
    };

    loadPins();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="userPage">
      {/* MAIN */}

      <main className="mainContent">
        {/* TITLE */}
        <section className="titleSection">
          <div className="titleBar"></div>

          <h1 className="pageTitle">ACCOUNT</h1>
        </section>

        <section className="accountHeader">
          <div className="greetingText">Hello, {username || "friend"}!</div>
          <button className="logoutButton" onClick={handleLogout}>
            Logout
          </button>
        </section>

        {/* CARDS */}

        <section className="cardsWrapper">
          {pins.map((pin) => (
            <div className="pinCard" key={pin.id}>
              {/* LEFT */}

              <div className="cardPanel">
                <h2 className="cardTitle">{pin.title}</h2>

                <h3 className="cardAnime">{pin.animeName}</h3>

                <p className="cardDescription">{pin.description}</p>

                <div className="imagesRow">
                  <img
                    className="previewImage"
                    src={`http://localhost:3006${pin.realImageUrl}`}
                    alt="real"
                  />

                  <img
                    className="previewImage"
                    src={`http://localhost:3006${pin.animeImageUrl}`}
                    alt="anime"
                  />
                </div>
              </div>

              {/* RIGHT */}

              <div className="actionsColumn">
                <button className="actionButton editButton">Edit</button>

                <button className="actionButton deleteButton">Delete</button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default User;
