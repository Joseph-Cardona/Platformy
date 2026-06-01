import './App.css';
import { useState } from 'react';
import StartScreen from './components/StartScreen.js';
import Login from './components/Login.js';
import Signup from './components/Signup.js';

function App() {
  const [msg, setMsg] = useState('');

  const send = () => {
    fetch('http://localhost:5000/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg }),
    });
    setMsg('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <StartScreen />
        <Signup />
        <h2>Message Test</h2>
        <input value={msg} onChange={e => setMsg(e.target.value)} />
        <button onClick={send}>Send</button>
      </header>
    </div>
  );
}

export default App;
