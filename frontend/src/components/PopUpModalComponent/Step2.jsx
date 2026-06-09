import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function CoordinatePicker({ pinData, setPinData }) {
  const mapContainer = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v10",
      projection: "globe",
      center: [139.6917, 35.6895],
      zoom: 4,
    });

    map.on("click", ({ lngLat: { lng, lat } }) => {
      if (!markerRef.current) {
        markerRef.current = new mapboxgl.Marker({ color: "#e74c3c", draggable: true }).setLngLat([lng, lat]).addTo(map);

        markerRef.current.on("dragend", () => {
          const { lng, lat } = markerRef.current.getLngLat();
          setPinData((prev) => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
        });
      } else {
        markerRef.current.setLngLat([lng, lat]);
      }

      setPinData((prev) => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
    });

    return () => { map.remove(); markerRef.current = null; };
  }, []);

  return (
    <div style={{ marginBottom: 12 }}>
      <div ref={mapContainer} style={{ width: "100%", height: 260, borderRadius: 8, border: "1px solid #ddd" }} />
      <small style={{ display: "block", marginTop: 6 }}>
        {pinData.latitude && pinData.longitude
          ? `📍 ${parseFloat(pinData.latitude).toFixed(4)}, ${parseFloat(pinData.longitude).toFixed(4)}`
          : "Click the map to place a pin"}
      </small>
    </div>
  );
}

function Step2({ pinData, setPinData, prevStep, createPin, isEditing = false }) {
  const lat = parseFloat(pinData.latitude);
  const lng = parseFloat(pinData.longitude);

  const isValidCoordinates =
    pinData.latitude !== "" &&
    pinData.longitude !== "" &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat > -90 &&
    lat < 90 &&
    lng > -180 &&
    lng < 180;

  const hasImages = isEditing ? true : pinData.animeImage && pinData.realImage;

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageChange = async (field, file) => {
    if (!file) return;
    const base64 = await toBase64(file);
    setPinData({ ...pinData, [field]: base64 });
  };

  return (
    <div className="modal-step">
      <h2>Location</h2>

      <CoordinatePicker pinData={pinData} setPinData={setPinData} />

      {!isEditing && (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange("animeImage", e.target.files[0])}
          />
          <small className="coordinate-hint">
            {pinData.animeImage ? "✓ Image selected" : "Upload image from the anime"}
          </small>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange("realImage", e.target.files[0])}
          />
          <small className="coordinate-hint">
            {pinData.realImage ? "Image selected" : "Upload image from the real location"}
          </small>
        </>
      )}

      <div className="modal-buttons">
        <button onClick={prevStep}>Back</button>
        <button
          className="add-pin-submit"
          disabled={!isValidCoordinates || !hasImages}
          onClick={createPin}
        >
          {isEditing ? "Update Pin" : "Add Pin"}
        </button>
      </div>
    </div>
  );
}

export default Step2;