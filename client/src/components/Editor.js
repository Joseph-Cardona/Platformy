import { useState, useEffect, useRef } from 'react';
import kaplay from 'kaplay';

const gameScale = 2;
const tileSize = 8;
const gameWidth = 300;
const gameHeight = 300;

function Editor () {
  const [length, setLength] = useState(5);
  const [height, setHeight] = useState(5);
  const mapRef = useRef(Array.from({ length: 20}, () => new Array(20).fill(0)));
  const [blockType, setBlockType] = useState(1);
  const blockTypeRef = useRef(blockType);
  useEffect(() => {
    blockTypeRef.current = blockType;
  }, [blockType]);

  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const tileObjectsRef = useRef([]);
  const rebuildMapRef = useRef(null);

  const [showLoadModel, setShowLoadModel] = useState(false);
  const [myLevels, setMyLevels] = useState([]);
  const [loadingLevels, setLoadingLevels] = useState(false);

  const tileColors = {
    1: [100, 0, 0],
    2: [128, 90, 64],
    3: [60, 60, 60]
  }

  const checkerColors = [
    [200, 200, 200],
    [255, 255, 255],
  ];

  const getTileColor = (tileValue, r, c) => {
    return tileValue === 0 ? checkerColors[(r + c) % 2] : tileColors[tileValue] ?? [255, 0, 2];
  }

  useEffect(() => {
    if (!canvasRef.current || gameRef.current) {
      return;
    }

    if (kaplay.isInitialized && kaplay.isInitialized()) {
      return;
    }

    const game = kaplay({
      width: gameWidth,
      height: gameHeight,
      background: [0, 0, 0],
      scale: gameScale,
      canvas: canvasRef.current,
      global: false,
      debug: false,
      loadingScreen: false,
    });

    gameRef.current = game;
    const canvas = canvasRef.current;

    const tileObjects = mapRef.current.map((row, r) => {
      return row.map((tileValue, c) => {
        return game.add([
          game.rect(tileSize, tileSize),
          game.pos(c * tileSize, r * tileSize),
          game.color(...getTileColor(tileValue, r, c))
        ]);
      });
    });
    tileObjectsRef.current = tileObjects;

    let overlay = null;

    const screenToWorld = (screenX, screenY) => {
      const rect = canvas.getBoundingClientRect();
      const zoom = game.getCamScale().x;
      const cam = game.getCamPos();
      const localX = (screenX - rect.left) / gameScale;
      const localY = (screenY - rect.top) / gameScale;
      const worldX = localX / zoom + cam.x - (gameWidth / 2) / zoom;
      const worldY = localY / zoom + cam.y - (gameHeight / 2) / zoom;
      return {x: worldX, y: worldY}
    }

    const handleMouseMoveHover = (e) => {
      const {x, y} = screenToWorld(e.clientX, e.clientY);
      const col = Math.floor(x / tileSize);
      const row = Math.floor(y / tileSize);
      if (overlay) {
        overlay.destroy();
        overlay = null;
      }
      if (row < 0 || row >= mapRef.current.length || col < 0 || col >= mapRef.current[row].length) {
        return;
      }
      overlay = game.add([
        game.rect(tileSize, tileSize),
        game.pos(col * tileSize, row * tileSize),
        game.color(255, 255, 0),
        game.opacity(0.3),
      ]);
    }

    const handleMouseLeaveHover = (e) => {
      if (overlay) {
        overlay.destroy();
        overlay = null;
      }
    }

    const handleScrollWheel = (e) => {
      e.preventDefault();
      const zoomSpeed = 0.001;
      const zoom = game.getCamScale();
      const delta = -e.deltaY * zoomSpeed;
      const newZoom = Math.max(0.1, Math.min(10, zoom.x + delta));
      game.setCamScale(newZoom);
    }

    let dragging = false;
    let painting = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let mouseHasMoved = false;
    let lastPaintedCol = -1;
    let lastPaintedRow = -1;

    const paintAtCursor = (e) => {
      const {x, y} = screenToWorld(e.clientX, e.clientY);
      const col = Math.floor(x / tileSize);
      const row = Math.floor(y / tileSize);
      if (row < 0 || row >= mapRef.current.length || col < 0 || col >= mapRef.current[row].length) {
        return;
      }
      if (col === lastPaintedCol && row === lastPaintedRow) {
        return;
      }
      lastPaintedCol = col;
      lastPaintedRow = row;
      mapRef.current[row][col] = blockTypeRef.current;
      tileObjects[row][col].destroy();
      tileObjects[row][col] = game.add([
        game.rect(tileSize, tileSize),
        game.pos(col * tileSize, row * tileSize),
        game.color(...getTileColor(mapRef.current[row][col], row, col)),
      ]);
    }

    const handleMouseDown = (e) => {
      if (e.shiftKey) {
        dragging = true;
        painting = false;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
        canvas.style.cursor = 'grabbing';
        if (overlay) {
          overlay.destroy();
          overlay = null;
        }
      } else {
        dragging = false;
        painting = true;
        lastPaintedCol = -1;
        lastPaintedRow = -1;
        paintAtCursor(e);
      }
    }

    const handleMouseMove = (e) => {
      if (dragging) {
        mouseHasMoved = true;
        const distX = e.clientX - prevMouseX;
        const distY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
        const zoomForMove = game.getCamScale().x;
        const cam = game.getCamPos();
        game.setCamPos(cam.x - distX / (zoomForMove * gameScale), cam.y - distY / (zoomForMove * gameScale));
      } else if (painting) {
        paintAtCursor(e);
      }
    }

    const handleMouseUp = (e) => {
      dragging = false;
      canvas.style.cursor = 'grab';
      painting = false;
      lastPaintedCol = -1;
      lastPaintedRow = -1;
    }

    canvas.style.cursor = 'grab';

    canvas.addEventListener('mousemove', handleMouseMoveHover);
    canvas.addEventListener('mouseleave', handleMouseLeaveHover);
    canvas.addEventListener('wheel', handleScrollWheel, {passive: false});
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    const rebuildMap = (newMapData) => {
      if (!game) {
        return;
      }
      tileObjectsRef.current.froEach(row => {
        if (row) row.forEach(tile => {
          if (tile && typeof tile.destroy === 'function') {
            tile.destroy();
          }
        });
      });

      mapRef.current = newMapData.map(row => [...row]);
      setLength(mapRef.current.length);
      setHeight(mapRef.current[0]?.length);

      const newTiles = mapRef.current.map((row, r) =>
        row.map((tileValue, c) =>
          game.add([
            game.rect(tileSize, tileSize),
            game.pos(c * tileSize, r * tileSize),
            game.color(...getTileColor(tileValue, r, c))
          ])
        )
      );
      tileObjectsRef.current = newTiles;
      game.setCamPos((mapRef.current.length * tileSize) / 2, (mapRef.current[0]?.length * tileSize) / 2);
      game.setCamScale(1);
    }

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMoveHover);
      canvas.removeEventListener('mouseleave', handleMouseLeaveHover);
      canvas.removeEventListener('wheel', handleScrollWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      game.quit();
      gameRef.current = null;
    }
  }, []);

  const loadLevelIntoEditor = (level) => {
    if (!level.map || !Array.isArray(level.map)) {
      if (!level.map || !Array.isArray(level.map)) {
        alert('Broken level data');
        return;
      }
      if (rebuildMapRef.current) {
        rebuildMapRef.current(level.map);
      } else {
        mapRef.current = level.map;
        setHeight(level.map.length);
        setLength(level.map[0]?.length);
      }
    }
  }

  const openLoadModel = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Login first');
      return;
    }
    setShowLoadModel(true);
    setLoadingLevels(true);
    try {
      const res = await fetch('http://localhost:5000/api/usersLevels', {
        headers: { Authorization: 'Bearer ' + token }
      });
      const data = await res.json;
      if (data.success) {
        setMyLevels(data.levels);
      } else {
        alert(data.error || 'Levels didnt load');
      }
    } catch {
      alert('Network Error');
    } finally {
      setLoadingLevels(false);
    }
  }

  const selectLevel = async (levelId) => {
    setShowLoadModel(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:500/api/getLevelById', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ level_id: levelId })
      });
      const data = await res.json();
      if (data.success && data.level) {
        loadLevelIntoEditor(data.level);
      } else {
        alert(data.error || 'Level didnt load');
      }
    } catch {
      alert('Loading error');
    }
  }

  const publishLevel = async () => { 
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('ONLY LOGGED IN USERS CAN USE THIS PAGE');
        return;
      }
      const title = prompt('Enter your level\'s title: ') || 'New Level';
      const description = prompt('Enter your level\'s description: ') || '';
      const msg = await fetch('http://localhost:5000/api/newLevel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization' : 'Bearer ' + token,
        },
        body: JSON.stringify({ title, description, map: mapRef.current }),
      });
      const data = await msg.json();
      if (msg.ok) {
        alert('New level published with ID: ' + data.level.id);
      } else {
        alert(data.error || 'LEVEL PUBLISHING FAILED TRY AGAIN');
      }
    } catch (err) {
      alert('NETWORK ERROR: THE SERVER MIGHT NOT BE UP');
    }
  }

  const newMapDimensions = () => {
    setLength(parseInt(prompt('Enter a new length: ')));
    setHeight(parseInt(prompt('Enter a new height: ')));
    mapRef.current = Array.from({ length: height }, () => new Array(length).fill(0));
    console.log(mapRef.current);
  }

  return (
    <div>
      <h1>Editor</h1>
      <br />
      <button onClick={() => setBlockType(0)}>Eraser</button>
      <button onClick={() => setBlockType(1)}>Brick</button>
      <button onClick={() => setBlockType(2)}>Wood</button>
      <button onClick={() => setBlockType(3)}>Stone</button>
      <button onClick={publishLevel}>Publish Level</button>
      <button onClick={newMapDimensions}>New Level</button>
      <br />
      <canvas ref={canvasRef}></canvas>
      {showLoadModel && (
        <div>
          <div>
            <div>
              <h2>Load a Level</h2>
              <button onClick={() => setShowLoadModel(false)}>yup</button>
            </div>
            {loadingLevels ? (
              <p>Loading the levels</p>
            ) : myLevels.length === 0 ? (
              <p>You don't have any levels to load</p>
            ) : (
              <div>
                {myLevels.map((level) => (
                  <div key={level.id} onClick={() => selectLevel(level.id)}>
                    <h3>{level.title}</h3>
                    <p>{level.description}</p>
                    <div>
                      Size: {(level.map?.[0]?.length)} x {level.map?.length};
                      <br />
                      Last updated: {new Date(level.updated_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Editor;
