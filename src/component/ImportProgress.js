import React from "react";

const ImportProgress = ({ showImportProgress, importProgress }) => {
  if (!showImportProgress) return null;

  return (
    <div className="import-progress">
      <h4>Importing SVG</h4>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${importProgress}%` }}></div>
      </div>
      <div className="status">
        {importProgress < 100 ? "Processing elements..." : "Import complete"}
      </div>
    </div>
  );
};

export default ImportProgress;
