import React, { useState, useEffect } from 'react';
import { Delete, RotateCcw } from 'lucide-react';

export const GoogleCalculator = ({ initialExpression = '', initialResult = '' }) => {
  const [display, setDisplay] = useState(initialResult || '0');
  const [equation, setEquation] = useState(initialExpression || '');
  const [prevValue, setPrevValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  useEffect(() => {
    if (initialResult) {
      setDisplay(initialResult);
      setEquation(initialExpression ? `${initialExpression} =` : '');
    }
  }, [initialExpression, initialResult]);

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setEquation('');
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOp) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
      setEquation(`${inputValue} ${nextOp}`);
    } else if (operation) {
      const currentValue = prevValue || 0;
      let newValue = currentValue;

      if (operation === '+') newValue = currentValue + inputValue;
      else if (operation === '-') newValue = currentValue - inputValue;
      else if (operation === '×') newValue = currentValue * inputValue;
      else if (operation === '÷') newValue = inputValue !== 0 ? currentValue / inputValue : 'Error';
      else if (operation === '^') newValue = Math.pow(currentValue, inputValue);

      if (newValue === 'Error') {
        setDisplay('Error');
        setPrevValue(null);
        setOperation(null);
        setWaitingForOperand(true);
        return;
      }

      const formatted = Number.isInteger(newValue) ? String(newValue) : String(parseFloat(newValue.toFixed(6)));
      setDisplay(formatted);
      setPrevValue(parseFloat(formatted));
      setEquation(`${formatted} ${nextOp}`);
    }

    setWaitingForOperand(true);
    setOperation(nextOp);
  };

  const handleEquals = () => {
    if (operation === null || prevValue === null) return;
    const inputValue = parseFloat(display);
    let newValue = prevValue;

    if (operation === '+') newValue = prevValue + inputValue;
    else if (operation === '-') newValue = prevValue - inputValue;
    else if (operation === '×') newValue = prevValue * inputValue;
    else if (operation === '÷') newValue = inputValue !== 0 ? prevValue / inputValue : 'Error';
    else if (operation === '^') newValue = Math.pow(prevValue, inputValue);

    if (newValue === 'Error') {
      setDisplay('Error');
    } else {
      const formatted = Number.isInteger(newValue) ? String(newValue) : String(parseFloat(newValue.toFixed(6)));
      setEquation(`${prevValue} ${operation} ${inputValue} =`);
      setDisplay(formatted);
      setPrevValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const handleSqrt = () => {
    const val = parseFloat(display);
    if (val >= 0) {
      const res = Math.sqrt(val);
      const formatted = Number.isInteger(res) ? String(res) : String(parseFloat(res.toFixed(6)));
      setEquation(`√(${val}) =`);
      setDisplay(formatted);
      setWaitingForOperand(true);
    }
  };

  const handlePercent = () => {
    const val = parseFloat(display);
    const res = val / 100;
    setDisplay(String(res));
  };

  const handleToggleSign = () => {
    const val = parseFloat(display);
    setDisplay(String(-val));
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-zinc-900 border border-zinc-700/80 rounded-2xl p-4 shadow-xl mb-4">
      <div className="text-[11px] font-mono text-zinc-400 mb-1 flex items-center justify-between">
        <span>Google Calculator</span>
        <span className="text-[10px] text-zinc-500">In-Website Tool</span>
      </div>

      {/* Screen Display */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-right mb-3">
        <div className="h-4 text-[11px] font-mono text-zinc-400 overflow-hidden truncate">
          {equation || '\u00A0'}
        </div>
        <div className="text-2xl font-mono font-bold text-white tracking-tight overflow-hidden truncate">
          {display}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-1.5 font-mono text-sm">
        <button
          type="button"
          onClick={clearAll}
          className="py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-amber-400 font-bold transition-colors cursor-pointer"
        >
          AC
        </button>
        <button
          type="button"
          onClick={handleToggleSign}
          className="py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold transition-colors cursor-pointer"
        >
          ±
        </button>
        <button
          type="button"
          onClick={handlePercent}
          className="py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold transition-colors cursor-pointer"
        >
          %
        </button>
        <button
          type="button"
          onClick={() => performOperation('÷')}
          className="py-2.5 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white font-bold transition-colors cursor-pointer"
        >
          ÷
        </button>

        <button
          type="button"
          onClick={() => inputDigit(7)}
          className="py-2.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-100 font-bold transition-colors cursor-pointer"
        >
          7
        </button>
        <button
          type="button"
          onClick={() => inputDigit(8)}
          className="py-2.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-100 font-bold transition-colors cursor-pointer"
        >
          8
        </button>
        <button
          type="button"
          onClick={() => inputDigit(9)}
          className="py-2.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-100 font-bold transition-colors cursor-pointer"
        >
          9
        </button>
        <button
          type="button"
          onClick={() => performOperation('×')}
          className="py-2.5 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white font-bold transition-colors cursor-pointer"
        >
          ×
        </button>

        <button
          type="button"
          onClick={() => inputDigit(4)}
          className="py-2.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-100 font-bold transition-colors cursor-pointer"
        >
          4
        </button>
        <button
          type="button"
          onClick={() => inputDigit(5)}
          className="py-2.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-100 font-bold transition-colors cursor-pointer"
        >
          5
        </button>
        <button
          type="button"
          onClick={() => inputDigit(6)}
          className="py-2.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-100 font-bold transition-colors cursor-pointer"
        >
          6
        </button>
        <button
          type="button"
          onClick={() => performOperation('-')}
          className="py-2.5 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white font-bold transition-colors cursor-pointer"
        >
          −
        </button>

        <button
          type="button"
          onClick={() => inputDigit(1)}
          className="py-2.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-100 font-bold transition-colors cursor-pointer"
        >
          1
        </button>
        <button
          type="button"
          onClick={() => inputDigit(2)}
          className="py-2.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-100 font-bold transition-colors cursor-pointer"
        >
          2
        </button>
        <button
          type="button"
          onClick={() => inputDigit(3)}
          className="py-2.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-100 font-bold transition-colors cursor-pointer"
        >
          3
        </button>
        <button
          type="button"
          onClick={() => performOperation('+')}
          className="py-2.5 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white font-bold transition-colors cursor-pointer"
        >
          +
        </button>

        <button
          type="button"
          onClick={handleSqrt}
          className="py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold transition-colors cursor-pointer"
        >
          √
        </button>
        <button
          type="button"
          onClick={() => inputDigit(0)}
          className="py-2.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-100 font-bold transition-colors cursor-pointer"
        >
          0
        </button>
        <button
          type="button"
          onClick={inputDot}
          className="py-2.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-100 font-bold transition-colors cursor-pointer"
        >
          .
        </button>
        <button
          type="button"
          onClick={handleEquals}
          className="py-2.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-bold transition-colors cursor-pointer shadow-sm"
        >
          =
        </button>
      </div>
    </div>
  );
};
