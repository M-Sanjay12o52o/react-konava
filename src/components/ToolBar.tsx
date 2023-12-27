import "../ToolOptions.css";

const ToolBar = ({ tool, handleToolChange, handleUndo, handleRedo }: any) => {
  return (
    <div className="tool-options">
      <div className="tool-icons">
        <button
          className={`tool-icon ${tool === "pen" ? "active" : ""}`}
          onClick={() => handleToolChange("pen")}
        >
          Pen
        </button>
        <button
          className={`tool-icon ${tool === "text" ? "active" : ""}`}
          onClick={() => handleToolChange("text")}
        >
          Text
        </button>
        <button
          className={`tool-icon ${tool === "eraser" ? "active" : ""}`}
          onClick={() => handleToolChange("eraser")}
        >
          Eraser
        </button>
      </div>
      <div className="tool-actions">
        <button onClick={handleUndo}>Undo</button>
        <button onClick={handleRedo}>Redo</button>
      </div>
    </div>
  );
};

export default ToolBar;
