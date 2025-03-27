import React from "react";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Line,
  Text,
  Transformer,
} from "react-konva";
import { Image as KonvaImage } from "react-konva";

const Shape = ({
  shape,
  setSelectedId,
  handleDragEnd,
  handleTransformEnd,
  handleTextDblClick,
}) => {
  switch (shape.type) {
    case "rectangle":
      return (
        <Rect
          key={shape.id}
          id={shape.id}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          fill={shape.fill}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          opacity={shape.opacity}
          draggable={shape.draggable}
          onClick={() => setSelectedId(shape.id)}
          onTap={() => setSelectedId(shape.id)}
          onDragEnd={(e) => handleDragEnd(e, shape.id)}
          onTransformEnd={(e) => handleTransformEnd(e, shape.id)}
        />
      );
    case "circle":
      return (
        <Circle
          key={shape.id}
          id={shape.id}
          x={shape.x}
          y={shape.y}
          radius={shape.radius}
          fill={shape.fill}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          opacity={shape.opacity}
          draggable={shape.draggable}
          onClick={() => setSelectedId(shape.id)}
          onTap={() => setSelectedId(shape.id)}
          onDragEnd={(e) => handleDragEnd(e, shape.id)}
          onTransformEnd={(e) => handleTransformEnd(e, shape.id)}
        />
      );
    case "line":
      return (
        <Line
          key={shape.id}
          id={shape.id}
          points={shape.points}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          opacity={shape.opacity}
          lineCap="round"
          lineJoin="round"
          closed={shape.closed}
          fill={shape.closed ? shape.fill || "transparent" : "transparent"}
          draggable={shape.draggable}
          onClick={() => setSelectedId(shape.id)}
          onTap={() => setSelectedId(shape.id)}
          onDragEnd={(e) => handleDragEnd(e, shape.id)}
          onTransformEnd={(e) => handleTransformEnd(e, shape.id)}
        />
      );
    case "text":
      return (
        <Text
          key={shape.id}
          id={shape.id}
          x={shape.x}
          y={shape.y}
          text={shape.text}
          fontSize={shape.fontSize}
          fontFamily={shape.fontFamily}
          fontStyle={shape.fontStyle}
          align={shape.align || "left"}
          width={shape.width || "auto"}
          fill={shape.fill}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          opacity={shape.opacity}
          textDecoration={shape.textDecoration}
          draggable={shape.draggable}
          onClick={() => setSelectedId(shape.id)}
          onTap={() => setSelectedId(shape.id)}
          onDblClick={(e) => handleTextDblClick(e, shape.id)}
          onDblTap={(e) => handleTextDblClick(e, shape.id)}
          onDragEnd={(e) => handleDragEnd(e, shape.id)}
          onTransformEnd={(e) => handleTransformEnd(e, shape.id)}
        />
      );
    case "image":
      return (
        <KonvaImage
          key={shape.id}
          id={shape.id}
          x={shape.x}
          y={shape.y}
          image={shape.image}
          width={shape.width}
          height={shape.height}
          opacity={shape.opacity}
          draggable={shape.draggable}
          onClick={() => setSelectedId(shape.id)}
          onTap={() => setSelectedId(shape.id)}
          onDragEnd={(e) => handleDragEnd(e, shape.id)}
          onTransformEnd={(e) => handleTransformEnd(e, shape.id)}
        />
      );
    default:
      return null;
  }
};

export default Shape;
