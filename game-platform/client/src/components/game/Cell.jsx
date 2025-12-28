function Cell({ value, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-24 h-24 text-4xl font-bold rounded-lg transition
        ${!disabled ? 'hover:bg-gray-600 cursor-pointer' : 'cursor-not-allowed'}
        ${value === 'X' ? 'text-blue-400' : value === 'O' ? 'text-red-400' : ''}
        ${disabled ? 'bg-gray-700' : 'bg-gray-600'}
      `}
    >
      {value}
    </button>
  );
}

export default Cell;