import Cell from './Cell';

function Board({ board, onCellClick, disabled = false }) {
  return (
    <div className="inline-block bg-gray-800 p-2 rounded-lg shadow-2xl">
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, index) => (
          <Cell
            key={index}
            value={cell}
            onClick={() => onCellClick(index)}
            disabled={disabled || cell !== null}
          />
        ))}
      </div>
    </div>
  );
}

export default Board;