import "./Modal.css";

function DeleteConfirm({ isOpen, onClose, onDelete, pinTitle }) {
  const handleConfirm = () => {
    onDelete();
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-box delete-confirm">
            <h2>Confirm deletion</h2>
            <p>Are you sure you want to permanently delete the pin:</p>
            <p className="pin-title-confirmation">"{pinTitle}"</p>
            <p>This action cannot be undone.</p>

            <div className="modal-buttons delete-buttons">
              <button className="cancel-button" onClick={onClose}>
                Cancel
              </button>
              <button className="delete-button-confirm" onClick={handleConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DeleteConfirm;