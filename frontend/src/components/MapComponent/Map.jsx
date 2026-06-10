import React, { useEffect, useRef, useContext, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./Map.css";
import { AuthContext } from "../../context/AuthContext";
import AddPin from "../PopUpModalComponent/AddPin";

const fetchAllPins = async () => {
  const response = await fetch("https://d22irt5kiloi89.cloudfront.net/api/pins");
  const data = await response.json();
  const pins = data.pins;

  return {
    type: "FeatureCollection",
    features: pins.map((pin) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [pin.longitude, pin.latitude],
      },
      properties: {
        id: pin.id,
        title: pin.title,
        description: pin.description,
        animeName: pin.animeName,
        latitude: pin.latitude,
        longitude: pin.longitude,
        animeImgUrl: pin.animeImageUrl,
        IRLImgUrl: pin.realImageUrl,
        createdAt: pin.createdAt,
      },
    })),
  };
};

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function MapComponent() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const { username } = useContext(AuthContext);
  const [geojson, setGeojson] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const loadPins = async () => {
    const data = await fetchAllPins();
    setGeojson(data);
    return data;
  };

  useEffect(() => {
    loadPins();
  }, []);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v10",
      projection: "globe",
      center: [139.6917, 35.6895],
      zoom: 2,
    });

    mapRef.current = map;
    setMapLoaded(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const updateMarkers = () => {
    if (!mapRef.current || !geojson) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    geojson.features.forEach((feature) => {
      const el = document.createElement("div");
      el.className = "marker";
      el.style.cursor = "pointer";

      const img = document.createElement("img");
      img.src =
        "https://icons.iconarchive.com/icons/paomedia/small-n-flat/512/map-marker-icon.png";
      img.style.width = "30px";
      img.style.height = "30px";

      el.appendChild(img);

      const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
        className: "custom-popup",
      }).setHTML(`
        <div class="popup-content">
          ${feature.properties.title ? `<h3>${feature.properties.title}</h3>` : ""}
          <p><strong>Description:</strong> ${feature.properties.description}</p>
          ${feature.properties.animeName ? `<p><strong>Anime:</strong> ${feature.properties.animeName}</p>` : ""}
          <p><strong>Coords:</strong> ${feature.properties.latitude || feature.geometry.coordinates[1]}, ${feature.properties.longitude || feature.geometry.coordinates[0]}</p>
          <div class="images-container">
            ${feature.properties.animeImgUrl ? `<img src="${feature.properties.animeImgUrl}" alt="Anime Image" class="popup-image" />` : ""}
            ${feature.properties.IRLImgUrl ? `<img src="${feature.properties.IRLImgUrl}" alt="IRL Image" class="popup-image" />` : ""}
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: "bottom",
        offset: [0, -7],
      })
        .setLngLat(feature.geometry.coordinates)
        .setPopup(popup)
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    if (mapLoaded) {
      updateMarkers();
    }
  }, [geojson, mapLoaded]);

  const handleCreatePin = async (pinData) => {
    const body = {
      title: pinData.title,
      description: pinData.description,
      realImage: pinData.realImage,
      animeImage: pinData.animeImage,
      anime: pinData.anime,
      latitude: parseFloat(pinData.latitude),
      longitude: parseFloat(pinData.longitude),
    };

    const res = await fetch("https://d22irt5kiloi89.cloudfront.net/api/pins", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to create pin");
    }

    const responseData = await res.json();
    const pin = responseData.pin;

    if (!pin) {
      await loadPins();
      return;
    }

    const feature = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [pin.longitude, pin.latitude],
      },
      properties: {
        id: pin.id,
        title: pin.title,
        description: pin.description,
        animeName: pin.animeName,
        latitude: pin.latitude,
        longitude: pin.longitude,
        animeImgUrl: pin.animeImageUrl,
        IRLImgUrl: pin.realImageUrl,
        createdAt: pin.createdAt,
      },
    };

    setGeojson((current) => {
      if (!current) {
        return {
          type: "FeatureCollection",
          features: [feature],
        };
      }
      return {
        ...current,
        features: [...current.features, feature],
      };
    });
  };

  return (
    <div>
      {/* MAIN */}

      <main className="mainContent">
        {/* TITLE */}
        <section className="titleSection">
          <div className="titleBar"></div>

          <h1 className="pageTitle">MAP</h1>
        </section>

        {/* MAP */}
        <div style={{ width: "100%", height: "100vh", position: "relative" }}>
          <AddPin onCreatePin={handleCreatePin} />
          <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
        </div>
      </main>
    </div>
  );
}

export default MapComponent;