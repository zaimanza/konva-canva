import { useEffect, useRef, useState } from "react";
import { exportSVG, parseSvgString } from "../../SVGHelper";

const useToolbarAction = () => {
  // Canvas states
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

  // Style panel states
  const [fillColor, setFillColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontStyle, setFontStyle] = useState("");
  const [textAlign, setTextAlign] = useState("left");
  const [opacity, setOpacity] = useState(1);
  const [textDecoration, setTextDecoration] = useState("");
  const [tool, setTool] = useState("select");
  const [historyStep, setHistoryStep] = useState(0);
  const [history, setHistory] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const stageRef = useRef(null);
  const fileUploadRef = useRef(null);
  const [importProgress, setImportProgress] = useState(0);
  const [showImportProgress, setShowImportProgress] = useState(false);
  const [shapes, setShapes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [stageScale, setStageScale] = useState(1);

  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Handle shape selection
  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const selectedNode = shapes.find((shape) => shape.id === selectedId);
      if (selectedNode) {
        const node = document.getElementById(selectedId);
        if (node) {
          transformerRef.current.nodes([node]);
          transformerRef.current.getLayer().batchDraw();
        }
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId, shapes]);

  // Handle history
  useEffect(() => {
    if (historyStep < history.length && historyStep > 0) {
      setShapes(history[historyStep - 1]);
    }
  }, [historyStep, history]);

  // Refs
  const transformerRef = useRef(null);
  const layerRef = useRef(null);

  // Generate unique IDs for shapes
  const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  // Enhanced SVG Import Modal
  const [importOptions, setImportOptions] = useState({
    keepAspectRatio: true,
    position: "center",
    convertToShapes: true,
  });

  const handleImportOptionsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setImportOptions({
      ...importOptions,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const renderImportModal = () => {};

  // Get the currently selected shape
  const getSelectedShape = () => {
    return shapes.find((shape) => shape.id === selectedId);
  };

  // Handle zoom in/out
  const handleWheel = (e) => {
    e.evt.preventDefault();

    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();

    const pointerPosition = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointerPosition.x - stage.x()) / oldScale,
      y: (pointerPosition.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setStageScale(newScale);
    setStagePosition({
      x: pointerPosition.x - mousePointTo.x * newScale,
      y: pointerPosition.y - mousePointTo.y * newScale,
    });
  };

  // Handle mouse down on canvas
  const handleMouseDown = (e) => {
    if (tool === "select") {
      // Only handle selections on the stage itself, not on shapes
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        setSelectedId(null);
      }
      return;
    }

    setIsDrawing(true);
    const pos = stageRef.current.getPointerPosition();

    // Calculate position relative to current scale and position
    const x = (pos.x - stagePosition.x) / stageScale;
    const y = (pos.y - stagePosition.y) / stageScale;

    if (tool === "pen") {
      setPoints([x, y]);
    } else if (tool === "rectangle") {
      const newRect = {
        id: generateId(),
        type: "rectangle",
        x: x,
        y: y,
        width: 0,
        height: 0,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        opacity: opacity,
        draggable: true,
      };
      setShapes([...shapes, newRect]);
      setSelectedId(newRect.id);
    } else if (tool === "circle") {
      const newCircle = {
        id: generateId(),
        type: "circle",
        x: x,
        y: y,
        radius: 0,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        opacity: opacity,
        draggable: true,
      };
      setShapes([...shapes, newCircle]);
      setSelectedId(newCircle.id);
    } else if (tool === "text") {
      const newText = {
        id: generateId(),
        type: "text",
        x: x,
        y: y,
        text: "Double click to edit",
        fontSize: fontSize,
        fontFamily: fontFamily,
        fontStyle: fontStyle,
        align: textAlign,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        opacity: opacity,
        textDecoration: textDecoration,
        width: 200, // Width for text wrapping
        draggable: true,
      };
      setShapes([...shapes, newText]);
      setSelectedId(newText.id);

      // Immediately trigger text editing for new text objects
      setTimeout(() => {
        const textNode = document.getElementById(newText.id);
        if (textNode) {
          handleTextDblClick({ target: textNode }, newText.id);
        }
      }, 50);
    }
  };

  // Handle mouse move on canvas
  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const pos = stageRef.current.getPointerPosition();
    // Calculate position relative to current scale and position
    const x = (pos.x - stagePosition.x) / stageScale;
    const y = (pos.y - stagePosition.y) / stageScale;

    if (tool === "pen") {
      setPoints([...points, x, y]);
    } else if (tool === "rectangle") {
      const lastRect = shapes[shapes.length - 1];
      const newShapes = [...shapes];
      newShapes[shapes.length - 1] = {
        ...lastRect,
        width: x - lastRect.x,
        height: y - lastRect.y,
      };
      setShapes(newShapes);
    } else if (tool === "circle") {
      const lastCircle = shapes[shapes.length - 1];
      const dx = x - lastCircle.x;
      const dy = y - lastCircle.y;
      const radius = Math.sqrt(dx * dx + dy * dy);

      const newShapes = [...shapes];
      newShapes[shapes.length - 1] = {
        ...lastCircle,
        radius: radius,
      };
      setShapes(newShapes);
    }
  };

  // Handle mouse up on canvas
  const handleMouseUp = () => {
    setIsDrawing(false);

    if (tool === "pen" && points.length > 2) {
      const newLine = {
        id: generateId(),
        type: "line",
        points: points,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        opacity: opacity,
        draggable: true,
      };
      const newShapes = [...shapes, newLine];
      setShapes(newShapes);
      addToHistory(newShapes);
      setPoints([]);
    } else if (
      (tool === "rectangle" || tool === "circle" || tool === "text") &&
      shapes.length > 0
    ) {
      addToHistory([...shapes]);
    }
  };

  // Enhanced text editing function
  const handleTextDblClick = (e, id) => {
    const shape = shapes.find((s) => s.id === id);
    if (shape && shape.type === "text") {
      const textNode = e.target;

      const textPosition = textNode.absolutePosition();
      const stageBox = stageRef.current.container().getBoundingClientRect();

      const areaPosition = {
        x: stageBox.left + textPosition.x * stageScale + stagePosition.x,
        y: stageBox.top + textPosition.y * stageScale + stagePosition.y,
      };

      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);

      textarea.value = shape.text;
      textarea.style.position = "absolute";
      textarea.style.top = `${areaPosition.y}px`;
      textarea.style.left = `${areaPosition.x}px`;
      textarea.style.width = `${textNode.width() * stageScale}px`;
      textarea.style.height = `${Math.max(
        textNode.height() * stageScale,
        100
      )}px`;
      textarea.style.fontSize = `${shape.fontSize * stageScale}px`;
      textarea.style.border = "1px solid #999";
      textarea.style.padding = "5px";
      textarea.style.margin = "0px";
      textarea.style.overflow = "hidden";
      textarea.style.background = "white";
      textarea.style.outline = "none";
      textarea.style.resize = "both";
      textarea.style.lineHeight = textNode.lineHeight() || "normal";
      textarea.style.fontFamily = shape.fontFamily || "Arial";
      textarea.style.textAlign = shape.align || "left";
      textarea.style.color = shape.fill || "black";

      if (shape.fontStyle && shape.fontStyle.includes("bold")) {
        textarea.style.fontWeight = "bold";
      }
      if (shape.fontStyle && shape.fontStyle.includes("italic")) {
        textarea.style.fontStyle = "italic";
      }
      if (shape.textDecoration) {
        textarea.style.textDecoration = shape.textDecoration;
      }

      textarea.focus();

      let newWidth = textNode.width() * stageScale;
      let newHeight = textNode.height() * stageScale;

      textarea.addEventListener("input", function () {
        // Adjust height if text is larger than current area
        this.style.height = "auto";
        this.style.height = `${this.scrollHeight}px`;
        newHeight = this.scrollHeight / stageScale;
        newWidth = this.clientWidth / stageScale;
      });

      textarea.addEventListener("blur", function () {
        document.body.removeChild(textarea);

        const newText = textarea.value.trim() || "Text";

        const newShapes = shapes.map((s) => {
          if (s.id === id) {
            return {
              ...s,
              text: newText,
              width: newWidth,
              height: newHeight,
            };
          }
          return s;
        });

        setShapes(newShapes);
        addToHistory(newShapes);
      });
    }
  };

  // Handle shape drag end
  const handleDragEnd = (e, id) => {
    const newShapes = shapes.map((shape) => {
      if (shape.id === id) {
        return {
          ...shape,
          x: e.target.x(),
          y: e.target.y(),
        };
      }
      return shape;
    });
    setShapes(newShapes);
    addToHistory(newShapes);
  };

  // Handle shape transform end
  const handleTransformEnd = (e, id) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    const newShapes = shapes.map((shape) => {
      if (shape.id === id) {
        if (shape.type === "rectangle") {
          return {
            ...shape,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: Math.abs(node.width() * scaleX),
            height: Math.abs(node.height() * scaleY),
          };
        } else if (shape.type === "circle") {
          return {
            ...shape,
            x: node.x(),
            y: node.y(),
            radius: shape.radius * (scaleX > scaleY ? scaleX : scaleY),
          };
        } else if (shape.type === "text") {
          return {
            ...shape,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: node.width() * scaleX,
            fontSize: shape.fontSize * scaleY,
          };
        } else if (shape.type === "line") {
          const newPoints = [];
          for (let i = 0; i < shape.points.length; i += 2) {
            newPoints.push(shape.points[i] * scaleX);
            newPoints.push(shape.points[i + 1] * scaleY);
          }
          return {
            ...shape,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            points: newPoints,
          };
        } else if (shape.type === "image") {
          return {
            ...shape,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: node.width() * scaleX,
            height: node.height() * scaleY,
          };
        }
      }
      return shape;
    });

    setShapes(newShapes);
    addToHistory(newShapes);
  };

  // Handle property change for selected shape
  const handlePropertyChange = (property, value) => {
    if (!selectedId) return;

    const newShapes = shapes.map((shape) => {
      if (shape.id === selectedId) {
        return {
          ...shape,
          [property]: value,
        };
      }
      return shape;
    });

    setShapes(newShapes);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle shortcuts when typing in text fields
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      // Tool shortcuts
      if (e.key === "v" || e.key === "V") setTool("select");
      if (e.key === "p" || e.key === "P") setTool("pen");
      if (e.key === "r" || e.key === "R") setTool("rectangle");
      if (e.key === "c" || e.key === "C") setTool("circle");
      if (e.key === "t" || e.key === "T") setTool("text");

      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }

      // Delete
      if (e.key === "Delete" || e.key === "Backspace") {
        if (
          selectedId &&
          document.activeElement.tagName !== "INPUT" &&
          document.activeElement.tagName !== "TEXTAREA"
        ) {
          e.preventDefault();
          handleDelete();
        }
      }

      // Escape to deselect
      if (e.key === "Escape") {
        setSelectedId(null);
      }

      // Text formatting shortcuts
      if (selectedId) {
        const selectedShape = shapes.find((s) => s.id === selectedId);
        if (selectedShape && selectedShape.type === "text") {
          // Bold: Ctrl+B
          if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B")) {
            e.preventDefault();
            const currentStyle = selectedShape.fontStyle || "";
            const newStyle = currentStyle.includes("bold")
              ? currentStyle.replace("bold", "").trim()
              : `${currentStyle} bold`.trim();
            handlePropertyChange("fontStyle", newStyle);
          }

          // Italic: Ctrl+I
          if ((e.ctrlKey || e.metaKey) && (e.key === "i" || e.key === "I")) {
            e.preventDefault();
            const currentStyle = selectedShape.fontStyle || "";
            const newStyle = currentStyle.includes("italic")
              ? currentStyle.replace("italic", "").trim()
              : `${currentStyle} italic`.trim();
            handlePropertyChange("fontStyle", newStyle);
          }

          // Underline: Ctrl+U
          if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key === "U")) {
            e.preventDefault();
            const current = selectedShape.textDecoration || "";
            const newDecoration = current.includes("underline")
              ? ""
              : "underline";
            handlePropertyChange("textDecoration", newDecoration);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedId, historyStep, shapes]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (stageRef.current) {
        stageRef.current.width(window.innerWidth - 300);
        stageRef.current.height(window.innerHeight - 60);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Initialize drawing app
  useEffect(() => {
    // Save initial empty state to history
    addToHistory([]);
  }, []);

  // Undo/Redo functions
  const handleUndo = () => {
    if (historyStep > 1) {
      setHistoryStep(historyStep - 1);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length) {
      setHistoryStep(historyStep + 1);
    }
  };

  // Import SVG file with enhanced conversion to shapes
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setShowImportProgress(true);
      setImportProgress(10);

      const reader = new FileReader();

      reader.onload = async (event) => {
        const svgString = event.target.result;
        setImportProgress(30);

        // Parse SVG and convert to shapes
        const newShapes = await parseSvgString(
          svgString,
          (progress) => setImportProgress(30 + progress * 0.6),
          { offsetX: 50, offsetY: 50 }
        );

        setImportProgress(90);

        if (newShapes && newShapes.length > 0) {
          // Add all parsed shapes to the current shapes
          const combinedShapes = [...shapes, ...newShapes];
          setShapes(combinedShapes);
          addToHistory(combinedShapes);
        }

        setImportProgress(100);

        // Hide progress after 1.5 seconds
        setTimeout(() => {
          setShowImportProgress(false);
        }, 1500);

        // Reset file input so the same file can be selected again
        e.target.value = null;
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("Error importing SVG:", error);
      alert("Failed to import SVG. Please try a different file.");
      setShowImportProgress(false);
    }
  };

  const addToHistory = (newShapes) => {
    const newHistory = history.slice(0, historyStep);
    newHistory.push(newShapes);
    setHistory(newHistory);
    setHistoryStep(newHistory.length);
  };

  // Export canvas as image
  const handleExport = () => {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export as SVG
  const handleExportSVG = () => {
    exportSVG(shapes);
  };

  // Delete selected shape
  const handleDelete = () => {
    if (!selectedId) return;

    const newShapes = shapes.filter((shape) => shape.id !== selectedId);
    setShapes(newShapes);
    setSelectedId(null);
    addToHistory(newShapes);
  };

  return {
    tool,
    setTool,
    handleUndo,
    historyStep,
    handleRedo,
    setShowImportModal,
    history,
    fileUploadRef,
    handleFileUpload,
    handleExport,
    handleExportSVG,
    handleDelete,
    selectedId,
    stageScale,
    setStageScale,
    setSelectedId,
    handleDragEnd,
    handleTransformEnd,
    handleTextDblClick,
    getSelectedShape,
    fontFamily,
    handlePropertyChange,
    setFontFamily,
    fontSize,
    setFontSize,
    setFontStyle,
    setTextDecoration,
    setTextAlign,
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
    setOpacity,
    setStrokeColor,
    setStrokeWidth,
    showImportModal,
    importOptions,
    handleImportOptionsChange,
    showImportProgress,
    importProgress,
  };
};

export default useToolbarAction;
