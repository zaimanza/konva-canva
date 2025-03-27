import React from "react";
import {
  MdFormatAlignCenter,
  MdFormatAlignLeft,
  MdFormatAlignRight,
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
} from "react-icons/md";

const TextFormatToolbar = ({
  getSelectedShape,
  fontFamily,
  handlePropertyChange,
  setFontFamily,
  fontSize,
  setFontSize,
  setFontStyle,
  setTextDecoration,
  setTextAlign,
}) => {
  const selectedShape = getSelectedShape();
  if (!selectedShape || selectedShape.type !== "text") return null;

  return (
    <div className="text-format-toolbar">
      <div className="toolbar-section">
        <select
          value={selectedShape.fontFamily || fontFamily}
          onChange={(e) => {
            handlePropertyChange("fontFamily", e.target.value);
            setFontFamily(e.target.value);
          }}
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
          <option value="Georgia">Georgia</option>
          <option value="Palatino">Palatino</option>
          <option value="Garamond">Garamond</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
          <option value="Trebuchet MS">Trebuchet MS</option>
          <option value="Arial Black">Arial Black</option>
        </select>

        <select
          value={selectedShape.fontSize || fontSize}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            handlePropertyChange("fontSize", value);
            setFontSize(value);
          }}
        >
          {[
            8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64,
            72,
          ].map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar-section">
        <button
          className={`format-button ${
            selectedShape.fontStyle?.includes("bold") ? "active" : ""
          }`}
          onClick={() => {
            const currentStyle = selectedShape.fontStyle || "";
            const newStyle = currentStyle.includes("bold")
              ? currentStyle.replace("bold", "").trim()
              : `${currentStyle} bold`.trim();
            handlePropertyChange("fontStyle", newStyle);
            setFontStyle(newStyle);
          }}
          title="Bold (Ctrl+B)"
        >
          <MdFormatBold />
        </button>

        <button
          className={`format-button ${
            selectedShape.fontStyle?.includes("italic") ? "active" : ""
          }`}
          onClick={() => {
            const currentStyle = selectedShape.fontStyle || "";
            const newStyle = currentStyle.includes("italic")
              ? currentStyle.replace("italic", "").trim()
              : `${currentStyle} italic`.trim();
            handlePropertyChange("fontStyle", newStyle);
            setFontStyle(newStyle);
          }}
          title="Italic (Ctrl+I)"
        >
          <MdFormatItalic />
        </button>

        <button
          className={`format-button ${
            selectedShape.textDecoration === "underline" ? "active" : ""
          }`}
          onClick={() => {
            const newDecoration =
              selectedShape.textDecoration === "underline" ? "" : "underline";
            handlePropertyChange("textDecoration", newDecoration);
            setTextDecoration(newDecoration);
          }}
          title="Underline (Ctrl+U)"
        >
          <MdFormatUnderlined />
        </button>
      </div>

      <div className="toolbar-section">
        <button
          className={`format-button ${
            selectedShape.align === "left" ? "active" : ""
          }`}
          onClick={() => {
            handlePropertyChange("align", "left");
            setTextAlign("left");
          }}
          title="Align Left"
        >
          <MdFormatAlignLeft />
        </button>

        <button
          className={`format-button ${
            selectedShape.align === "center" ? "active" : ""
          }`}
          onClick={() => {
            handlePropertyChange("align", "center");
            setTextAlign("center");
          }}
          title="Align Center"
        >
          <MdFormatAlignCenter />
        </button>

        <button
          className={`format-button ${
            selectedShape.align === "right" ? "active" : ""
          }`}
          onClick={() => {
            handlePropertyChange("align", "right");
            setTextAlign("right");
          }}
          title="Align Right"
        >
          <MdFormatAlignRight />
        </button>
      </div>
    </div>
  );
};

export default TextFormatToolbar;
