import './App.css';
import { useState } from 'react';
import StartScreen from './components/StartScreen.js';
import Login from './components/Login.js';
import Signup from './components/Signup.js';

function App() {
  const [screen, setScreen] = useState('start');

  const switchToLogin = () => {
    setScreen('login');
  }
  const switchToSignup = () => {
    setScreen('signup');
  }

  return (
    <div className="App">
      <header className="App-header">
        {screen === 'start' && (
          <StartScreen loginClicked={switchToLogin} signupClicked={switchToSignup} />
        )}
        
        {screen === 'login' && <Login />}
        {screen === 'signup' && <Signup />}
      </header>
    </div>
  );
}

export default App;
