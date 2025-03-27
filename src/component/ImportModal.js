import React from "react";

const ImportModal = ({
  showImportModal,
  setShowImportModal,
  importOptions,
  handleImportOptionsChange,
  fileUploadRef,
}) => {
  if (!showImportModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>SVG Import Options</h2>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="keepAspectRatio"
              checked={importOptions.keepAspectRatio}
              onChange={handleImportOptionsChange}
            />
            Maintain Aspect Ratio
          </label>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="convertToShapes"
              checked={importOptions.convertToShapes}
              onChange={handleImportOptionsChange}
            />
            Convert to Editable Elements
          </label>
        </div>

        <div className="form-group">
          <label>Position</label>
          <select
            name="position"
            value={importOptions.position}
            onChange={handleImportOptionsChange}
          >
            <option value="center">Center of Canvas</option>
            <option value="cursor">At Cursor Position</option>
            <option value="origin">Canvas Origin (0,0)</option>
          </select>
        </div>

        <div className="modal-actions">
          <button onClick={() => setShowImportModal(false)}>Cancel</button>
          <button
            onClick={() => {
              fileUploadRef.current.click();
              setShowImportModal(false);
            }}
            className="primary"
          >
            Select SVG File
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
