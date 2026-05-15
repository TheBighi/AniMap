function Step2({
  pinData,
  setPinData,
  prevStep,
  createPin,
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

    const lat = parseFloat(pinData.lat);
    const lng = parseFloat(pinData.lng);

    const isValidCoordinates =
        coordinateRegex.test(pinData.lat) &&
        coordinateRegex.test(pinData.lng) &&
        lat > -90 &&
        lat < 90 &&
        lng > -180 &&
        lng < 180;

  return (
    <div className="modal-step">
      <h2>Location</h2>

      <input
        type="text"
        inputMode="decimal"
        placeholder="Latitude (example: 59.4370)"
        value={pinData.lat}
        onChange={(e) =>
            handleCoordinateChange("lat", e.target.value)
        }
      />
      <small className="coordinate-hint">
          Enter a value from -90 to 90
      </small>
      <input
        type="text"
        inputMode="decimal"
        placeholder="Longitude (example: 24.7450)"
        value={pinData.lng}
        onChange={(e) =>
            handleCoordinateChange("lng", e.target.value)
        }
      />
      <small className="coordinate-hint">
          Enter a value from -180 to 180
      </small>

      <div className="modal-buttons">
        <button onClick={prevStep}>
          Back
        </button>

        <button
          className="add-pin-submit"
          disabled={!isValidCoordinates}
          onClick={createPin}
          >
          Add Pin
        </button>
      </div>
    </div>
  );
}

export default Step2;