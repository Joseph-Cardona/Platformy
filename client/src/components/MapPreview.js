import { useRef, useEffect } from 'react';

function MapPreview({ map: rawMap }) {
  const canvasRef = useRef(null);
  const map = (() => {
    if (!rawMap) {
      return null;
    }
    if (Array.isArray(rawMap)) {
      return rawMap;
    }
    if (typeof rawMap === 'string') {
      try {
        const parsedMap = JSON.parse(rawMap);
        return Array.isArray(parsedMap) ? parsedMap : null;
      } catch {
        return null;
      }
    }
    return null;
  })();

  useEffect(() => {
    if (!canvasRef.current || !map || !Array.isArray(map) || map.length === 0) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    const rows = map.length;
    const cols = map[0]?.length || 0;

    if (cols === 0) {
      return;
    }

    const tileSize = 5;
    canvas.width = cols * tileSize;
    canvas.height = rows * tileSize;
    const tileColors = {
      1: '#640000',
      2: '#805a40',
      3: '#3c3c3c',
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let color;
        const val = map[r]?.[c];
        if (val === 0) {
          color = (r + c) % 2 === 0 ? '#c8c8c8' : '#ffffff';
        } else {
          color = tileColors[val] || '#ff0000';
        }
        ctx.fillStyle = color;
        ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
      }
    }
  }, [map]);
  if (!map || !Array.isArray(map) || map.length === 0) {
    return <div>Map Broken</div>;
  }

  return (
    <canvas ref={canvasRef} />
  );
}

export default MapPreview;
