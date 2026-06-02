import './App.css';
import { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen.js';
import Login from './components/Login.js';
import Signup from './components/Signup.js';

function App() {
  const [screen, setScreen] = useState('start');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser && storedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser) {
          setUser(parsedUser);
          setScreen('start');
        }
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const switchToStartScreen = () => {
    setScreen('start');
  }
  const switchToLogin = () => {
    setScreen('login');
  }
  const switchToSignup = () => {
    setScreen('signup');
  }

  return (
    <div className="App">
      <header className="App-header">
        {user && <p>{user.username}</p>}
        {screen === 'start' && (
          <StartScreen loginClicked={switchToLogin} signupClicked={switchToSignup} />
        )}
        {screen === 'login' && <Login />}
        {screen === 'signup' && (
          <Signup signupMade={switchToStartScreen} />
        )}
      </header>
    </div>
  );
}

export default App;
