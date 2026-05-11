import React, { useEffect, useRef, useContext, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./Map.css";
import { AuthContext } from "../../context/AuthContext";

const fetchAllPins = async () => {
  const response = await fetch('http://localhost:3006/api/pins')
  const data = await response.json()
  const pins = data.pins

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
  }
}

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function MapComponent() {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const { username } = useContext(AuthContext);
    const [geojson, setGeojson] = useState(null);

  useEffect(() => {
    const loadPins = async () => {
      const data = await fetchAllPins();
      setGeojson(data);
    };
    loadPins();
  }, []);

  useEffect(() => {
    if (mapRef.current || !geojson) return; // prevent multiple maps and wait for data

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v10",
      center: [139.6917, 35.6895],
      zoom: 3,
    });

    mapRef.current = map;

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
        className: 'custom-popup'
      }).setHTML(`
        <div class="popup-content">
          ${feature.properties.title ? `<h3>${feature.properties.title}</h3>` : ''}
          <p><strong>Description:</strong> ${feature.properties.description}</p>
          ${feature.properties.animeName ? `<p><strong>Anime:</strong> ${feature.properties.animeName}</p>` : ''}
          <p><strong>Coords:</strong> ${feature.properties.latitude || feature.geometry.coordinates[1]}, ${feature.properties.longitude || feature.geometry.coordinates[0]}</p>
          <div class="images-container">
            ${feature.properties.animeImgUrl ? `<img src="${feature.properties.animeImgUrl}" alt="Anime Image" class="popup-image" />` : ''}
            ${feature.properties.IRLImgUrl ? `<img src="${feature.properties.IRLImgUrl}" alt="IRL Image" class="popup-image" />` : ''}
          </div>
        </div>
      `);

      new mapboxgl.Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat(feature.geometry.coordinates)
        .setPopup(popup)
        .addTo(map);
    });
  }, [geojson]);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

export default MapComponent;