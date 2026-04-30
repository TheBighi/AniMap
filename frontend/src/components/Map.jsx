import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

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
    const [selectedFeature, setSelectedFeature] = useState(null);

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
      el.addEventListener("click", () => {
        setSelectedFeature(feature)
        console.log("OK")
    });

      const img = document.createElement("img");
      img.src =
        "https://icons.iconarchive.com/icons/paomedia/small-n-flat/512/map-marker-icon.png";

      el.appendChild(img);

      new mapboxgl.Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat(feature.geometry.coordinates)
        .addTo(map);
    });
  }, []);

  return (
    <>
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "100vh" }}
      />
      {selectedFeature && (
        <div className="modal">
          <h2>Title: {selectedFeature.properties.title}</h2>
          <h2>Description: {selectedFeature.properties.description}</h2>
          <h2>Anime: {selectedFeature.properties.animeName}</h2>
          <h3>Coords: {selectedFeature.properties.latitude}, {selectedFeature.properties.longitude}</h3>

          <img src={selectedFeature.properties.animeImgUrl} />
          <img src={selectedFeature.properties.IRLImgUrl} />

          <button onClick={() => setSelectedFeature(null)}>Close</button>
        </div>
      )}
    </>
  );
}

export default MapComponent