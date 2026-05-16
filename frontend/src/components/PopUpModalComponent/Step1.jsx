function Step1({ pinData, setPinData, nextStep, closeModal }) {
  return (
    <div className="modal-step">
      <h2>Create Pin</h2>

      <input
        placeholder="Title"
        value={pinData.title}
        onChange={(e) =>
          setPinData({
            ...pinData,
            title: e.target.value,
          })
        }
      />

      <input
        placeholder="Anime Name"
        value={pinData.anime}
        onChange={(e) =>
          setPinData({
            ...pinData,
            anime: e.target.value,
          })
        }
      />

      <textarea
        placeholder="Description"
        value={pinData.description}
        onChange={(e) =>
          setPinData({
            ...pinData,
            description: e.target.value,
          })
        }
      />

      
      <div className="modal-buttons">
        <button onClick={closeModal}>
          Cancel
        </button>

        <button onClick={nextStep}>
          Next
        </button>
      </div>
    </div>
  );
}

export default Step1;