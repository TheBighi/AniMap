import { useState, useEffect } from "react";
import "./Modal.css";

import Step1 from "./Step1";
import Step2 from "./Step2";

function EditPin({ pin, isOpen, onClose, onUpdatePin }) {
  const [step, setStep] = useState(1);

  const [pinData, setPinData] = useState({
    title: "",
    anime: "",
    description: "",
    latitude: "",
    longitude: "",
    animeImage: "",
    realImage: "",
  });

  useEffect(() => {
    if (isOpen && pin) {
      setPinData({
        title: pin.title || "",
        anime: pin.animeName || "",
        description: pin.description || "",
        latitude: String(pin.latitude || ""),
        longitude: String(pin.longitude || ""),
        animeImage: "",
        realImage: "",
      });
      setStep(1);
    }
  }, [isOpen, pin]);

  const handleUpdatePin = async () => {
    try {
      await onUpdatePin(pin.id, pinData);
      onClose();
      setStep(1);
    } catch (error) {
      console.error("Pin update failed:", error);
      alert("Could not update pin. Please try again.");
    }
  };

  const closeModal = () => {
    onClose();
    setStep(1);
  };

  return (
    <>
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            {step === 1 && (
              <Step1
                pinData={pinData}
                setPinData={setPinData}
                nextStep={() => setStep(2)}
                closeModal={closeModal}
                isEditing={true}
              />
            )}

            {step === 2 && (
              <Step2
                pinData={pinData}
                setPinData={setPinData}
                prevStep={() => setStep(1)}
                createPin={handleUpdatePin}
                isEditing={true}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default EditPin;