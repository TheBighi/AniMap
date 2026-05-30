function Step2({
  pinData,
  setPinData,
  prevStep,
  createPin,
  isEditing = false,
}) {
  const coordinateRegex = /^-?\d*(\.\d*)?$/;

  const handleCoordinateChange = (field, value) => {
    if (value === "" || coordinateRegex.test(value)) {
      setPinData({
        ...pinData,
        [field]: value,
      });
    }
  };

  const lat = parseFloat(pinData.latitude);
  const lng = parseFloat(pinData.longitude);

  const isValidCoordinates =
    coordinateRegex.test(pinData.latitude) &&
    coordinateRegex.test(pinData.longitude) &&
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

      <input
        type="text"
        inputMode="decimal"
        placeholder="Latitude (example: 59.4370)"
        value={pinData.latitude}
        onChange={(e) => handleCoordinateChange("latitude", e.target.value)}
      />
      <small className="coordinate-hint">Enter a value from -90 to 90</small>
      <input
        type="text"
        inputMode="decimal"
        placeholder="Longitude (example: 24.7450)"
        value={pinData.longitude}
        onChange={(e) => handleCoordinateChange("longitude", e.target.value)}
      />
      <small className="coordinate-hint">Enter a value from -180 to 180</small>

      {!isEditing && (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange("animeImage", e.target.files[0])}
          />
          <small className="coordinate-hint">
            {pinData.animeImage
              ? "✓ Image selected"
              : "Upload image from the anime"}
          </small>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange("realImage", e.target.files[0])}
          />
          <small className="coordinate-hint">
            {pinData.realImage
              ? "✓ Image selected"
              : "Upload image from the real location"}
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