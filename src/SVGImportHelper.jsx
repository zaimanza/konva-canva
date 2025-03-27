// SVGImportHelper.jsx - Enhanced SVG Import Functionality
import React, { useState, useEffect } from "react";

// Convert SVG path commands to Konva points
export const pathToPoints = (pathString) => {
  if (!pathString) return [];

  try {
    const commands =
      pathString.match(/[MLHVCSQTAZmlhvcsqtaz][^MLHVCSQTAZmlhvcsqtaz]*/g) || [];
    const points = [];
    let currentX = 0;
    let currentY = 0;
    let startX = 0;
    let startY = 0;

    for (const cmd of commands) {
      const type = cmd[0];
      const isRelative = type.toLowerCase() === type;
      const values = cmd
        .substring(1)
        .trim()
        .split(/[\s,]+/)
        .map(parseFloat);

      switch (type.toUpperCase()) {
        case "M": // Move To
          if (values.length >= 2) {
            if (isRelative) {
              currentX += values[0];
              currentY += values[1];
            } else {
              currentX = values[0];
              currentY = values[1];
            }
            startX = currentX;
            startY = currentY;
            points.push(currentX, currentY);

            // Handle additional point pairs in the same command (treated as Line To)
            for (let i = 2; i < values.length; i += 2) {
              if (i + 1 < values.length) {
                if (isRelative) {
                  currentX += values[i];
                  currentY += values[i + 1];
                } else {
                  currentX = values[i];
                  currentY = values[i + 1];
                }
                points.push(currentX, currentY);
              }
            }
          }
          break;

        case "L": // Line To
          for (let i = 0; i < values.length; i += 2) {
            if (i + 1 < values.length) {
              if (isRelative) {
                currentX += values[i];
                currentY += values[i + 1];
              } else {
                currentX = values[i];
                currentY = values[i + 1];
              }
              points.push(currentX, currentY);
            }
          }
          break;

        case "H": // Horizontal Line
          for (const value of values) {
            if (isRelative) {
              currentX += value;
            } else {
              currentX = value;
            }
            points.push(currentX, currentY);
          }
          break;

        case "V": // Vertical Line
          for (const value of values) {
            if (isRelative) {
              currentY += value;
            } else {
              currentY = value;
            }
            points.push(currentX, currentY);
          }
          break;

        case "Z": // Close Path
          // Add the starting point to close the path
          if (
            points.length >= 2 &&
            (currentX !== startX || currentY !== startY)
          ) {
            points.push(startX, startY);
          }
          break;

        // Note: More complex commands like curves would need additional handling
        // For simplicity, we're focusing on the basic commands
      }
    }

    return points;
  } catch (error) {
    console.error("Error parsing path:", error);
    return [];
  }
};

// Parse SVG transform attribute
export const parseTransform = (transformString) => {
  if (!transformString)
    return { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 };

  const result = { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 };

  // Match transform operations like translate(10, 20) or rotate(45)
  const transformRegex = /(translate|rotate|scale|matrix)\s*\(([^)]*)\)/g;
  let match;

  while ((match = transformRegex.exec(transformString)) !== null) {
    const operation = match[1];
    const values = match[2].split(/[\s,]+/).map(parseFloat);

    switch (operation) {
      case "translate":
        if (values.length >= 1) result.x += values[0];
        if (values.length >= 2) result.y += values[1];
        break;

      case "rotate":
        if (values.length >= 1) result.rotation += values[0];
        break;

      case "scale":
        if (values.length >= 1) result.scaleX *= values[0];
        if (values.length >= 2) result.scaleY *= values[1];
        else if (values.length === 1) result.scaleY *= values[0]; // If only one value, apply to both
        break;

      case "matrix":
        // SVG matrix: [a, b, c, d, e, f]
        // where a, b, c, d are the scale and rotation components and e, f are the translation
        if (values.length === 6) {
          const a = values[0];
          const b = values[1];
          const c = values[2];
          const d = values[3];

          // Translation
          result.x += values[4];
          result.y += values[5];

          // Scale and rotation would need more complex math to extract
          // For simplicity, we're skipping these extractions
        }
        break;
    }
  }

  return result;
};

// Expand CSS color names to hex values
export const expandColorNames = (color) => {
  if (!color) return "transparent";
  if (color === "none") return "transparent";

  // Handle color names mapping to hex values
  const colorMap = {
    black: "#000000",
    silver: "#c0c0c0",
    gray: "#808080",
    white: "#ffffff",
    maroon: "#800000",
    red: "#ff0000",
    purple: "#800080",
    fuchsia: "#ff00ff",
    green: "#008000",
    lime: "#00ff00",
    olive: "#808000",
    yellow: "#ffff00",
    navy: "#000080",
    blue: "#0000ff",
    teal: "#008080",
    aqua: "#00ffff",
    // Add more colors as needed
  };

  return colorMap[color.toLowerCase()] || color;
};

// SVG Import Progress Component
export const SVGImportProgress = ({ progress, status, onComplete }) => {
  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  return (
    <div className="import-progress">
      <h4>Importing SVG</h4>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="status">{status}</div>
    </div>
  );
};

// Export SVG Import Progress component and utility functions
export default {
  pathToPoints,
  parseTransform,
  expandColorNames,
  SVGImportProgress,
};
