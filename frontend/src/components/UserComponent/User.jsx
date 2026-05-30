import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import EditPin from "../PopUpModalComponent/EditPin";
import DeleteConfirm from "../PopUpModalComponent/DeleteConfirm";
import "./User.css";
import useMediaQuery from "../../hooks/useMediaQuery";

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
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [pins, setPins] = useState([]);
  const [editingPin, setEditingPin] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingPin, setDeletingPin] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const handleEditClick = (pin) => {
    setEditingPin(pin);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (pin) => {
    setDeletingPin(pin);
    setIsDeleteModalOpen(true);
  };

  const handleUpdatePin = async (pinId, pinData) => {
    try {
      const response = await fetch(`http://localhost:3006/api/pins/${pinId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: pinData.title,
          animeName: pinData.anime,
          description: pinData.description,
          latitude: parseFloat(pinData.latitude),
          longitude: parseFloat(pinData.longitude),
          animeImage: pinData.animeImage,
          realImage: pinData.realImage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update pin");
      }

      const data = await fetchUserPins();
      setPins(data || []);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating pin:", error);
      throw error;
    }
  };

  const handleDeletePin = async () => {
    try {
      const response = await fetch(
        `http://localhost:3006/api/pins/${deletingPin.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete pin");
      }

      setPins(pins.filter((p) => p.id !== deletingPin.id));
      setIsDeleteModalOpen(false);
      setDeletingPin(null);
    } catch (error) {
      console.error("Error deleting pin:", error);
      alert("Failed to delete pin. Please try again.");
    }
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
          {pins.length === 0 ? (
            <div className="emptyPins">You don’t have any pins yet.</div>
          ) : (
            pins.map((pin) => (
              <div className="pinCard" key={pin.id}>
                {/* LEFT */}

                <div className="cardPanel">
                  <h2 className="cardTitle">{pin.title}</h2>

                  <h3 className="cardAnime">{pin.animeName}</h3>

                  {!isMobile ? (
                    <p className="cardDescription">{pin.description}</p>
                  ) : (
                    <p className="cardDescription cardDescriptionCompact">
                      {pin.description}
                    </p>
                  )}

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
                  <button
                    className="actionButton editButton"
                    onClick={() => handleEditClick(pin)}
                  >
                    Edit
                  </button>

                  <button
                    className="actionButton deleteButton"
                    onClick={() => handleDeleteClick(pin)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      <EditPin
        pin={editingPin}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdatePin={handleUpdatePin}
      />

      <DeleteConfirm
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeletePin}
        pinTitle={deletingPin?.title || ""}
      />
    </div>
  );
}

export default User;
