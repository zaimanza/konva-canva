import { Stage, Layer, Rect, Line, Transformer } from "react-konva";
import {
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
} from "react-icons/md";
import "./App.scss";
import Toolbar from "./component/Toolbar";
import ImportModal from "./component/ImportModal";
import ImportProgress from "./component/ImportProgress";
import useToolbarAction from "./component/Toolbar/useToolbarAction";
import Shape from "./component/Shape";
import TextFormatToolbar from "./component/TextFormatToolbar";

const App = () => {
  const props = useToolbarAction();
  const {
    tool,
    setShowImportModal,
    fileUploadRef,
    selectedId,
    stageScale,
    getSelectedShape,
    stageRef,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    stagePosition,
    layerRef,
    canvasSize,
    shapes,
    isDrawing,
    points,
    strokeColor,
    strokeWidth,
    opacity,
    transformerRef,
    fillColor,
    setFillColor,
    handlePropertyChange,
    setOpacity,
    setStrokeColor,
    setStrokeWidth,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    setFontStyle,
    setTextDecoration,
    setTextAlign,
    showImportModal,
    importOptions,
    handleImportOptionsChange,
    showImportProgress,
    importProgress,
  } = props;

  // Render shape components based on their type

  return (
    <div className="app-container">
      <Toolbar {...props} />

      {/* Text formatting toolbar */}
      {getSelectedShape()?.type === "text" && <TextFormatToolbar />}

      <div className="main-content">
        <div className="canvas-container" tabIndex={1}>
          <Stage
            ref={stageRef}
            width={window.innerWidth - 300}
            height={window.innerHeight - 60}
            // onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            scaleX={stageScale}
            scaleY={stageScale}
            x={stagePosition.x}
            y={stagePosition.y}
            draggable={tool === "hand"}
          >
            <Layer ref={layerRef}>
              {/* Static white background that cannot be moved */}
              <Rect
                x={0}
                y={0}
                width={canvasSize.width}
                height={canvasSize.height}
                fill="white"
                stroke="#cccccc"
                strokeWidth={1}
                listening={false} // Prevents interaction with this background
              />

              {/* Background grid (optional) */}
              <Rect
                x={0}
                y={0}
                width={5000}
                height={5000}
                fill="#f9f9f9"
                strokeWidth={0}
                visible={false} // Hidden by default
              />

              {/* Render all shapes */}
              {shapes.map((shape) => (
                <Shape {...props} shape={shape} />
              ))}

              {/* Render current drawing line */}
              {isDrawing && tool === "pen" && (
                <Line
                  points={points}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                  lineCap="round"
                  lineJoin="round"
                />
              )}

              {/* Transformer for resizing and rotating */}
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // Limit min/max sizes
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
                rotateEnabled={true}
                enabledAnchors={[
                  "top-left",
                  "top-center",
                  "top-right",
                  "middle-right",
                  "bottom-right",
                  "bottom-center",
                  "bottom-left",
                  "middle-left",
                ]}
                borderStroke="#0096FF"
                borderStrokeWidth={2}
                anchorStroke="#0096FF"
                anchorFill="#fff"
                anchorSize={8}
                keepRatio={false}
              />
            </Layer>
          </Stage>
        </div>

        <div className="properties-panel">
          <h3>Properties</h3>
          {selectedId ? (
            <div className="property-groups">
              <div className="property-group">
                <h4>Fill</h4>
                <div className="color-picker">
                  <input
                    type="color"
                    value={getSelectedShape()?.fill || fillColor}
                    onChange={(e) => {
                      setFillColor(e.target.value);
                      handlePropertyChange("fill", e.target.value);
                    }}
                  />
                  <span>{getSelectedShape()?.fill || fillColor}</span>
                </div>
              </div>

              <div className="property-group">
                <h4>Stroke</h4>
                <div className="color-picker">
                  <input
                    type="color"
                    value={getSelectedShape()?.stroke || strokeColor}
                    onChange={(e) => {
                      setStrokeColor(e.target.value);
                      handlePropertyChange("stroke", e.target.value);
                    }}
                  />
                  <span>{getSelectedShape()?.stroke || strokeColor}</span>
                </div>
                <div className="slider-control">
                  <label>Width:</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    value={getSelectedShape()?.strokeWidth || strokeWidth}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setStrokeWidth(value);
                      handlePropertyChange("strokeWidth", value);
                    }}
                  />
                  <span>
                    {getSelectedShape()?.strokeWidth || strokeWidth}px
                  </span>
                </div>
              </div>

              <div className="property-group">
                <h4>Opacity</h4>
                <div className="slider-control">
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={getSelectedShape()?.opacity || opacity}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setOpacity(value);
                      handlePropertyChange("opacity", value);
                    }}
                  />
                  <span>
                    {Math.round((getSelectedShape()?.opacity || opacity) * 100)}
                    %
                  </span>
                </div>
              </div>

              {getSelectedShape()?.type === "text" && (
                <div className="property-group">
                  <h4>Text</h4>
                  <div className="control">
                    <label>Font:</label>
                    <select
                      value={getSelectedShape()?.fontFamily || fontFamily}
                      onChange={(e) => {
                        setFontFamily(e.target.value);
                        handlePropertyChange("fontFamily", e.target.value);
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
                  </div>
                  <div className="slider-control">
                    <label>Size:</label>
                    <input
                      type="range"
                      min="8"
                      max="72"
                      step="1"
                      value={getSelectedShape()?.fontSize || fontSize}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setFontSize(value);
                        handlePropertyChange("fontSize", value);
                      }}
                    />
                    <span>{getSelectedShape()?.fontSize || fontSize}px</span>
                  </div>
                  <div className="text-style-buttons">
                    <button
                      className={`style-button ${
                        getSelectedShape()?.fontStyle?.includes("bold")
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        const currentStyle =
                          getSelectedShape()?.fontStyle || "";
                        const newStyle = currentStyle.includes("bold")
                          ? currentStyle.replace("bold", "").trim()
                          : `${currentStyle} bold`.trim();
                        setFontStyle(newStyle);
                        handlePropertyChange("fontStyle", newStyle);
                      }}
                    >
                      B
                    </button>
                    <button
                      className={`style-button ${
                        getSelectedShape()?.fontStyle?.includes("italic")
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        const currentStyle =
                          getSelectedShape()?.fontStyle || "";
                        const newStyle = currentStyle.includes("italic")
                          ? currentStyle.replace("italic", "").trim()
                          : `${currentStyle} italic`.trim();
                        setFontStyle(newStyle);
                        handlePropertyChange("fontStyle", newStyle);
                      }}
                    >
                      I
                    </button>
                    <button
                      className={`style-button ${
                        getSelectedShape()?.textDecoration === "underline"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        const current =
                          getSelectedShape()?.textDecoration || "";
                        const newDecoration = current.includes("underline")
                          ? ""
                          : "underline";
                        setTextDecoration(newDecoration);
                        handlePropertyChange("textDecoration", newDecoration);
                      }}
                    >
                      U
                    </button>
                  </div>
                  <div className="text-align-buttons">
                    <button
                      className={`style-button ${
                        getSelectedShape()?.align === "left" ? "active" : ""
                      }`}
                      onClick={() => {
                        setTextAlign("left");
                        handlePropertyChange("align", "left");
                      }}
                    >
                      <MdFormatAlignLeft />
                    </button>
                    <button
                      className={`style-button ${
                        getSelectedShape()?.align === "center" ? "active" : ""
                      }`}
                      onClick={() => {
                        setTextAlign("center");
                        handlePropertyChange("align", "center");
                      }}
                    >
                      <MdFormatAlignCenter />
                    </button>
                    <button
                      className={`style-button ${
                        getSelectedShape()?.align === "right" ? "active" : ""
                      }`}
                      onClick={() => {
                        setTextAlign("right");
                        handlePropertyChange("align", "right");
                      }}
                    >
                      <MdFormatAlignRight />
                    </button>
                  </div>
                </div>
              )}

              <div className="property-group">
                <h4>Position & Size</h4>
                <div className="position-controls">
                  <div className="control">
                    <label>X:</label>
                    <input
                      type="number"
                      value={Math.round(getSelectedShape()?.x || 0)}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        handlePropertyChange("x", value);
                      }}
                    />
                  </div>
                  <div className="control">
                    <label>Y:</label>
                    <input
                      type="number"
                      value={Math.round(getSelectedShape()?.y || 0)}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        handlePropertyChange("y", value);
                      }}
                    />
                  </div>
                </div>
                {getSelectedShape()?.type === "rectangle" ||
                getSelectedShape()?.type === "image" ? (
                  <div className="size-controls">
                    <div className="control">
                      <label>W:</label>
                      <input
                        type="number"
                        value={Math.round(getSelectedShape()?.width || 0)}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          handlePropertyChange("width", value);
                        }}
                      />
                    </div>
                    <div className="control">
                      <label>H:</label>
                      <input
                        type="number"
                        value={Math.round(getSelectedShape()?.height || 0)}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          handlePropertyChange("height", value);
                        }}
                      />
                    </div>
                  </div>
                ) : getSelectedShape()?.type === "circle" ? (
                  <div className="control">
                    <label>Radius:</label>
                    <input
                      type="number"
                      value={Math.round(getSelectedShape()?.radius || 0)}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        handlePropertyChange("radius", value);
                      }}
                    />
                  </div>
                ) : null}

                {/* Add rotation control */}
                <div className="control">
                  <label>Rotation:</label>
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={Math.round(getSelectedShape()?.rotation || 0)}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      handlePropertyChange("rotation", value);
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection-message">
              Select an object to edit its properties
            </div>
          )}
        </div>
      </div>

      {/* SVG Import Modal */}
      {showImportModal && (
        <ImportModal
          showImportModal={showImportModal}
          setShowImportModal={setShowImportModal}
          importOptions={importOptions}
          handleImportOptionsChange={handleImportOptionsChange}
          fileUploadRef={fileUploadRef}
        />
      )}

      {/* Import Progress Indicator */}
      <ImportProgress
        showImportProgress={showImportProgress}
        importProgress={importProgress}
      />
    </div>
  );
};

export default App;
