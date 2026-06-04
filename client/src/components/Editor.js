import { useEffect, useRef } from 'react';
import kaplay from 'kaplay';

function Editor () {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    if (kaplay.isInitialized && kaplay.isInitialized()) {
      return;
    }

    const game = kaplay({
      width: 300,
      height: 300,
      background: [0, 0, 0],
      scale: 2,
      canvas: canvasRef.current,
      global: false,
    });

    game.add([
      game.text("Editor"),
      game.pos(30, 30),
    ]);

    return () => {
      game.quit();
    }
  }, []);
  return (
    <div>
      <h1>Editor</h1>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

export default Editor;
