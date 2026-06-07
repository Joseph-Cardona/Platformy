import { useState, useEffect, useRef } from 'react';
import kaplay from 'kaplay';

const gameScale = 2;
const tileSize = 8;
const gameWidth = 300;
const gameHeight = 300;

function Editor () {
  const [length, setLength] = useState(5);
  const [height, setHeight] = useState(5);
  let map = Array.from({ length: 20 }, () => new Array(20).fill(0));
  const [blockType, setBlockType] = useState(1);
  const blockTypeRef = useRef(blockType);
  useEffect(() => {
    blockTypeRef.current = blockType;
  }, [blockType]);

  const canvasRef = useRef(null);
  const gameRef = useRef(null);
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

    const tileObjects = map.map((row, r) => {
      return row.map((tileValue, c) => {
        return game.add([
          game.rect(tileSize, tileSize),
          game.pos(c * tileSize, r * tileSize),
          game.color(...getTileColor(tileValue, r, c))
        ]);
      });
    });

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
      if (row < 0 || row >= map.length || col < 0 || col >= map[row].length) {
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
    let prevMouseX = 0;
    let prevMouseY = 0;
    let mouseHasMoved = false;

    const handleMouseDown = (e) => {
      dragging = true;
      mouseHasMoved = false;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      canvas.style.cursor = 'grabbing';
    }

    const handleMouseMove = (e) => {
      if (!dragging) {
        return;
      }
      mouseHasMoved = true;
      const distX = e.clientX - prevMouseX;
      const distY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      const zoomForMove = game.getCamScale().x;
      const cam = game.getCamPos();
      game.setCamPos(cam.x - distX / (zoomForMove * gameScale), cam.y - distY / (zoomForMove * gameScale));
    }

    const handleMouseUp = (e) => {
      if (!mouseHasMoved) {
        const {x, y} = screenToWorld(e.clientX, e.clientY);
        const col = Math.floor(x / tileSize);
        const row = Math.floor(y / tileSize);
        if (row >= 0 && row < map.length && col >= 0 && col < map[row].length) {
          const newVal = blockTypeRef.current;
          map[row][col] = newVal;
          tileObjects[row][col].destroy();
          tileObjects[row][col] = game.add([
            game.rect(tileSize, tileSize),
            game.pos(col * tileSize, row * tileSize),
            game.color(...getTileColor(newVal, row, col)),
          ]);
        }
      }
      dragging = false;
      canvas.style.cursor = 'grab';
    }

    canvas.style.cursor = 'grab';

    canvas.addEventListener('mousemove', handleMouseMoveHover);
    canvas.addEventListener('mouseleave', handleMouseLeaveHover);
    canvas.addEventListener('wheel', handleScrollWheel, {passive: false});
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

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

  const publishLevel = async () => { 
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('ONLY LOGGED IN USERS CAN USE THIS PAGE');
        return;
      }
      const title = 'TEST_TITLE';
      const msg = await fetch('http://localhost:5000/api/newLevel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization' : 'Bearer ' + token,
        },
        body: JSON.stringify({ title, map }),
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
    map = Array.from({ length: height }, () => new Array(length).fill(0));
    console.log(map);
  }

  return (
    <div>
      <h1>Editor</h1>
      <button onClick={() => setBlockType(0)}>Eraser</button>
      <button onClick={() => setBlockType(1)}>Brick</button>
      <button onClick={() => setBlockType(2)}>Wood</button>
      <button onClick={() => setBlockType(3)}>Stone</button>
      <button onClick={publishLevel}>Publish Level</button>
      <button onClick={newMapDimensions}>New Level</button>
      <br />
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

export default Editor;
