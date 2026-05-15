import { useState, useEffect } from "react";
import "./Modal.css";

import Step1 from "./Step1";
import Step2 from "./Step2";

function AddPin({ onCreatePin, defaultLat, defaultLng, isOpen: controlledIsOpen, onClose }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalOpen;
  const [step, setStep] = useState(1);

  const [pinData, setPinData] = useState({
    title: "",
    anime: "",
    description: "",
    lat: "",
    lng: "",
    animeImageUrl: "",
    realImageUrl: "",
  });

  useEffect(() => {
    if (isOpen && defaultLat !== undefined && defaultLng !== undefined) {
      setPinData((previous) => ({
        ...previous,
        lat: String(defaultLat),
        lng: String(defaultLng),
      }));
    }
  }, [defaultLat, defaultLng, isOpen]);

  const createPin = async () => {
    try {
      await onCreatePin(pinData);
      if (isControlled) {
        onClose && onClose();
      } else {
        setInternalOpen(false);
      }
      setStep(1);
      setPinData({
        title: "",
        anime: "",
        description: "",
        lat: "",
        lng: "",
        animeImageUrl: "",
        realImageUrl: "",
      });
    } catch (error) {
      console.error("Pin creation failed:", error);
      alert("Could not create pin. Please try again.");
    }
  };

  return (
    <>
      {!isControlled && (
        <button
          className="add-pin-button"
          onClick={() => setInternalOpen(true)}
        >
          Add Pin
        </button>
      )}

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-box">

            {step === 1 && (
              <Step1
                pinData={pinData}
                setPinData={setPinData}
                nextStep={() => setStep(2)}
                closeModal={() => {
                  if (isControlled) onClose && onClose(); else setInternalOpen(false);
                }}
              />
            )}

            {step === 2 && (
              <Step2
                pinData={pinData}
                setPinData={setPinData}
                prevStep={() => setStep(1)}
                createPin={createPin}
              />
            )}

          </div>
        </div>
      )}
    </>
  );
}

export default AddPin;