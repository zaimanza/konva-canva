import React from "react";
import {
  FaFileExport,
  FaFileUpload,
  FaPencilAlt,
  FaRegHandPaper,
  FaRegSave,
} from "react-icons/fa";
import {
  MdDelete,
  MdOutlineCircle,
  MdOutlineRectangle,
  MdRedo,
  MdTextFields,
  MdUndo,
  MdZoomIn,
  MdZoomOut,
} from "react-icons/md";

const Toolbar = ({
  tool,
  setTool,
  handleUndo,
  historyStep,
  handleRedo,
  history,
  setShowImportModal,
  fileUploadRef,
  handleFileUpload,
  handleExport,
  handleExportSVG,
  handleDelete,
  selectedId,
  setStageScale,
  stageScale,
}) => {
  return (
    <div className="toolbar">
      <div className="tool-group">
        <button
          className={`tool-button ${tool === "select" ? "active" : ""}`}
          onClick={() => setTool("select")}
          title="Select Tool (V)"
        >
          <FaRegHandPaper />
        </button>
        <button
          className={`tool-button ${tool === "pen" ? "active" : ""}`}
          onClick={() => setTool("pen")}
          title="Pen Tool (P)"
        >
          <FaPencilAlt />
        </button>
        <button
          className={`tool-button ${tool === "rectangle" ? "active" : ""}`}
          onClick={() => setTool("rectangle")}
          title="Rectangle Tool (R)"
        >
          <MdOutlineRectangle />
        </button>
        <button
          className={`tool-button ${tool === "circle" ? "active" : ""}`}
          onClick={() => setTool("circle")}
          title="Circle Tool (C)"
        >
          <MdOutlineCircle />
        </button>
        <button
          className={`tool-button ${tool === "text" ? "active" : ""}`}
          onClick={() => setTool("text")}
          title="Text Tool (T)"
        >
          <MdTextFields />
        </button>
      </div>

      <div className="tool-group">
        <button
          className="tool-button"
          onClick={handleUndo}
          disabled={historyStep <= 1}
          title="Undo (Ctrl+Z)"
        >
          <MdUndo />
        </button>
        <button
          className="tool-button"
          onClick={handleRedo}
          disabled={historyStep >= history.length}
          title="Redo (Ctrl+Y)"
        >
          <MdRedo />
        </button>
      </div>

      <div className="tool-group">
        <button
          className="tool-button"
          onClick={() => setShowImportModal(true)}
          title="Import SVG"
        >
          <FaFileUpload />
          <input
            type="file"
            ref={fileUploadRef}
            style={{ display: "none" }}
            accept=".svg"
            onChange={handleFileUpload}
          />
        </button>
        <button
          className="tool-button"
          onClick={handleExport}
          title="Export as PNG"
        >
          <FaRegSave />
        </button>
        <button
          className="tool-button"
          onClick={handleExportSVG}
          title="Export as SVG"
        >
          <FaFileExport />
        </button>
        <button
          className="tool-button"
          onClick={handleDelete}
          disabled={!selectedId}
          title="Delete Selected (Del)"
        >
          <MdDelete />
        </button>
      </div>

      <div className="tool-group zoom-controls">
        <button
          className="tool-button"
          onClick={() => {
            setStageScale(stageScale * 1.2);
          }}
          title="Zoom In"
        >
          <MdZoomIn />
        </button>
        <span className="zoom-level">{Math.round(stageScale * 100)}%</span>
        <button
          className="tool-button"
          onClick={() => {
            setStageScale(stageScale / 1.2);
          }}
          title="Zoom Out"
        >
          <MdZoomOut />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
