import React, { useRef, useCallback } from 'react';
import { StyleSheet, View, PanResponder, Text, Dimensions } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface Point {
  x: number;
  y: number;
}

interface ScribbleCanvasProps {
  onLetterDrawn?: (letter: string) => void;
}

const GRID_COLS = 5;
const GRID_ROWS = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function pointsToGridCells(points: Point[], width: number, height: number): Set<string> {
  const cellW = width / GRID_COLS;
  const cellH = height / GRID_ROWS;
  const cells = new Set<string>();
  for (const p of points) {
    const col = Math.min(Math.floor(p.x / cellW), GRID_COLS - 1);
    const row = Math.min(Math.floor(p.y / cellH), GRID_ROWS - 1);
    if (col >= 0 && row >= 0) cells.add(`${row},${col}`);
  }
  return cells;
}

function getDirectionSequence(points: Point[]): string {
  if (points.length < 3) return '';
  const dirs: string[] = [];
  const step = Math.max(1, Math.floor(points.length / 12));
  for (let i = step; i < points.length; i += step) {
    const dx = points[i].x - points[i - step].x;
    const dy = points[i].y - points[i - step].y;
    if (Math.abs(dx) < 5 && Math.abs(dy) < 5) continue;
    let dir = '';
    if (Math.abs(dy) > Math.abs(dx)) {
      dir = dy > 0 ? 'D' : 'U';
    } else {
      dir = dx > 0 ? 'R' : 'L';
    }
    if (dirs.length === 0 || dirs[dirs.length - 1] !== dir) {
      dirs.push(dir);
    }
  }
  return dirs.join('');
}

function recognizeLetter(points: Point[], canvasW: number, canvasH: number): string {
  if (points.length < 4) return '';

  const dirs = getDirectionSequence(points);
  const start = points[0];
  const end = points[points.length - 1];
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  const midY = canvasH / 2;
  const midX = canvasW / 2;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const bboxW = maxX - minX;
  const bboxH = maxY - minY;
  const aspect = bboxH > 0 ? bboxW / bboxH : 1;

  // Padrões baseados na sequência direcional do traço
  if (dirs === 'D') return 'I';
  if (dirs === 'U') return 'I';
  if (dirs === 'R') return '-';
  if (dirs === 'L') return '-';

  if (dirs === 'DR') return 'L';
  if (dirs === 'RD') return 'L';
  if (dirs === 'DRD') return 'U';
  if (dirs === 'URU') return 'N';

  if (dirs === 'RDLU' || dirs === 'RDLUR') return 'O';
  if (dirs === 'DLUR' || dirs === 'DLURD') return 'O';
  if (dirs === 'DRUL') return 'D';
  if (dirs === 'RULD') return 'D';

  if (dirs === 'DRUR' || dirs === 'DRURD') return 'J';
  if (dirs === 'RDR') return 'Z';
  if (dirs === 'RDRD') return 'Z';
  if (dirs === 'LDL') return 'S';
  if (dirs === 'LDLD') return 'S';
  if (dirs === 'RDLDR') return 'S';

  if (dirs === 'DRDL' || dirs === 'DRD') return 'U';
  if (dirs === 'URDL') return 'N';
  if (dirs === 'DURD') return 'N';
  if (dirs === 'DURDUR') return 'M';
  if (dirs === 'DURDU') return 'M';

  if (dirs === 'RDL') return 'P';
  if (dirs === 'RDLRDL') return 'B';
  if (dirs === 'RDLD') return 'P';

  if (dirs === 'DRU') return aspect > 0.8 ? 'V' : 'U';
  if (dirs === 'DRURD') return 'W';
  if (dirs === 'DRUDR') return 'W';

  if (dirs === 'DLDR') return 'X';
  if (dirs === 'DRDL') return 'Y';

  if (dirs === 'RL' || dirs === 'RLR') return 'C';
  if (dirs === 'LR' || dirs === 'LRL') return 'C';

  if (dirs === 'DRDR') return 'K';
  if (dirs === 'DR' || dirs === 'DRD') return 'K';

  if (dirs === 'RDR' && aspect > 0.6) return 'Z';

  // Análise geométrica para letras ambíguas
  if (bboxH > bboxW * 2) {
    if (dirs.includes('D') && dirs.length <= 2) return 'I';
  }

  if (aspect > 1.5 && dirs.length <= 3) return 'T';

  // Fallback: letra baseada na posição do primeiro toque na grade 5x6
  const cells = pointsToGridCells(points, canvasW, canvasH);
  const firstCol = Math.min(Math.floor(start.x / (canvasW / GRID_COLS)), GRID_COLS - 1);
  const firstRow = Math.min(Math.floor(start.y / (canvasH / GRID_ROWS)), GRID_ROWS - 1);
  const gridIndex = firstRow * GRID_COLS + firstCol;
  if (gridIndex >= 0 && gridIndex < ALPHABET.length) {
    return ALPHABET[gridIndex];
  }

  return '';
}

export function ScribbleCanvas({ onLetterDrawn }: ScribbleCanvasProps) {
  const { currentTheme } = useTheme();
  const pathRef = useRef<Point[]>([]);
  const [displayChar, setDisplayChar] = React.useState('');
  const [dots, setDots] = React.useState<Point[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { width: screenW, height: screenH } = Dimensions.get('window');

  const clearCanvas = useCallback(() => {
    setDots([]);
    pathRef.current = [];
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        const { locationX, locationY } = evt.nativeEvent;
        pathRef.current = [{ x: locationX, y: locationY }];
        setDots([{ x: locationX, y: locationY }]);
        setDisplayChar('');
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const point = { x: locationX, y: locationY };
        pathRef.current.push(point);
        setDots((prev) => [...prev, point]);
      },
      onPanResponderRelease: () => {
        const points = pathRef.current;
        if (points.length >= 4) {
          const letter = recognizeLetter(points, screenW, screenH);
          if (letter) {
            setDisplayChar(letter);
            onLetterDrawn?.(letter);
          }
        }
        timeoutRef.current = setTimeout(() => {
          setDots([]);
          pathRef.current = [];
        }, 1000);
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {displayChar !== '' && (
        <View style={styles.overlayContainer} pointerEvents="none">
          <Text style={[styles.drawnCharText, { color: currentTheme.accent }]}>
            {displayChar}
          </Text>
        </View>
      )}

      {dots.map((p, idx) => (
        <View
          key={idx}
          style={[
            styles.dot,
            {
              left: p.x - 3,
              top: p.y - 3,
              backgroundColor: currentTheme.accent,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawnCharText: {
    fontSize: 120,
    fontWeight: '200',
    opacity: 0.25,
  },
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.6,
  },
});
