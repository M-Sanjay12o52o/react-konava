import React, { useEffect, useRef } from "react";
import { Stage, Layer, Line, Text, Circle, Rect } from "react-konva";
import ToolBar from "./ToolBar";

type Tool = "pen" | "eraser" | "text" | "circle" | "rectangle";

interface LineData {
  tool: Tool;
  points: number[];
}
export const Canvas: React.FC = () => {
  const [tool, setTool] = React.useState<Tool>("pen");
  const [lines, setLines] = React.useState<LineData[]>([]);
  const [text, setText] = React.useState<string>("");
  const isDrawing = useRef(false);
  const history = useRef<LineData[][]>([]);
  const historyStep = useRef<number>(-1);
  const [shapes, setShapes] = React.useState<any[]>([]);

  const [isDragging, setIsDragging] = React.useState(false);
  const [draggedTextPosition, setDraggedTextPosition] = React.useState({
    x: 100,
    y: 100,
  });

  console.log("tool: ", tool);

  const handleDrawCircle = () => {
    const canvasCenterX = window.innerWidth / 2;
    const canvasCenterY = window.innerHeight / 2;

    const newCircle = {
      type: "circle",
      x: canvasCenterX,
      y: canvasCenterY,
      radius: 50,
      fill: "green",
      draggable: true,
    };
    setShapes([...shapes, newCircle]);
  };

  const handleDrawRect = () => {
    const canvasCenterX = window.innerWidth / 2;
    const canvasCenterY = window.innerHeight / 2;

    const newRect = {
      type: "rectangle",
      x: canvasCenterX - 50,
      y: canvasCenterY - 25,
      width: 100,
      height: 50,
      fill: "blue",
      draggable: true,
    };
    setShapes([...shapes, newRect]);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const pos = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - pos.left;
    const clickY = e.clientY - pos.top;

    if (tool === "text") {
      setText("");
      setDraggedTextPosition({ x: clickX, y: clickY });
    } else if (tool === "circle") {
      handleDrawCircle(); // Call function to draw circle
    } else if (tool === "rectangle") {
      handleDrawRect(); // Call function to draw rectangle
    } else if (tool === "pen" && isDrawing.current) {
      const updatedLines = [...lines];
      const lastLine = updatedLines[updatedLines.length - 1];
      lastLine.points = lastLine.points.concat([clickX, clickY]);
      setLines(updatedLines);
    }
  };

  const saveToHistory = () => {
    history.current.splice(historyStep.current + 1);
    history.current.push([...lines]);
    historyStep.current += 1;
  };

  const handleUndo = () => {
    if (historyStep.current > 0) {
      historyStep.current -= 1;
      setLines([...history.current[historyStep.current]]);
    }
  };

  const handleRedo = () => {
    if (historyStep.current < history.current.length - 1) {
      historyStep.current += 1;
      setLines([...history.current[historyStep.current]]);
    }
  };

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    saveToHistory();
    setLines([...lines, { tool, points: [pos!.x, pos!.y] }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) {
      return;
    }

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];

    if (tool === "pen" || tool === "eraser") {
      lastLine.points = lastLine.points.concat([point!.x, point!.y]);
      lines.splice(lines.length - 1, 1, lastLine);
      setLines([...lines]);
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (tool === "text") {
        const isAlphanumeric = /^[a-zA-Z0-9\s]+$/;
        if (isAlphanumeric.test(e.key)) {
          setText((prevText) => prevText + e.key);
        } else if (e.key === "Backspace") {
          setText((prevText) => prevText.slice(0, -1));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [tool]);

  return (
    <div onClick={handleCanvasClick}>
      <ToolBar
        tool={tool}
        handleToolChange={setTool}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        handleDrawCircle={handleDrawCircle}
        handleDrawRect={handleDrawRect}
      />
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          <Text
            text={text}
            x={draggedTextPosition.x}
            y={draggedTextPosition.y}
            fontSize={48}
            draggable
            onDragStart={() => {
              setIsDragging(true);
            }}
            onDragEnd={(e) => {
              setIsDragging(false);
              setDraggedTextPosition({ x: e.target.x(), y: e.target.y() });
            }}
          />
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="#df4b26"
              strokeWidth={5}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === "eraser" ? "destination-out" : "source-over"
              }
            />
          ))}
          {/* handling shapes */}
          {shapes.map((shape, i) => {
            if (shape.type === "circle") {
              return (
                <Circle
                  key={i}
                  x={shape.x}
                  y={shape.y}
                  radius={shape.radius}
                  // fill={shape.fill}
                  draggable={shape.draggable}
                  stroke={"white"}
                />
              );
            } else if (shape.type === "rectangle") {
              return (
                <Rect
                  key={i}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  // fill={shape.fill}
                  draggable={shape.draggable}
                  stroke={"white"}
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
      {/* <select
        value={tool}
        onChange={(e) => {
          setTool(e.target.value as Tool);
        }}
      >
        <option value="pen">Pen</option>
        <option value="text">Text</option>
        <option value="eraser">Eraser</option>
      </select> */}
      {/* <button onClick={handleUndo}>Undo</button>
      <button onClick={handleRedo}>Redo</button> */}
    </div>
  );
};
