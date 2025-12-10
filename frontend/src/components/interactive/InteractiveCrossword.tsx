'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Badge } from '@/components/ui';
import { CheckCircle, HelpCircle, ArrowRight, ArrowDown } from 'lucide-react';

interface InteractiveCrosswordProps {
  content: any;
  onComplete: (answers: any) => void;
  isSubmitted: boolean;
}

interface CellData {
  letter: string;
  number?: number;
  isBlack: boolean;
  acrossClueNum?: number;
  downClueNum?: number;
}

export function InteractiveCrossword({ content, onComplete, isSubmitted }: InteractiveCrosswordProps) {
  // Manejar dos formatos de clues
  let across: any[] = [];
  let down: any[] = [];

  if (Array.isArray(content.clues)) {
    across = content.clues.filter((c: any) => c.type === 'across').map((c: any) => ({
      ...c,
      clue: c.text || c.clue
    }));
    down = content.clues.filter((c: any) => c.type === 'down').map((c: any) => ({
      ...c,
      clue: c.text || c.clue
    }));
  } else {
    const clues = content.clues || {};
    across = clues.across || [];
    down = clues.down || [];
  }

  // Crear cuadrícula basada en las palabras
  const createGrid = () => {
    const gridSize = 20;
    const grid: CellData[][] = Array(gridSize).fill(null).map(() =>
      Array(gridSize).fill(null).map(() => ({ letter: '', isBlack: true }))
    );

    let currentRow = 2;
    let currentCol = 2;

    // Colocar palabras horizontales
    across.forEach((clue: any, index: number) => {
      const word = clue.answer.toUpperCase();
      const row = currentRow + index * 3;
      const col = 2;

      for (let i = 0; i < word.length; i++) {
        if (row < gridSize && col + i < gridSize) {
          grid[row][col + i] = {
            letter: '',
            number: i === 0 ? clue.number : undefined,
            isBlack: false,
            acrossClueNum: clue.number
          };
        }
      }
    });

    // Colocar palabras verticales con cruces inteligentes
    down.forEach((clue: any, index: number) => {
      const word = clue.answer.toUpperCase();
      const col = 5 + index * 4;
      let row = 1;

      for (let i = 0; i < word.length; i++) {
        if (row + i < gridSize && col < gridSize) {
          const cell = grid[row + i][col];
          if (cell.isBlack) {
            grid[row + i][col] = {
              letter: '',
              number: i === 0 ? clue.number : undefined,
              isBlack: false,
              downClueNum: clue.number
            };
          } else {
            // Ya existe celda, agregar referencia a pista vertical
            grid[row + i][col].downClueNum = clue.number;
            if (i === 0 && !grid[row + i][col].number) {
              grid[row + i][col].number = clue.number;
            }
          }
        }
      }
    });

    return grid;
  };

  const [grid, setGrid] = useState<CellData[][]>(createGrid());
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [selectedClue, setSelectedClue] = useState<any>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  useEffect(() => {
    const gridSize = grid.length;
    inputRefs.current = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
  }, [grid.length]);

  useEffect(() => {
    const answers: any = {};
    across.forEach((clue: any) => {
      answers[`across-${clue.number}`] = getUserAnswer(clue.number, 'across');
    });
    down.forEach((clue: any) => {
      answers[`down-${clue.number}`] = getUserAnswer(clue.number, 'down');
    });
    onComplete(answers);
  }, [grid]);

  const getUserAnswer = (clueNum: number, dir: 'across' | 'down') => {
    let answer = '';
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const cell = grid[row][col];
        if (dir === 'across' && cell.acrossClueNum === clueNum) {
          answer += cell.letter || '_';
        } else if (dir === 'down' && cell.downClueNum === clueNum) {
          answer += cell.letter || '_';
        }
      }
    }
    return answer.replace(/_+$/, '');
  };

  const handleCellClick = (row: number, col: number) => {
    if (isSubmitted || grid[row][col].isBlack) return;

    setSelectedCell({ row, col });
    const cell = grid[row][col];

    // Determinar qué pista mostrar
    if (direction === 'across' && cell.acrossClueNum) {
      const clue = across.find((c: any) => c.number === cell.acrossClueNum);
      setSelectedClue({ ...clue, direction: 'across' });
    } else if (direction === 'down' && cell.downClueNum) {
      const clue = down.find((c: any) => c.number === cell.downClueNum);
      setSelectedClue({ ...clue, direction: 'down' });
    } else if (cell.acrossClueNum) {
      const clue = across.find((c: any) => c.number === cell.acrossClueNum);
      setSelectedClue({ ...clue, direction: 'across' });
      setDirection('across');
    } else if (cell.downClueNum) {
      const clue = down.find((c: any) => c.number === cell.downClueNum);
      setSelectedClue({ ...clue, direction: 'down' });
      setDirection('down');
    }

    setTimeout(() => inputRefs.current[row][col]?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (isSubmitted) return;

    if (e.key === 'Backspace' && !grid[row][col].letter) {
      const { newRow, newCol } = moveToPrevCell(row, col);
      if (newRow !== -1 && newCol !== -1) {
        setSelectedCell({ row: newRow, col: newCol });
        setTimeout(() => inputRefs.current[newRow][newCol]?.focus(), 0);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      moveCell(row, col, 0, -1);
      setDirection('across');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      moveCell(row, col, 0, 1);
      setDirection('across');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveCell(row, col, -1, 0);
      setDirection('down');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveCell(row, col, 1, 0);
      setDirection('down');
    } else if (e.key === ' ') {
      e.preventDefault();
      setDirection(prev => prev === 'across' ? 'down' : 'across');
    }
  };

  const moveCell = (row: number, col: number, dRow: number, dCol: number) => {
    let newRow = row + dRow;
    let newCol = col + dCol;

    while (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[0].length) {
      if (!grid[newRow][newCol].isBlack) {
        handleCellClick(newRow, newCol);
        return;
      }
      newRow += dRow;
      newCol += dCol;
    }
  };

  const moveToPrevCell = (row: number, col: number) => {
    if (direction === 'across') {
      for (let c = col - 1; c >= 0; c--) {
        if (!grid[row][c].isBlack && grid[row][c].acrossClueNum === grid[row][col].acrossClueNum) {
          return { newRow: row, newCol: c };
        }
      }
    } else {
      for (let r = row - 1; r >= 0; r--) {
        if (!grid[r][col].isBlack && grid[r][col].downClueNum === grid[row][col].downClueNum) {
          return { newRow: r, newCol: col };
        }
      }
    }
    return { newRow: -1, newCol: -1 };
  };

  const handleInputChange = (row: number, col: number, value: string) => {
    if (isSubmitted) return;

    const newLetter = value.toUpperCase().slice(-1);
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = { ...newGrid[row][col], letter: newLetter };
    setGrid(newGrid);

    if (newLetter) {
      const { newRow, newCol } = moveToNextCell(row, col);
      if (newRow !== -1 && newCol !== -1) {
        setSelectedCell({ row: newRow, col: newCol });
        setTimeout(() => inputRefs.current[newRow][newCol]?.focus(), 0);
      }
    }
  };

  const moveToNextCell = (row: number, col: number) => {
    if (direction === 'across') {
      for (let c = col + 1; c < grid[row].length; c++) {
        if (!grid[row][c].isBlack && grid[row][c].acrossClueNum === grid[row][col].acrossClueNum) {
          return { newRow: row, newCol: c };
        }
      }
    } else {
      for (let r = row + 1; r < grid.length; r++) {
        if (!grid[r][col].isBlack && grid[r][col].downClueNum === grid[row][col].downClueNum) {
          return { newRow: r, newCol: col };
        }
      }
    }
    return { newRow: -1, newCol: -1 };
  };

  const isCellInSelectedWord = (row: number, col: number) => {
    if (!selectedCell) return false;
    const currentCell = grid[selectedCell.row][selectedCell.col];
    const cell = grid[row][col];

    if (direction === 'across') {
      return cell.acrossClueNum === currentCell.acrossClueNum && cell.acrossClueNum !== undefined;
    } else {
      return cell.downClueNum === currentCell.downClueNum && cell.downClueNum !== undefined;
    }
  };

  const renderClues = (clueList: any[], dir: 'across' | 'down') => {
    const Icon = dir === 'across' ? ArrowRight : ArrowDown;
    const color = dir === 'across' ? 'blue' : 'green';

    return (
      <div>
        <h3 className={`text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2`}>
          <span className={`w-8 h-8 bg-${color}-500 text-white rounded flex items-center justify-center`}>
            <Icon className="w-4 h-4" />
          </span>
          {dir === 'across' ? 'Horizontales' : 'Verticales'}
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {clueList.map((clue: any) => {
            const isSelected = selectedClue?.number === clue.number && selectedClue?.direction === dir;
            const userAnswer = getUserAnswer(clue.number, dir);
            const expectedLength = clue.length || clue.answer?.length || 0;
            const isComplete = userAnswer.replace(/_/g, '').length === expectedLength;

            return (
              <button
                key={clue.number}
                onClick={() => {
                  setSelectedClue({ ...clue, direction: dir });
                  setDirection(dir);
                }}
                disabled={isSubmitted}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                } ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className={`font-bold ${dir === 'across' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'} mr-2`}>
                      {clue.number}.
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {clue.clue}
                    </span>
                    <div className="mt-1 text-xs text-gray-500">
                      ({expectedLength} letras)
                    </div>
                  </div>
                  {isComplete && (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <p><strong>💡 Instrucciones:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Haz clic en una celda para comenzar</li>
            <li>Usa las flechas del teclado para moverte</li>
            <li>Presiona Espacio para cambiar entre horizontal y vertical</li>
            <li>Las celdas resaltadas muestran la palabra actual</li>
          </ul>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Grid */}
        <div className="lg:col-span-2">
          <div className="inline-block bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-4 shadow-lg overflow-auto max-w-full">
            <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${grid[0]?.length || 0}, 32px)` }}>
              {grid.map((row, rowIdx) =>
                row.map((cell, colIdx) => {
                  const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
                  const isInWord = isCellInSelectedWord(rowIdx, colIdx);

                  return (
                    <div
                      key={`${rowIdx}-${colIdx}`}
                      onClick={() => handleCellClick(rowIdx, colIdx)}
                      className={`relative w-8 h-8 border border-gray-400 dark:border-gray-600 ${
                        cell.isBlack
                          ? 'bg-gray-900 dark:bg-gray-950'
                          : isSelected
                          ? 'bg-primary-500 dark:bg-primary-600'
                          : isInWord
                          ? 'bg-primary-100 dark:bg-primary-900/30'
                          : 'bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
                      } ${isSubmitted ? 'cursor-not-allowed' : ''}`}
                    >
                      {!cell.isBlack && (
                        <>
                          {cell.number && (
                            <span className="absolute top-0 left-0 text-[8px] font-bold text-primary-600 dark:text-primary-400 pl-0.5">
                              {cell.number}
                            </span>
                          )}
                          <input
                            ref={(el) => {
                              if (inputRefs.current[rowIdx]) {
                                inputRefs.current[rowIdx][colIdx] = el;
                              }
                            }}
                            type="text"
                            value={cell.letter}
                            onChange={(e) => handleInputChange(rowIdx, colIdx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                            disabled={isSubmitted}
                            maxLength={1}
                            className="w-full h-full text-center font-bold text-sm uppercase bg-transparent border-none outline-none text-gray-900 dark:text-white pt-1"
                            style={{ caretColor: 'transparent' }}
                          />
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected Clue Display */}
          {selectedClue && (
            <Card variant="elevated" padding="lg" className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-primary-300 dark:border-primary-700">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className={`w-6 h-6 ${selectedClue.direction === 'across' ? 'text-blue-500' : 'text-green-500'} flex-shrink-0`} />
                  <div className="font-bold text-lg text-gray-900 dark:text-white">
                    {selectedClue.number}. {selectedClue.direction === 'across' ? 'Horizontal' : 'Vertical'}
                  </div>
                  <Badge variant="primary" className="ml-auto">
                    {selectedClue.length || selectedClue.answer?.length || 0} letras
                  </Badge>
                </div>
                <p className="text-gray-800 dark:text-gray-200 text-base font-medium pl-8">
                  {selectedClue.clue}
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Clues */}
        <div className="space-y-6">
          {across.length > 0 && renderClues(across, 'across')}
          {down.length > 0 && renderClues(down, 'down')}
        </div>
      </div>
    </div>
  );
}
