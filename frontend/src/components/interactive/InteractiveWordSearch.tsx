'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge } from '@/components/ui';
import { CheckCircle, Search } from 'lucide-react';

interface InteractiveWordSearchProps {
  content: any;
  onComplete: (foundWords: any) => void;
  isSubmitted: boolean;
}

interface FoundWordCells {
  word: string;
  cells: Set<string>;
  color: string;
}

export function InteractiveWordSearch({ content, onComplete, isSubmitted }: InteractiveWordSearchProps) {
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [foundWordsCells, setFoundWordsCells] = useState<FoundWordCells[]>([]);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);

  const words = content.words || [];
  const grid = content.grid || [];

  // Colores para las palabras encontradas
  const colors = [
    'bg-yellow-300 dark:bg-yellow-600',
    'bg-green-300 dark:bg-green-600',
    'bg-blue-300 dark:bg-blue-600',
    'bg-pink-300 dark:bg-pink-600',
    'bg-purple-300 dark:bg-purple-600',
    'bg-orange-300 dark:bg-orange-600',
    'bg-teal-300 dark:bg-teal-600',
    'bg-red-300 dark:bg-red-600',
  ];

  useEffect(() => {
    onComplete(Array.from(foundWords));
  }, [foundWords, onComplete]);

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const handleMouseDown = (row: number, col: number) => {
    if (isSubmitted) return;
    setIsSelecting(true);
    setSelectedCells(new Set([getCellKey(row, col)]));
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isSubmitted || !isSelecting) return;
    setSelectedCells(prev => new Set([...prev, getCellKey(row, col)]));
  };

  const handleMouseUp = () => {
    if (isSubmitted || !isSelecting) return;
    setIsSelecting(false);

    // Obtener las letras seleccionadas y las celdas
    const selectedLetters: string[] = [];
    const cellsArray = Array.from(selectedCells);

    cellsArray.forEach(cellKey => {
      const [row, col] = cellKey.split('-').map(Number);
      if (grid[row] && grid[row][col]) {
        selectedLetters.push(grid[row][col]);
      }
    });

    const selectedWord = selectedLetters.join('');

    // Verificar si la palabra seleccionada está en la lista de palabras
    const matchedWord = words.find((w: any) =>
      w.word.toUpperCase() === selectedWord.toUpperCase() ||
      w.word.toUpperCase() === selectedWord.split('').reverse().join('')
    );

    if (matchedWord && !foundWords.has(matchedWord.word)) {
      const colorIndex = foundWordsCells.length % colors.length;
      setFoundWords(prev => new Set([...prev, matchedWord.word]));
      setFoundWordsCells(prev => [...prev, {
        word: matchedWord.word,
        cells: new Set(cellsArray),
        color: colors[colorIndex]
      }]);
    }

    setSelectedCells(new Set());
  };

  const getCellColor = (row: number, col: number) => {
    const cellKey = getCellKey(row, col);

    // Si está siendo seleccionada actualmente
    if (selectedCells.has(cellKey)) {
      return 'bg-primary-500 border-primary-600 text-white';
    }

    // Si pertenece a una palabra encontrada
    for (const foundWord of foundWordsCells) {
      if (foundWord.cells.has(cellKey)) {
        return `${foundWord.color} border-gray-400 dark:border-gray-500 text-gray-900 dark:text-white font-bold`;
      }
    }

    return 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700';
  };

  const isWordFound = (word: string) => foundWords.has(word);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
        <div className="flex items-center gap-2 justify-center">
          <Search className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Instrucción:</strong> Arrastra el mouse sobre las letras para seleccionar palabras
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Palabras encontradas
          </span>
          <span className="text-sm font-bold text-green-600 dark:text-green-400">
            {foundWords.size} / {words.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((foundWords.size / (words.length || 1)) * 100)}%`
            }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Word List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Search className="w-5 h-5 text-primary-600" />
            Palabras a buscar
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {words.map((wordData: any, idx: number) => {
              const found = isWordFound(wordData.word);
              return (
                <Card
                  key={idx}
                  variant="default"
                  padding="sm"
                  className={`transition-all ${
                    found
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                      : 'bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className={`font-bold ${
                        found
                          ? 'text-green-700 dark:text-green-300 line-through'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {wordData.word}
                      </p>
                      {wordData.hint && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {wordData.hint}
                        </p>
                      )}
                    </div>
                    {found && (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {grid.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Sopa de Letras
            </h3>
            <div className="inline-block bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-4 shadow-inner">
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${grid[0]?.length || 0}, minmax(0, 1fr))` }}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => setIsSelecting(false)}
              >
                {grid.map((row: string[], rowIdx: number) =>
                  row.map((letter: string, colIdx: number) => {
                    const cellKey = getCellKey(rowIdx, colIdx);

                    return (
                      <div
                        key={cellKey}
                        onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
                        onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 border-2 flex items-center justify-center font-bold text-sm sm:text-base transition-all select-none ${getCellColor(rowIdx, colIdx)} ${
                          selectedCells.has(cellKey) ? 'scale-110' : ''
                        } ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {letter}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
              Arrastra el mouse sobre las letras para seleccionar palabras
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
