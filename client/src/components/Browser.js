import { useState, useEffect } from 'react';

function Browser () {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getLevels = async () => { 
      try {
        const msg = await fetch('http://localhost:5000/api/levels');
        const data = await msg.json();
        if (msg.ok && data.success) {
          setLevels(data.levels);
        } else {
          setError(data.error || 'Loading failed');
        }
      } catch (err) {
        alert('NETWORK ERROR: THE SERVER MIGHT NOT BE UP');
      } finally {
        setLoading(false);
      }
    }
    getLevels();
  }, []);

  if (loading) {
    return (
      <div>
        <h1>Level Browser</h1>
        <p>LOADING THE LEVELS</p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1>Level Browser</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Level Browser</h1>
      <div>
        {levels.map((level) => (
          <div key={level.id} class='level-post'>
            <h2>{level.title}</h2>
            <p>By: {level.username}</p>
            <p>Description: {level.description}</p>
            <p>Published: {new Date(level.created_at).toLocaleDateString()}</p>
            <button onClick={() => alert('add later')}>Play</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Browser;
