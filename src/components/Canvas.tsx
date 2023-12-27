import React, { useRef } from "react";
import { Stage, Layer, Line, Text } from "react-konva";

type Tool = "pen" | "eraser";

interface LineData {
  tool: Tool;
  points: number[];
}

export const Canvas: React.FC = () => {
  const [tool, setTool] = React.useState<Tool>("pen");
  const [lines, setLines] = React.useState<LineData[]>([]);
  const isDrawing = useRef(false);
  const history = useRef<LineData[][]>([]);
  const historyStep = useRef<number>(-1);

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
    lastLine.points = lastLine.points.concat([point!.x, point!.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines([...lines]);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  return (
    <div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          <Text text="Just start drawing" x={5} y={30} />
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
        </Layer>
      </Stage>
      <select
        value={tool}
        onChange={(e) => {
          setTool(e.target.value as Tool);
        }}
      >
        <option value="pen">Pen</option>
        <option value="eraser">Eraser</option>
      </select>
      <button onClick={handleUndo}>Undo</button>
      <button onClick={handleRedo}>Redo</button>
    </div>
  );
};
