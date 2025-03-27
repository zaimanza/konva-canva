// SVGHelper.jsx - Enhanced SVG import and export utility
import React from "react";

// Parse SVG string to create editable shapes
export const parseSvgString = async (
  svgString,
  progressCallback,
  options = {}
) => {
  // Default options
  const defaultOptions = {
    offsetX: 0,
    offsetY: 0,
    maintainAspectRatio: true,
  };

  const opts = { ...defaultOptions, ...options };

  return new Promise((resolve, reject) => {
    try {
      // Create a DOMParser to parse the SVG string
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgString, "image/svg+xml");

      // Check for parsing errors
      const parserError = svgDoc.querySelector("parsererror");
      if (parserError) {
        reject(new Error("SVG parsing error"));
        return;
      }

      const svgElement = svgDoc.documentElement;

      // Get SVG dimensions and viewBox
      let width = parseFloat(svgElement.getAttribute("width") || 100);
      let height = parseFloat(svgElement.getAttribute("height") || 100);
      let viewBox = svgElement.getAttribute("viewBox");

      // Parse viewBox values
      let viewBoxX = 0;
      let viewBoxY = 0;
      let viewBoxWidth = width;
      let viewBoxHeight = height;

      if (viewBox) {
        const viewBoxValues = viewBox.split(/[\s,]+/).map(parseFloat);
        if (viewBoxValues.length === 4) {
          viewBoxX = viewBoxValues[0];
          viewBoxY = viewBoxValues[1];
          viewBoxWidth = viewBoxValues[2];
          viewBoxHeight = viewBoxValues[3];

          // If width/height not specified, use viewBox dimensions
          if (!svgElement.hasAttribute("width")) width = viewBoxWidth;
          if (!svgElement.hasAttribute("height")) height = viewBoxHeight;
        }
      }

      // Calculate scale factors
      const scaleX = width / viewBoxWidth;
      const scaleY = height / viewBoxHeight;

      // Create array to store all shapes
      const shapes = [];

      // Function to calculate position based on SVG coordinates
      const convertX = (x) =>
        opts.offsetX + (parseFloat(x) - viewBoxX) * scaleX;
      const convertY = (y) =>
        opts.offsetY + (parseFloat(y) - viewBoxY) * scaleY;

      // Function to generate a unique ID
      const generateId = () => Math.random().toString(36).substring(2, 9);

      // Helper to extract fill, stroke, etc. from SVG elements
      const extractStyle = (element) => {
        const style = {
          fill: element.getAttribute("fill") || "transparent",
          stroke: element.getAttribute("stroke") || "#000000",
          strokeWidth:
            parseFloat(element.getAttribute("stroke-width") || 1) *
            Math.min(scaleX, scaleY),
          opacity: parseFloat(element.getAttribute("opacity") || 1),
        };

        // Handle 'none' values
        if (style.fill === "none") style.fill = "transparent";
        if (style.stroke === "none") style.stroke = "transparent";

        // Handle style attribute (overrides individual attributes)
        const styleAttr = element.getAttribute("style");
        if (styleAttr) {
          const styleProps = styleAttr.split(";");
          styleProps.forEach((prop) => {
            const [name, value] = prop.split(":").map((s) => s.trim());
            if (name === "fill")
              style.fill = value === "none" ? "transparent" : value;
            if (name === "stroke")
              style.stroke = value === "none" ? "transparent" : value;
            if (name === "stroke-width")
              style.strokeWidth = parseFloat(value) * Math.min(scaleX, scaleY);
            if (name === "opacity") style.opacity = parseFloat(value);
          });
        }

        return style;
      };

      // Parse transform attribute
      const parseTransform = (transformAttr) => {
        if (!transformAttr) return { rotation: 0 };

        let rotation = 0;

        // Match rotation transform
        const rotateMatch = transformAttr.match(
          /rotate\s*\(\s*([^,)]+)[,\s]*([^,)]+)?[,\s]*([^,)]+)?\s*\)/
        );
        if (rotateMatch) {
          rotation = parseFloat(rotateMatch[1]) || 0;
        }

        return { rotation };
      };

      // 1. Process rectangles
      const rectangles = svgElement.querySelectorAll("rect");
      rectangles.forEach((rect, index) => {
        const style = extractStyle(rect);
        const transform = parseTransform(rect.getAttribute("transform"));

        const x = parseFloat(rect.getAttribute("x") || 0);
        const y = parseFloat(rect.getAttribute("y") || 0);
        const width = parseFloat(rect.getAttribute("width") || 0);
        const height = parseFloat(rect.getAttribute("height") || 0);

        shapes.push({
          id: generateId(),
          type: "rectangle",
          x: convertX(x),
          y: convertY(y),
          width: width * scaleX,
          height: height * scaleY,
          fill: style.fill,
          stroke: style.stroke,
          strokeWidth: style.strokeWidth,
          opacity: style.opacity,
          rotation: transform.rotation,
          draggable: true,
        });
      });

      progressCallback && progressCallback(10);

      // 2. Process circles
      const circles = svgElement.querySelectorAll("circle");
      circles.forEach((circle, index) => {
        const style = extractStyle(circle);
        const transform = parseTransform(circle.getAttribute("transform"));

        const cx = parseFloat(circle.getAttribute("cx") || 0);
        const cy = parseFloat(circle.getAttribute("cy") || 0);
        const r = parseFloat(circle.getAttribute("r") || 0);

        shapes.push({
          id: generateId(),
          type: "circle",
          x: convertX(cx),
          y: convertY(cy),
          radius: r * Math.min(scaleX, scaleY),
          fill: style.fill,
          stroke: style.stroke,
          strokeWidth: style.strokeWidth,
          opacity: style.opacity,
          rotation: transform.rotation,
          draggable: true,
        });
      });

      progressCallback && progressCallback(20);

      // 3. Process ellipses (convert to circles)
      const ellipses = svgElement.querySelectorAll("ellipse");
      ellipses.forEach((ellipse, index) => {
        const style = extractStyle(ellipse);
        const transform = parseTransform(ellipse.getAttribute("transform"));

        const cx = parseFloat(ellipse.getAttribute("cx") || 0);
        const cy = parseFloat(ellipse.getAttribute("cy") || 0);
        const rx = parseFloat(ellipse.getAttribute("rx") || 0);
        const ry = parseFloat(ellipse.getAttribute("ry") || 0);

        // Average radius for simple conversion to circle
        const avgRadius = (rx * scaleX + ry * scaleY) / 2;

        shapes.push({
          id: generateId(),
          type: "circle",
          x: convertX(cx),
          y: convertY(cy),
          radius: avgRadius,
          fill: style.fill,
          stroke: style.stroke,
          strokeWidth: style.strokeWidth,
          opacity: style.opacity,
          rotation: transform.rotation,
          draggable: true,
        });
      });

      progressCallback && progressCallback(30);

      // 4. Process lines
      const lines = svgElement.querySelectorAll("line");
      lines.forEach((line, index) => {
        const style = extractStyle(line);
        const transform = parseTransform(line.getAttribute("transform"));

        const x1 = parseFloat(line.getAttribute("x1") || 0);
        const y1 = parseFloat(line.getAttribute("y1") || 0);
        const x2 = parseFloat(line.getAttribute("x2") || 0);
        const y2 = parseFloat(line.getAttribute("y2") || 0);

        shapes.push({
          id: generateId(),
          type: "line",
          points: [convertX(x1), convertY(y1), convertX(x2), convertY(y2)],
          fill: "transparent",
          stroke: style.stroke,
          strokeWidth: style.strokeWidth,
          opacity: style.opacity,
          closed: false,
          rotation: transform.rotation,
          draggable: true,
        });
      });

      progressCallback && progressCallback(40);

      // 5. Process polylines
      const polylines = svgElement.querySelectorAll("polyline");
      polylines.forEach((polyline, index) => {
        const style = extractStyle(polyline);
        const transform = parseTransform(polyline.getAttribute("transform"));

        const pointsString = polyline.getAttribute("points");
        if (pointsString) {
          const pointPairs = pointsString.trim().split(/[\s,]+/);
          const points = [];

          for (let i = 0; i < pointPairs.length; i += 2) {
            if (i + 1 < pointPairs.length) {
              points.push(convertX(pointPairs[i]), convertY(pointPairs[i + 1]));
            }
          }

          if (points.length >= 4) {
            shapes.push({
              id: generateId(),
              type: "line",
              points: points,
              fill: "transparent",
              stroke: style.stroke,
              strokeWidth: style.strokeWidth,
              opacity: style.opacity,
              closed: false,
              rotation: transform.rotation,
              draggable: true,
            });
          }
        }
      });

      progressCallback && progressCallback(50);

      // 6. Process polygons
      const polygons = svgElement.querySelectorAll("polygon");
      polygons.forEach((polygon, index) => {
        const style = extractStyle(polygon);
        const transform = parseTransform(polygon.getAttribute("transform"));

        const pointsString = polygon.getAttribute("points");
        if (pointsString) {
          const pointPairs = pointsString.trim().split(/[\s,]+/);
          const points = [];

          for (let i = 0; i < pointPairs.length; i += 2) {
            if (i + 1 < pointPairs.length) {
              points.push(convertX(pointPairs[i]), convertY(pointPairs[i + 1]));
            }
          }

          if (points.length >= 4) {
            shapes.push({
              id: generateId(),
              type: "line",
              points: points,
              fill: style.fill,
              stroke: style.stroke,
              strokeWidth: style.strokeWidth,
              opacity: style.opacity,
              closed: true, // Polygon is closed
              rotation: transform.rotation,
              draggable: true,
            });
          }
        }
      });

      progressCallback && progressCallback(60);

      // 7. Process texts
      const texts = svgElement.querySelectorAll("text");
      texts.forEach((text, index) => {
        const style = extractStyle(text);
        const transform = parseTransform(text.getAttribute("transform"));

        const x = parseFloat(text.getAttribute("x") || 0);
        const y = parseFloat(text.getAttribute("y") || 0);
        const textContent = text.textContent || "Text";

        // Text specific properties
        let fontSize = parseFloat(text.getAttribute("font-size") || 16);
        if (isNaN(fontSize)) fontSize = 16;

        const fontFamily = text.getAttribute("font-family") || "Arial";

        // Handle text styling
        let fontStyle = "";
        if (text.getAttribute("font-weight") === "bold") {
          fontStyle += "bold ";
        }
        if (text.getAttribute("font-style") === "italic") {
          fontStyle += "italic ";
        }

        // Text alignment
        const textAnchor = text.getAttribute("text-anchor");
        let align = "left";
        if (textAnchor === "middle") align = "center";
        if (textAnchor === "end") align = "right";

        // Text decoration
        let textDecoration = "";
        if (text.getAttribute("text-decoration") === "underline") {
          textDecoration = "underline";
        }

        shapes.push({
          id: generateId(),
          type: "text",
          x: convertX(x),
          y: convertY(y),
          text: textContent,
          fontSize: fontSize * Math.min(scaleX, scaleY),
          fontFamily: fontFamily,
          fontStyle: fontStyle.trim(),
          align: align,
          width: 200, // Default width for text wrapping
          fill: style.fill,
          stroke: style.stroke,
          strokeWidth: style.strokeWidth,
          opacity: style.opacity,
          textDecoration: textDecoration,
          rotation: transform.rotation,
          draggable: true,
        });
      });

      progressCallback && progressCallback(70);

      // 8. Process paths
      const paths = svgElement.querySelectorAll("path");
      paths.forEach((path, index) => {
        const style = extractStyle(path);
        const transform = parseTransform(path.getAttribute("transform"));

        const d = path.getAttribute("d");
        if (d) {
          // Convert SVG path to points
          const points = pathToPoints(d, convertX, convertY);

          if (points.length >= 4) {
            // Check if path is closed
            const isClosed = d.trim().toLowerCase().endsWith("z");

            shapes.push({
              id: generateId(),
              type: "line",
              points: points,
              fill: isClosed ? style.fill : "transparent",
              stroke: style.stroke,
              strokeWidth: style.strokeWidth,
              opacity: style.opacity,
              closed: isClosed,
              rotation: transform.rotation,
              draggable: true,
            });
          }
        }
      });

      progressCallback && progressCallback(90);

      // Add optional image for reference (the original SVG)
      if (options.addReferenceImage) {
        const image = new Image();
        image.src = "data:image/svg+xml;base64," + btoa(svgString);

        // Wait for image to load
        image.onload = () => {
          shapes.push({
            id: generateId(),
            type: "image",
            x: opts.offsetX,
            y: opts.offsetY,
            width: width,
            height: height,
            image: image,
            opacity: 0.2, // Transparent for reference
            draggable: true,
          });

          progressCallback && progressCallback(100);
          resolve(shapes);
        };

        image.onerror = () => {
          // Just resolve with the shapes we have if image loading fails
          progressCallback && progressCallback(100);
          resolve(shapes);
        };
      } else {
        progressCallback && progressCallback(100);
        resolve(shapes);
      }
    } catch (error) {
      reject(error);
    }
  });
};

// Function to convert SVG path commands to points
const pathToPoints = (pathString, convertX, convertY) => {
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
            points.push(convertX(currentX), convertY(currentY));

            // Handle additional point pairs in the same command
            for (let i = 2; i < values.length; i += 2) {
              if (i + 1 < values.length) {
                if (isRelative) {
                  currentX += values[i];
                  currentY += values[i + 1];
                } else {
                  currentX = values[i];
                  currentY = values[i + 1];
                }
                points.push(convertX(currentX), convertY(currentY));
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
              points.push(convertX(currentX), convertY(currentY));
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
            points.push(convertX(currentX), convertY(currentY));
          }
          break;

        case "V": // Vertical Line
          for (const value of values) {
            if (isRelative) {
              currentY += value;
            } else {
              currentY = value;
            }
            points.push(convertX(currentX), convertY(currentY));
          }
          break;

        case "Z": // Close Path
          // Add the starting point to close the path
          if (
            points.length >= 2 &&
            (currentX !== startX || currentY !== startY)
          ) {
            points.push(convertX(startX), convertY(startY));
          }
          break;

        // Note: We're not handling complex curves (C, S, Q, T, A) in this simplified implementation
      }
    }

    return points;
  } catch (error) {
    console.error("Error parsing path:", error);
    return [];
  }
};

// Convert Konva shapes back to SVG format
export const konvaToSVG = (shapes) => {
  let svgContent = "";

  shapes.forEach((shape) => {
    switch (shape.type) {
      case "rectangle":
        svgContent += `<rect 
          x="${shape.x}" 
          y="${shape.y}" 
          width="${shape.width}" 
          height="${shape.height}" 
          fill="${shape.fill}" 
          stroke="${shape.stroke}" 
          stroke-width="${shape.strokeWidth}"
          opacity="${shape.opacity}"
          ${
            shape.rotation
              ? `transform="rotate(${shape.rotation} ${
                  shape.x + shape.width / 2
                } ${shape.y + shape.height / 2})"`
              : ""
          }
        />`;
        break;

      case "circle":
        svgContent += `<circle 
          cx="${shape.x}" 
          cy="${shape.y}" 
          r="${shape.radius}" 
          fill="${shape.fill}" 
          stroke="${shape.stroke}" 
          stroke-width="${shape.strokeWidth}"
          opacity="${shape.opacity}"
        />`;
        break;

      case "line":
        const points = shape.points
          .map((p, i) => (i % 2 === 0 ? `${p},` : p))
          .join(" ");
        if (shape.closed) {
          svgContent += `<polygon 
            points="${points}" 
            fill="${shape.fill || "none"}" 
            stroke="${shape.stroke}" 
            stroke-width="${shape.strokeWidth}"
            opacity="${shape.opacity}"
          />`;
        } else {
          svgContent += `<polyline 
            points="${points}" 
            fill="none" 
            stroke="${shape.stroke}" 
            stroke-width="${shape.strokeWidth}"
            opacity="${shape.opacity}"
          />`;
        }
        break;

      case "text":
        // Handle text style attributes
        const fontStyle = [];
        if (shape.fontStyle?.includes("bold"))
          fontStyle.push('font-weight="bold"');
        if (shape.fontStyle?.includes("italic"))
          fontStyle.push('font-style="italic"');

        // Handle text alignment
        let textAnchor = "start";
        if (shape.align === "center") textAnchor = "middle";
        if (shape.align === "right") textAnchor = "end";

        svgContent += `<text 
          x="${shape.x}" 
          y="${shape.y}" 
          font-family="${shape.fontFamily}" 
          font-size="${shape.fontSize}"
          ${fontStyle.join(" ")}
          text-anchor="${textAnchor}"
          ${
            shape.textDecoration
              ? `text-decoration="${shape.textDecoration}"`
              : ""
          }
          fill="${shape.fill}" 
          stroke="${shape.stroke}" 
          stroke-width="${shape.strokeWidth}"
          opacity="${shape.opacity}"
          ${
            shape.rotation
              ? `transform="rotate(${shape.rotation} ${shape.x} ${shape.y})"`
              : ""
          }
        >${shape.text}</text>`;
        break;

      // Skip image types
      case "image":
        // We don't export images to SVG
        break;

      default:
        break;
    }
  });

  // Create full SVG document
  const svgDocument = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  ${svgContent}
</svg>`;

  return svgDocument;
};

// Export Konva shapes as SVG file
export const exportSVG = (shapes) => {
  const svgContent = konvaToSVG(shapes);

  // Create downloadable file
  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.download = "drawing.svg";
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default {
  parseSvgString,
  konvaToSVG,
  exportSVG,
};
