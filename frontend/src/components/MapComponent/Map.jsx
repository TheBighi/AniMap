import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./Map.css";

const geojson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [139.6917, 35.6895] },
      properties: { title: 'Beautiul stair scene', description: "Stair scene from Your Name", animeName: 'Your Name', latitude: 139.69, longitude: 35.68, animeImgUrl: 'https://i.redd.it/your-name-staircase-suga-shrine-v0-ydhyt48elj5e1.jpg?width=1561&format=pjpg&auto=webp&s=117c6ccb942ae32b471dc759b67c6a9f8db5c685', IRLImgUrl: 'https://www.snowmonkeyresorts.com/wp-content/uploads/2025/01/1E533062-2870-4E7B-8FF9-A3B407A416E5-58232-000033F0A83C0376-1024x683.jpeg' },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [140.86, 38.26] },
      properties: { description: "Sendai", animeImgUrl: 'https://fastly.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U', IRLImgUrl: 'https://fastly.picsum.photos/id/866/536/354.jpg?hmac=tGofDTV7tl2rprappPzKFiZ9vDh5MKj39oa2D--gqhA'  },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [135.7681, 35.011] },
      properties: { description: "Kyoto", animeImgUrl: 'https://fastly.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U', IRLImgUrl: 'https://fastly.picsum.photos/id/866/536/354.jpg?hmac=tGofDTV7tl2rprappPzKFiZ9vDh5MKj39oa2D--gqhA' },
    },
  ],
};

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function MapComponent() {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return; // prevent multiple maps

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
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "100vh" }}
    />
  );
}

export default MapComponent;